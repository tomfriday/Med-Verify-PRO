const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, JWT_SECRET, auditLog } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Email, hasło i imię są wymagane.' });
        }
        const existing = await db('users').where({ email }).first();
        if (existing) {
            return res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje.' });
        }
        const password_hash = bcrypt.hashSync(password, 10);
        const [user] = await db('users').insert({
            email,
            password_hash,
            full_name,
            role: 'PATIENT'
        }).returning(['id', 'email', 'role', 'full_name']);

        const u = typeof user === 'object' ? user : { id: user, email, role: 'PATIENT', full_name };
        const token = jwt.sign({ id: u.id, email: u.email, role: u.role, full_name: u.full_name }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 });
        await auditLog(req, 'REGISTER', 'users', `New patient: ${email}`);
        res.status(201).json({ user: u });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email i hasło są wymagane.' });
        }
        const user = await db('users').where({ email }).first();
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            await auditLog(req, 'LOGIN_FAILED', 'auth', `Failed login for: ${email}`);
            return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
        }
        const payload = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 });
        await auditLog(req, 'LOGIN', 'auth', `User logged in: ${email}`);
        res.json({ user: payload });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Wylogowano.' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await db('users').where({ id: req.user.id }).select('id', 'email', 'role', 'full_name', 'specialization', 'avatar_url', 'phone_number').first();
        if (!user) return res.status(404).json({ error: 'Użytkownik nie znaleziony.' });

        // Add full URL to avatar if it exists and is local
        if (user.avatar_url && !user.avatar_url.startsWith('http')) {
            user.avatar_url = `${req.protocol}://${req.get('host')}${user.avatar_url}`;
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

module.exports = router;
