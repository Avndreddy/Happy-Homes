// Imports
const express = require("express");
const app = express();
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const initialRoute=require('./Routes/Initial');
const createCommitteeMember=require('./Routes/Committee_Member/CommitteeMember')
// Middlewares
app.use(express.json());
app.use(cors());

// Database configuration
const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes
app.use('/api' ,initialRoute);
app.use('/api',createCommitteeMember)

// Start or Server Listening
app.listen(process.env.Server_Port || 5000, () => {
  console.log(`Server is running on port ${process.env.Server_Port || 5000}`);
});


module.exports={db};