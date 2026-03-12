require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aflaamak';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    year: { type: Number, default: new Date().getFullYear() },
    category: { type: String, enum: ['أفلام', 'مسلسلات', 'أنمي', 'وثائقي'], default: 'أفلام' },
    rating: { type: Number, min: 1, max: 10, default: 5 },
    poster: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const Movie = mongoose.model('Movie', movieSchema);

// API Routes

// GET /api/movies - Fetch all movies (with optional category filter)
app.get('/api/movies', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category && req.query.category !== 'جميع') {
            filter.category = req.query.category;
        }
        if (req.query.search) {
            // Escape special regex characters to prevent ReDoS
            const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.title = { $regex: escaped, $options: 'i' };
        }
        const movies = await Movie.find(filter).sort({ createdAt: -1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/movies/:id - Fetch single movie
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
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
    const newMovie = new Movie({ title, description, year, category, rating, poster, videoUrl });
    try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).json({ error: 'Error saving movie' });
    }
});

// PUT /api/movies/:id - Update movie (admin only)
app.put('/api/movies/:id', requireAdmin, async (req, res) => {
    try {
        const { title, description, year, category, rating, poster, videoUrl } = req.body;
        const updated = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, description, year, category, rating, poster, videoUrl },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Movie not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Error updating movie' });
    }
});

// DELETE /api/movies/:id - Delete movie (admin only)
app.delete('/api/movies/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await Movie.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Movie not found' });
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/admin/verify - Verify admin password and issue a session token
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
        // Issue a simple server-side session token (stored in memory)
        const token = require('crypto').randomBytes(32).toString('hex');
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