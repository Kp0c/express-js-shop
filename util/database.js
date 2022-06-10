const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URL);
  _db = client.db('shop');
}

const getDb = () => {
  if (!_db) {
    throw new Error('No database found. Please connect to a database.');
  }

  return _db;
}

module.exports = {
  mongoConnect,
  getDb
};
