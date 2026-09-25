const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'nandhanotes-api' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});