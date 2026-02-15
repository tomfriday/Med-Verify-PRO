const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Konfiguracja Multer (upload plików)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unikalna nazwa pliku + oryginalne rozszerzenie
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Tylko obrazy (jpeg, jpg, png, webp) są dozwolone.'));
    }
});

// GET /api/profile — pobierz dane profilu
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await db('users').where({ id: req.user.id }).first();
        if (!user) return res.status(404).json({ error: 'Użytkownik nie znaleziony.' });

        // Nie zwracamy hasła
        const { password_hash, ...userData } = user;

        // Dodaj pełny URL do avatara jeśli istnieje i jest lokalny
        if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
            userData.avatar_url = `${req.protocol}://${req.get('host')}${userData.avatar_url}`;
        }

        res.json({ user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// PUT /api/profile — aktualizacja danych (imię, email, telefon)
router.put('/', authenticate, async (req, res) => {
    const { full_name, email, phone_number } = req.body;

    // Walidacja emaila (czy nie zajęty przez innego użytkownika)
    if (email) {
        const existing = await db('users').where('email', email).whereNot('id', req.user.id).first();
        if (existing) return res.status(400).json({ error: 'Ten email jest już zajęty.' });
    }

    try {
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone_number !== undefined) updateData.phone_number = phone_number;

        await db('users').where({ id: req.user.id }).update(updateData);
        res.json({ message: 'Profil zaktualizowany.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd aktualizacji profilu.' });
    }
});

// POST /api/profile/avatar — upload avatara
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nie przesłano pliku.' });

        // Normalizacja ścieżki (Windows uses backslashes, URL needs forward slashes)
        const avatarUrl = '/uploads/' + req.file.filename;

        await db('users').where({ id: req.user.id }).update({
            avatar_url: avatarUrl
        });

        const fullUrl = `${req.protocol}://${req.get('host')}${avatarUrl}`;
        res.json({ message: 'Avatar zaktualizowany.', avatar_url: fullUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd uploadu avatara.' });
    }
});

module.exports = router;
