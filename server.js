const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoURI = 'your_mongodb_connection_string'; // replace with your actual MongoDB connection string.

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String },
    year: { type: Number },
    description: { type: String },
});

const Movie = mongoose.model('Movie', movieSchema);

// API Routes
// Get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add a new movie
app.post('/api/movies', async (req, res) => {
    const { title, director, year, description } = req.body;
    const newMovie = new Movie({ title, director, year, description });
    try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).send('Error saving movie');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});