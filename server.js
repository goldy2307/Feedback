const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname)));
const PORT = 3000;
app.use(cors());
app.use(express.json());
const feedbacks = [];
app.post('/submit-feedback', (req, res) => {
  const { name, email, rating, feedback } = req.body;
  if (!name || !email || !rating || !feedback) {
    return res.status(400).json({ success: false, message: 'All fields required.' });
  }
  feedbacks.push({ name, email, rating, feedback });
  res.json({ success: true, message: 'Feedback saved.' });
});
app.get('/feedbacks', (req, res) => {
  const total = feedbacks.length;
  const averageRating = total === 0
    ? '0.0'
    : (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1);
  res.json({ total, averageRating, feedbacks });
});
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
