require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variable before starting
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
if (!FIREBASE_DATABASE_URL) {
    console.error('ERROR: FIREBASE_DATABASE_URL environment variable is required.');
    process.exit(1);
}

// Firebase Realtime Database REST base URL
const MOVIES_URL = `${FIREBASE_DATABASE_URL.replace(/\/$/, '')}/aflaamak/movies`;

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(generalLimiter);
app.use(express.static(path.join(__dirname, 'public')));

// In-memory admin token store
const adminTokens = new Set();

// Admin authentication middleware
function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (!token || !adminTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// ── Firebase REST API helpers ────────────────────────────────────────────────

// Convert the Firebase snapshot object { id: {...}, ... } to an array with _id
function snapshotToArray(data) {
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data).map(([id, movie]) => ({ _id: id, ...movie }));
}

// Normalise createdAt to a numeric timestamp for sorting
function toTimestamp(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const ms = Date.parse(val);
    return isNaN(ms) ? 0 : ms;
}

// Fetch all movies from Firebase
async function fbGetMovies() {
    const res = await fetch(`${MOVIES_URL}.json`);
    if (!res.ok) throw new Error(`Firebase GET failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return snapshotToArray(data);
}

// Fetch a single movie by Firebase push-key id
async function fbGetMovie(id) {
    const res = await fetch(`${MOVIES_URL}/${id}.json`);
    if (!res.ok) throw new Error(`Firebase GET failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!data) return null;
    return { _id: id, ...data };
}

// Push a new movie; returns the created movie object with _id
async function fbAddMovie(payload) {
    const res = await fetch(`${MOVIES_URL}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Firebase POST failed: ${res.status} ${res.statusText}`);
    const { name: id } = await res.json(); // Firebase returns { "name": "<pushId>" }
    return { _id: id, ...payload };
}

// Update an existing movie by id; returns the updated movie object
async function fbUpdateMovie(id, payload) {
    const res = await fetch(`${MOVIES_URL}/${id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Firebase PATCH failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return { _id: id, ...data };
}

// Delete a movie by id
async function fbDeleteMovie(id) {
    const res = await fetch(`${MOVIES_URL}/${id}.json`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Firebase DELETE failed: ${res.status} ${res.statusText}`);
}

// ── API Routes ───────────────────────────────────────────────────────────────

// GET /api/movies - Fetch all movies (with optional category / search filter)
app.get('/api/movies', async (req, res) => {
    try {
        let movies = await fbGetMovies();

        if (req.query.category && req.query.category !== 'جميع') {
            movies = movies.filter(m => m.category === req.query.category);
        }
        if (req.query.search) {
            const q = req.query.search.toLowerCase();
            movies = movies.filter(m =>
                (m.title || '').toLowerCase().includes(q) ||
                (m.description || '').toLowerCase().includes(q)
            );
        }

        // Sort newest first (by createdAt, descending)
        movies.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/movies/:id - Fetch single movie
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await fbGetMovie(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/movies - Add new movie (admin only)
app.post('/api/movies', requireAdmin, async (req, res) => {
    const { title, description, year, category, rating, poster, videoUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const validCategories = ['أفلام', 'مسلسلات', 'أنمي', 'وثائقي'];
    const payload = {
        title: String(title),
        description: description ? String(description) : '',
        year: Number(year) || new Date().getFullYear(),
        category: validCategories.includes(category) ? category : 'أفلام',
        rating: Math.min(10, Math.max(1, Number(rating) || 5)),
        poster: poster ? String(poster) : '',
        videoUrl: videoUrl ? String(videoUrl) : '',
        createdAt: Date.now()
    };

    try {
        const savedMovie = await fbAddMovie(payload);
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).json({ error: 'Error saving movie' });
    }
});

// PUT /api/movies/:id - Update movie (admin only)
app.put('/api/movies/:id', requireAdmin, async (req, res) => {
    try {
        const existing = await fbGetMovie(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Movie not found' });

        const { title, description, year, category, rating, poster, videoUrl } = req.body;
        const validCategories = ['أفلام', 'مسلسلات', 'أنمي', 'وثائقي'];
        const updates = {
            title: title ? String(title) : existing.title,
            description: description !== undefined ? String(description) : existing.description,
            year: Number(year) || existing.year,
            category: validCategories.includes(category) ? category : existing.category,
            rating: Math.min(10, Math.max(1, Number(rating) || existing.rating)),
            poster: poster !== undefined ? String(poster) : existing.poster,
            videoUrl: videoUrl !== undefined ? String(videoUrl) : existing.videoUrl
        };

        const updated = await fbUpdateMovie(req.params.id, updates);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Error updating movie' });
    }
});

// DELETE /api/movies/:id - Delete movie (admin only)
app.delete('/api/movies/:id', requireAdmin, async (req, res) => {
    try {
        const existing = await fbGetMovie(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Movie not found' });
        await fbDeleteMovie(req.params.id);
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/admin/verify - Verify admin password and issue a session token
app.post('/api/admin/verify', adminLimiter, (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
        const token = crypto.randomBytes(32).toString('hex');
        adminTokens.add(token);
        // Expire token after 8 hours
        setTimeout(() => adminTokens.delete(token), 8 * 60 * 60 * 1000);
        res.json({ success: true, message: 'تم التحقق بنجاح', token });
    } else {
        res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
});

// Serve index.html for all unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
