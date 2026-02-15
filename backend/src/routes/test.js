/**
 * Test Data Reset Endpoint — ONLY available in test/development environment.
 * Resets the database to a known state for test isolation.
 */
const express = require('express');
const db = require('../db');

const router = express.Router();

// POST /api/test/reset — Reset database to seed state
router.post('/reset', async (req, res) => {
    // Safety check: only allow in non-production
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Forbidden in production.' });
    }

    try {
        // Clear transactional data (order matters for FK constraints)
        await db('audit_logs').del();
        await db('medical_notes').del();
        await db('appointments').del();
        await db('slots').del();

        // Re-run seeds using existing connection (avoids locks)
        const seedModule = require('../../seeds/001_seed');
        await seedModule.seed(db);

        res.json({
            message: 'Database reset to seed state.',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Test reset error:', err);
        res.status(500).json({ error: 'Reset failed.', details: err.message });
    }
});

// GET /api/test/health — Verify test environment
router.get('/health', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV || 'development',
        testMode: true,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
