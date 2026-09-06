require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sequelize = require('./config/db');
require('./models'); // registers associations

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const storeOwnerRoutes = require('./routes/storeOwnerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/store-owner', storeOwnerRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// centralized error handler (catches anything thrown/rejected and missed)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // In production use proper migrations instead of sync(); alter:true is
    // convenient for this challenge/dev setup.
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
