'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello` );
});
  