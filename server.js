'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello` );
});

app.get('/geo', handleLocation);

function handleLocation( request, response ) {
  let city = request.query.city;

  let locationData = require('./data/geo.json');
  let location = new Location(city, locationData[0]);
  response.json(location);
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}
console.log('/geo');
app.listen( PORT, () => console.log('Server up on', PORT));
  