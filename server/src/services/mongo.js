const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://nasa-api:0j3ZGXX9DcKosWGy@cluster0.hrnez.mongodb.net/nasa?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

module.exports = {
  mongoConnect
};