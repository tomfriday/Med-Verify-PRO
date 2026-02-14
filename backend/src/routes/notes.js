const express = require('express');
const db = require('../db');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

// POST /api/appointments/:id/notes — DOCTOR creates note (appointment must be COMPLETED)
router.post('/:id/notes', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const appointment = await db('appointments').where({ id: req.params.id }).first();
        if (!appointment) return res.status(404).json({ error: 'Wizyta nie znaleziona.' });
        if (appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'Nie masz uprawnień do tej wizyty.' });
        }
        if (appointment.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Notatki można dodawać tylko do zakończonych wizyt.' });
        }

        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Treść notatki jest wymagana.' });
        }

        const [note] = await db('medical_notes').insert({
            appointment_id: appointment.id,
            doctor_id: req.user.id,
            patient_id: appointment.patient_id,
            content: content.trim()
        }).returning('*');

        await auditLog(req, 'CREATE_NOTE', 'medical_notes', `Doctor ${req.user.id} created note for appointment ${req.params.id}`);
        res.status(201).json({ note: typeof note === 'object' ? note : { id: note } });
    } catch (err) {
        console.error('Create note error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// GET /api/appointments/:id/notes — DOCTOR only, PATIENT → 403
router.get('/:id/notes', authenticate, async (req, res) => {
    try {
        const appointment = await db('appointments').where({ id: req.params.id }).first();
        if (!appointment) return res.status(404).json({ error: 'Wizyta nie znaleziona.' });

        // PATIENT is strictly forbidden
        if (req.user.role === 'PATIENT') {
            console.warn(`[${new Date().toISOString()}] UNAUTHORIZED: Patient ${req.user.id} tried to access medical notes for appointment ${req.params.id}`);
            await auditLog(req, 'UNAUTHORIZED_NOTES_ACCESS', 'medical_notes', `Patient ${req.user.id} tried to read notes for appointment ${req.params.id}`);
            return res.status(403).json({ error: 'Pacjent nie ma dostępu do notatek lekarskich.' });
        }

        // Only the doctor who owns the appointment can read
        if (req.user.role === 'DOCTOR' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'Nie masz uprawnień do notatek tej wizyty.' });
        }

        const notes = await db('medical_notes')
            .where({ appointment_id: req.params.id })
            .orderBy('created_at', 'desc');

        res.json({ notes });
    } catch (err) {
        console.error('Get notes error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// PUT /api/appointments/:id/notes/:noteId — DOCTOR edits own note
router.put('/:id/notes/:noteId', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const note = await db('medical_notes').where({ id: req.params.noteId, appointment_id: req.params.id }).first();
        if (!note) return res.status(404).json({ error: 'Notatka nie znaleziona.' });
        if (note.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'Nie masz uprawnień do edycji tej notatki.' });
        }

        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Treść notatki jest wymagana.' });
        }

        await db('medical_notes').where({ id: req.params.noteId }).update({ content: content.trim(), updated_at: new Date().toISOString() });
        await auditLog(req, 'UPDATE_NOTE', 'medical_notes', `Doctor ${req.user.id} updated note ${req.params.noteId}`);
        res.json({ message: 'Notatka zaktualizowana.' });
    } catch (err) {
        console.error('Update note error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

module.exports = router;
