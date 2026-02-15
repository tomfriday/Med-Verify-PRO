const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const notesRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointments', notesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/test', require('./routes/test'));

// --- Health check ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Auto-expiry cron: every 10 minutes, expire PENDING appointments from the past ---
cron.schedule('*/10 * * * *', async () => {
    try {
        const now = new Date().toISOString();
        const expired = await db('appointments')
            .join('slots', 'appointments.slot_id', 'slots.id')
            .where('slots.start_time', '<', now)
            .whereIn('appointments.status', ['PENDING'])
            .select('appointments.id');

        if (expired.length > 0) {
            const ids = expired.map(a => a.id);
            await db('appointments').whereIn('id', ids).update({ status: 'EXPIRED', updated_at: now });
            // Free the slots
            const appointmentRows = await db('appointments').whereIn('id', ids).select('slot_id');
            const slotIds = appointmentRows.map(a => a.slot_id);
            await db('slots').whereIn('id', slotIds).update({ is_available: true });
            console.log(`[CRON] Expired ${ids.length} appointments: ${ids.join(', ')}`);
        }
    } catch (err) {
        console.error('[CRON] Auto-expiry error:', err.message);
    }
});

// --- Start ---
app.listen(PORT, () => {
    console.log(`Med-Verify PRO backend running on http://localhost:${PORT}`);
});

module.exports = app;
