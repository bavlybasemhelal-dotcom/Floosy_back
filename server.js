require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Floosy API running on http://0.0.0.0:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
