const express = require('express');
const db = require('../db');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

// GET /api/doctors — public search with filter + sort
router.get('/', async (req, res) => {
    try {
        const { specialization, sortBy, order, search } = req.query;
        let query = db('users').where({ role: 'DOCTOR' }).select('id', 'full_name', 'specialization', 'price', 'rating');

        if (search && search.trim()) {
            query = query.where('full_name', 'like', `%${search.trim()}%`);
        }

        if (specialization) {
            query = query.where('specialization', specialization);
        }

        const validSort = ['price', 'rating'];
        const validOrder = ['asc', 'desc'];
        if (sortBy && validSort.includes(sortBy)) {
            query = query.orderBy(sortBy, validOrder.includes(order) ? order : 'asc');
        } else {
            query = query.orderBy('full_name', 'asc');
        }

        const doctors = await query;
        res.json({ doctors });
    } catch (err) {
        console.error('Doctors search error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// POST /api/doctors/slots — DOCTOR creates slots
router.post('/slots', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const { date, startHour, endHour, durationMinutes } = req.body;
        if (!date || startHour === undefined || endHour === undefined) {
            return res.status(400).json({ error: 'Data, godzina początku i końca są wymagane.' });
        }
        const duration = durationMinutes || 15;
        const slots = [];
        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += duration) {
                const start = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
                const end = new Date(start.getTime() + duration * 60000);
                slots.push({
                    doctor_id: req.user.id,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    is_available: true
                });
            }
        }

        // Check for conflicts
        for (const slot of slots) {
            const conflict = await db('slots')
                .where({ doctor_id: req.user.id, start_time: slot.start_time })
                .first();
            if (conflict) {
                return res.status(409).json({ error: `Slot ${slot.start_time} już istnieje.` });
            }
        }

        await db('slots').insert(slots);
        await auditLog(req, 'CREATE_SLOTS', 'slots', `Doctor ${req.user.id} created ${slots.length} slots for ${date}`);
        res.status(201).json({ message: `Utworzono ${slots.length} slotów.`, count: slots.length });
    } catch (err) {
        console.error('Create slots error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// GET /api/doctors/slots — DOCTOR views own slots
router.get('/slots', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const slots = await db('slots')
            .where({ doctor_id: req.user.id })
            .orderBy('start_time', 'asc');
        res.json({ slots });
    } catch (err) {
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// DELETE /api/doctors/slots/:id — DOCTOR deletes own slot
router.delete('/slots/:id', authenticate, authorize('DOCTOR'), async (req, res) => {
    try {
        const slot = await db('slots').where({ id: req.params.id, doctor_id: req.user.id }).first();
        if (!slot) {
            return res.status(404).json({ error: 'Slot nie znaleziony.' });
        }
        if (!slot.is_available) {
            return res.status(400).json({ error: 'Nie można usunąć zarezerwowanego slotu. Najpierw odwołaj wizytę.' });
        }

        await db('slots').where({ id: req.params.id }).del();
        await auditLog(req, 'DELETE_SLOT', 'slots', `Doctor ${req.user.id} deleted slot ${req.params.id}`);
        res.json({ message: 'Slot usunięty.' });
    } catch (err) {
        console.error('Delete slot error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// GET /api/doctors/:id/slots — available slots for a specific doctor
router.get('/:id/slots', async (req, res) => {
    try {
        const slots = await db('slots')
            .where({ doctor_id: req.params.id, is_available: true })
            .where('start_time', '>', new Date().toISOString())
            .orderBy('start_time', 'asc');
        res.json({ slots });
    } catch (err) {
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

module.exports = router;
