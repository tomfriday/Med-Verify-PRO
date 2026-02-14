const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'med-verify-pro-secret-key-2026';

function authenticate(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        logUnauthorized(req, 'No token provided');
        return res.status(401).json({ error: 'Brak autoryzacji. Zaloguj się.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        logUnauthorized(req, 'Invalid token');
        return res.status(401).json({ error: 'Nieprawidłowy token.' });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logUnauthorized(req, `Role ${req.user?.role} tried to access resource restricted to [${roles.join(', ')}]`);
            auditLog(req, 'UNAUTHORIZED_ACCESS', req.originalUrl, `Required: [${roles.join(', ')}], Had: ${req.user?.role}`);
            return res.status(403).json({ error: 'Brak uprawnień do tego zasobu.' });
        }
        next();
    };
}

function logUnauthorized(req, message) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    console.warn(`[${timestamp}] UNAUTHORIZED: user=${userId} ip=${ip} path=${req.originalUrl} — ${message}`);
}

async function auditLog(req, action, resource, details) {
    try {
        await db('audit_logs').insert({
            user_id: req.user?.id || null,
            action,
            resource,
            details: typeof details === 'string' ? details : JSON.stringify(details),
            ip_address: req.ip || req.connection?.remoteAddress || 'unknown'
        });
    } catch (err) {
        console.error('Failed to write audit log:', err.message);
    }
}

module.exports = { authenticate, authorize, auditLog, JWT_SECRET };
