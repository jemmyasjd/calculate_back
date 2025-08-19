require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/item', itemRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
