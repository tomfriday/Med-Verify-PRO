const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — ADMIN only
router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const totalUsers = await db('users').count('id as count').first();
        const totalDoctors = await db('users').where({ role: 'DOCTOR' }).count('id as count').first();
        const totalPatients = await db('users').where({ role: 'PATIENT' }).count('id as count').first();

        const appointmentsByStatus = await db('appointments')
            .select('status')
            .count('id as count')
            .groupBy('status');

        const totalAppointments = await db('appointments').count('id as count').first();

        res.json({
            stats: {
                users: {
                    total: totalUsers.count,
                    doctors: totalDoctors.count,
                    patients: totalPatients.count
                },
                appointments: {
                    total: totalAppointments.count,
                    byStatus: appointmentsByStatus.reduce((acc, row) => {
                        acc[row.status] = row.count;
                        return acc;
                    }, {})
                }
            }
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// GET /api/admin/audit-logs — ADMIN only (paginated)
router.get('/audit-logs', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = (page - 1) * limit;

        const logs = await db('audit_logs')
            .leftJoin('users', 'audit_logs.user_id', 'users.id')
            .select(
                'audit_logs.id',
                'audit_logs.action',
                'audit_logs.resource',
                'audit_logs.details',
                'audit_logs.ip_address',
                'audit_logs.created_at',
                'users.email as user_email',
                'users.full_name as user_name'
            )
            .orderBy('audit_logs.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const total = await db('audit_logs').count('id as count').first();

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total: total.count,
                pages: Math.ceil(total.count / limit)
            }
        });
    } catch (err) {
        console.error('Audit logs error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

module.exports = router;
