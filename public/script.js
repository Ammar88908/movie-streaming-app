// Firebase configuration
// NOTE: Firebase API keys for web apps are designed to be public.
// Real security is enforced via Firebase Realtime Database Security Rules.
// Ensure your Firebase project has appropriate rules before deploying.
// See: https://firebase.google.com/docs/database/security
const firebaseConfig = {
    apiKey: "AIzaSyDGPFQdTeo_R1nWTFxEo7ioZyIaXElCJXk",
    authDomain: "aflamk-3c9be.firebaseapp.com",
    projectId: "aflamk-3c9be",
    storageBucket: "aflamk-3c9be.firebasestorage.app",
    messagingSenderId: "27227290582",
    appId: "1:27227290582:web:6abbea21c88d4fbc660277",
    databaseURL: "https://aflamk-3c9be-default-rtdb.europe-west1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentCategory = 'جميع';
let searchTimeout = null;
let allMovies = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
});

// Set active category
function setCategory(btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    const title = document.getElementById('sectionTitle');
    title.textContent = currentCategory === 'جميع' ? 'جميع المحتويات' : currentCategory;
    applyFilters();
}

// Handle search
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300);
}

// Apply both search + category filters
function applyFilters() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    let filtered = allMovies;
    if (currentCategory !== 'جميع') {
        filtered = filtered.filter(m => m.category === currentCategory);
    }
    if (q) {
        filtered = filtered.filter(m =>
            m.title.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q))
        );
    }
    renderMovies(filtered);
}

// Load movies from Firebase Realtime Database (real-time listener)
function loadMovies() {
    showLoading(true);
    db.ref('aflaamak/movies').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            allMovies = Object.entries(data).map(([id, movie]) => ({ _id: id, ...movie }));
            // Sort newest first
            allMovies.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else {
            allMovies = [];
        }
        renderMovies(allMovies);
        showLoading(false);
    }, () => {
        showError('تعذر تحميل البيانات. تحقق من الاتصال بالإنترنت.');
        showLoading(false);
    });
}

// Render movies grid
function renderMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('movieCount');

    count.textContent = `(${movies.length})`;

    if (!movies.length) {
        grid.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    grid.innerHTML = movies.map(m => {
        const mJson = JSON.stringify(m).replace(/'/g, '&apos;');
        const posterHtml = m.poster
            ? `<img src="${escapeAttr(m.poster)}" alt="${escapeHtml(m.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
            : '';
        return `
        <div class="movie-card" onclick='playMovie(${mJson})'>
            <div class="card-poster">
                ${posterHtml}
                <div class="poster-placeholder" style="${m.poster ? 'display:none' : 'display:flex'}">🎬</div>
                <div class="card-overlay">
                    <div class="play-btn">▶</div>
                </div>
                <div class="card-badge">${escapeHtml(m.category)}</div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${escapeHtml(m.title)}</h3>
                <div class="card-meta">
                    <span class="card-year">${escapeHtml(String(m.year || ''))}</span>
                    <span class="card-rating">⭐ ${escapeHtml(String(m.rating || ''))}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Play movie in modal
function playMovie(movie) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    const details = document.getElementById('movieDetails');

    container.innerHTML = buildPlayer(movie.videoUrl);

    details.innerHTML = `
        <div class="detail-header">
            <h2 class="detail-title">${escapeHtml(movie.title)}</h2>
            <div class="detail-meta">
                ${movie.category ? `<span class="cat-badge">${escapeHtml(movie.category)}</span>` : ''}
                ${movie.year ? `<span>📅 ${movie.year}</span>` : ''}
                ${movie.rating ? `<span>⭐ ${movie.rating}/10</span>` : ''}
            </div>
        </div>
        ${movie.description ? `<p class="detail-desc">${escapeHtml(movie.description)}</p>` : ''}
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Build the appropriate player embed
function buildPlayer(url) {
    if (!url) return '<div class="no-video">⚠️ لا يوجد رابط فيديو</div>';

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
        return `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" class="video-frame"></iframe>`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" class="video-frame"></iframe>`;
    }

    // Telegram / t.me
    if (url.includes('t.me/') || url.includes('telegram.me/')) {
        return `<div class="external-link-player">
            <p>📱 رابط تيليجرام</p>
            <a href="${escapeAttr(url)}" target="_blank" class="btn btn-primary">فتح في تيليجرام ↗</a>
        </div>`;
    }

    // Direct video file (only http/https)
    const videoExts = /\.(mp4|webm|ogg|m3u8|mkv|avi|mov)(\?.*)?$/i;
    if (videoExts.test(url) && /^https?:\/\//i.test(url)) {
        return `<video controls autoplay class="video-frame" src="${escapeAttr(url)}">متصفحك لا يدعم تشغيل الفيديو.</video>`;
    }

    // Generic iframe embed (for other embeds) - only allow http/https URLs
    if (/^https?:\/\//i.test(url)) {
        return `<iframe src="${escapeAttr(url)}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" class="video-frame"></iframe>`;
    }

    return '<div class="no-video">⚠️ رابط الفيديو غير مدعوم</div>';
}

// Close modal
function closePlayer() {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    modal.style.display = 'none';
    container.innerHTML = '';
    document.body.style.overflow = '';
}

function closeModalOnBackdrop(e) {
    if (e.target === document.getElementById('playerModal')) {
        closePlayer();
    }
}

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlayer();
});

// Show/hide loading
function showLoading(show) {
    document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
    document.getElementById('moviesGrid').style.display = show ? 'none' : 'grid';
}

// Show error
function showError(msg) {
    document.getElementById('moviesGrid').innerHTML = `<div class="error-msg" style="grid-column:1/-1;text-align:center;padding:40px;">${msg}</div>`;
    document.getElementById('moviesGrid').style.display = 'block';
}

// Escape HTML for display
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Escape attribute values (src, href etc.) - only allow http/https
function escapeAttr(str) {
    if (!str) return '';
    if (!/^https?:\/\//i.test(str)) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
