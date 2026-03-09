// script.js

// Function to fetch movies from an API
async function fetchMovies(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Function to display movies on the page
function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = ''; // Clear previous content
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `<h3>${movie.title}</h3><p>${movie.overview}</p>`;
        moviesContainer.appendChild(movieElement);
    });
}

// Example usage
// const apiUrl = 'https://api.example.com/movies';
// fetchMovies(apiUrl);