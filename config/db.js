const mongoose = require('mongoose');

// Use global caching for Mongoose connections to optimize Vercel serverless functions
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using the URI from environment variables.
 * Uses cached connection for serverless environments.
 */
const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
