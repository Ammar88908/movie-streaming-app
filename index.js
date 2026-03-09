// index.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
const dbURI = 'your_mongoDB_connection_string'; // Replace with your actual MongoDB connection string
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Movie routes
app.get('/api/movies', (req, res) => {
    // Logic to fetch movies from the database
    res.send('List of movies');
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    // Token validation logic goes here
    if (token === 'your_admin_token') { // Replace with actual token logic
        next();
    } else {
        res.status(403).send('Unauthorized');
    }
};

// Admin route to add a movie
app.post('/api/movies', authenticateAdmin, (req, res) => {
    // Logic to add a movie to the database
    res.send('Movie added');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
