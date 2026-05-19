const mongoose = require('mongoose');

async function findUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/floosy');
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    const user = await User.findOne({});
    console.log('Found User:', JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findUser();
