const express = require('express');
const cors = require('cors');
require('dotenv').config();

const portalRoutes = require('./routes/portals');
const documentRoutes = require('./routes/documents');
const mediaRoutes = require('./routes/media');
const activityRoutes = require('./routes/activities');
const templateRoutes = require('./routes/templates');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/portals', portalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/templates', templateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
