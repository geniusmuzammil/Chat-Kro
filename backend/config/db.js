const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    if (!dbURI) {
      throw new Error('MongoDB URI is missing in the environment variables');
    }

    await mongoose.connect(dbURI);  // No need to include useNewUrlParser and useUnifiedTopology anymore
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;