const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://pulkitsachdeva:test123@polarx.wq0hut2.mongodb.net/polarix?retryWrites=true&w=majority&appName=polarX"; // Update with your MongoDB URI
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    return client.db("yourDatabaseName");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;