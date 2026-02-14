const express = require('express');
const db = require('../db');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

// POST /api/appointments — PATIENT books a slot
router.post('/', authenticate, authorize('PATIENT'), async (req, res) => {
    try {
        const { slot_id } = req.body;
        if (!slot_id) return res.status(400).json({ error: 'slot_id jest wymagany.' });

        const slot = await db('slots').where({ id: slot_id }).first();
        if (!slot) return res.status(404).json({ error: 'Slot nie istnieje.' });
        if (!slot.is_available) return res.status(409).json({ error: 'Slot jest już zarezerwowany.' });
        if (new Date(slot.start_time) <= new Date()) {
            return res.status(400).json({ error: 'Nie można rezerwować slotów z przeszłości.' });
        }

        // Double booking check
        const existing = await db('appointments')
            .where({ slot_id, status: 'PENDING' })
            .orWhere({ slot_id, status: 'CONFIRMED' })
            .first();
        if (existing) {
            return res.status(409).json({ error: 'Ten slot jest już zarezerwowany (double booking).' });
        }

        await db('slots').where({ id: slot_id }).update({ is_available: false });

        const [appointment] = await db('appointments').insert({
            slot_id,
            patient_id: req.user.id,
            doctor_id: slot.doctor_id,
            status: 'PENDING'
        }).returning('*');

        await auditLog(req, 'BOOK_APPOINTMENT', 'appointments', `Patient ${req.user.id} booked slot ${slot_id}`);
        res.status(201).json({ appointment: typeof appointment === 'object' ? appointment : { id: appointment } });
    } catch (err) {
        console.error('Book appointment error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// GET /api/appointments — own appointments (role-filtered)
router.get('/', authenticate, async (req, res) => {
    try {
        let query = db('appointments')
            .join('slots', 'appointments.slot_id', 'slots.id')
            .join('users as doctor', 'appointments.doctor_id', 'doctor.id')
            .join('users as patient', 'appointments.patient_id', 'patient.id');

        if (req.user.role === 'PATIENT') {
            query = query.where('appointments.patient_id', req.user.id);
        } else if (req.user.role === 'DOCTOR') {
            query = query.where('appointments.doctor_id', req.user.id);
        }
        // ADMIN sees all

        const appointments = await query.select(
            'appointments.id',
            'appointments.status',
            'appointments.created_at',
            'slots.start_time',
            'slots.end_time',
            'doctor.full_name as doctor_name',
            'doctor.specialization as doctor_specialization',
            'patient.full_name as patient_name',
            'appointments.doctor_id',
            'appointments.patient_id'
        ).orderBy('slots.start_time', 'desc');

        res.json({ appointments });
    } catch (err) {
        console.error('Get appointments error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// PATCH /api/appointments/:id/status — DOCTOR changes status
router.patch('/:id/status', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status musi być jednym z: ${validStatuses.join(', ')}` });
        }

        const appointment = await db('appointments').where({ id: req.params.id }).first();
        if (!appointment) return res.status(404).json({ error: 'Wizyta nie znaleziona.' });
        if (appointment.doctor_id !== req.user.id) {
            logUnauthorized(req, `Doctor ${req.user.id} tried to modify appointment ${req.params.id} owned by doctor ${appointment.doctor_id}`);
            return res.status(403).json({ error: 'Nie masz uprawnień do tej wizyty.' });
        }

        await db('appointments').where({ id: req.params.id }).update({ status, updated_at: new Date().toISOString() });

        // If cancelled, free the slot
        if (status === 'CANCELLED') {
            await db('slots').where({ id: appointment.slot_id }).update({ is_available: true });
        }

        await auditLog(req, 'UPDATE_STATUS', 'appointments', `Appointment ${req.params.id} → ${status}`);
        res.json({ message: `Status zmieniony na ${status}.` });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// DELETE /api/appointments/:id — PATIENT cancels (≥24h before)
router.delete('/:id', authenticate, authorize('PATIENT'), async (req, res) => {
    try {
        const appointment = await db('appointments')
            .join('slots', 'appointments.slot_id', 'slots.id')
            .where('appointments.id', req.params.id)
            .select('appointments.*', 'slots.start_time', 'slots.id as sid')
            .first();

        if (!appointment) return res.status(404).json({ error: 'Wizyta nie znaleziona.' });
        if (appointment.patient_id !== req.user.id) {
            return res.status(403).json({ error: 'Nie masz uprawnień do tej wizyty.' });
        }

        const hoursUntil = (new Date(appointment.start_time) - new Date()) / 3600000;
        if (hoursUntil < 24) {
            return res.status(400).json({ error: 'Anulowanie możliwe tylko do 24h przed wizytą.' });
        }

        await db('appointments').where({ id: req.params.id }).update({ status: 'CANCELLED', updated_at: new Date().toISOString() });
        await db('slots').where({ id: appointment.sid }).update({ is_available: true });

        await auditLog(req, 'CANCEL_APPOINTMENT', 'appointments', `Patient ${req.user.id} cancelled appointment ${req.params.id}`);
        res.json({ message: 'Wizyta anulowana.' });
    } catch (err) {
        console.error('Cancel appointment error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

function logUnauthorized(req, message) {
    console.warn(`[${new Date().toISOString()}] UNAUTHORIZED: ${message}`);
}

module.exports = router;
