const BASE = 'https://feedback-kfy8.onrender.com';

let selectedRating = 0;
let currentSort = 'rating-desc';
let allFeedbacks = [];

const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function initStars() {
  const stars = document.querySelectorAll('.star');
  const label = document.getElementById('star-label');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      highlightStars(val);
      label.textContent = starLabels[val];
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
      label.textContent = selectedRating ? starLabels[selectedRating] : 'Click to rate';
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      highlightStars(selectedRating);
      label.textContent = starLabels[selectedRating];
      document.getElementById('field-rating').classList.remove('has-error');
    });
  });
}

function highlightStars(count) {
  document.querySelectorAll('.star').forEach(star => {
    const val = parseInt(star.dataset.value);
    star.classList.toggle('selected', val <= count);
    star.classList.toggle('hovered', false);
  });
}

function validate() {
  let ok = true;

  ['name', 'email', 'rating', 'feedback'].forEach(f => {
    document.getElementById('field-' + f).classList.remove('has-error');
  });

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const feedback = document.getElementById('feedback').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    document.getElementById('field-name').classList.add('has-error');
    ok = false;
  }

  if (!email || !emailRegex.test(email)) {
    document.getElementById('field-email').classList.add('has-error');
    ok = false;
  }

  if (!selectedRating) {
    document.getElementById('field-rating').classList.add('has-error');
    ok = false;
  }

  if (!feedback) {
    document.getElementById('field-feedback').classList.add('has-error');
    ok = false;
  }

  return ok;
}

function setLoading(loading) {
  const btn = document.getElementById('submit-btn');
  const btnText = btn.querySelector('.btn-text');
  const spinner = document.getElementById('spinner');

  btn.disabled = loading;
  btnText.textContent = loading ? 'Submitting...' : 'Submit Feedback';
  spinner.classList.toggle('visible', loading);
}

async function submitFeedback() {
  const successBox = document.getElementById('success-box');
  successBox.classList.remove('visible');

  if (!validate()) return;

  setLoading(true);

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    rating: selectedRating,
    feedback: document.getElementById('feedback').value.trim(),
    timestamp: Date.now()
  };

  try {
    const res = await fetch(BASE + '/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Server error');

    const result = await res.json();

    if (result.success) {
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('feedback').value = '';
      selectedRating = 0;
      highlightStars(0);
      document.getElementById('star-label').textContent = 'Click to rate';
      successBox.classList.add('visible');
      await loadFeedbacks();
    }
  } catch {
    alert('Could not connect to server. Make sure server.js is running on port 3000.');
  } finally {
    setLoading(false);
  }
}

function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? '#f59e0b' : '#d1d5db'}">★</span>`
  ).join('');
}

function sortFeedbacks(list) {
  const copy = [...list];
  if (currentSort === 'rating-desc') return copy.sort((a, b) => b.rating - a.rating);
  if (currentSort === 'rating-asc')  return copy.sort((a, b) => a.rating - b.rating);
  if (currentSort === 'newest')      return copy.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return copy;
}

function renderFeedbacks() {
  const list = document.getElementById('feedbacks-list');

  if (allFeedbacks.length === 0) {
    list.innerHTML = '<div class="empty-state">No feedback yet. Be the first!</div>';
    return;
  }

  const sorted = sortFeedbacks(allFeedbacks);

  list.innerHTML = sorted.map((f, i) => `
    <div class="feedback-item" style="animation-delay:${i * 0.05}s">
      <div class="feedback-header">
        <span class="feedback-name">${escapeHTML(f.name)}</span>
        <span class="feedback-stars">${starsHTML(f.rating)}</span>
      </div>
      <div class="feedback-text">${escapeHTML(f.feedback)}</div>
      <div class="feedback-email">${escapeHTML(f.email)}</div>
    </div>
  `).join('');
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateAnalytics() {
  const total = allFeedbacks.length;
  document.getElementById('total-count').textContent = total;

  if (total === 0) {
    document.getElementById('avg-rating').textContent = '—';
    document.getElementById('top-rating').textContent = '—';
    document.getElementById('low-rating').textContent = '—';
    return;
  }

  const ratings = allFeedbacks.map(f => f.rating);
  const avg = (ratings.reduce((a, b) => a + b, 0) / total).toFixed(1);
  const top = Math.max(...ratings);
  const low = Math.min(...ratings);

  document.getElementById('avg-rating').textContent = avg;
  document.getElementById('top-rating').textContent = top + '★';
  document.getElementById('low-rating').textContent = low + '★';
}

async function loadFeedbacks() {
  try {
    const res = await fetch(BASE + '/feedbacks');
    if (!res.ok) throw new Error();
    const data = await res.json();
    allFeedbacks = data.feedbacks || [];
    updateAnalytics();
    renderFeedbacks();
  } catch {
    document.getElementById('feedbacks-list').innerHTML =
      '<div class="empty-state">Could not load feedback. Is the server running?</div>';
  }
}

function initSortButtons() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderFeedbacks();
    });
  });
}

document.getElementById('submit-btn').addEventListener('click', submitFeedback);
document.getElementById('refresh-btn').addEventListener('click', loadFeedbacks);

initStars();
initSortButtons();
loadFeedbacks();