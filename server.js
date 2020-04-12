'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
app.use(cors());

app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello` );
});

app.get('/location', handleLocation);

function handleLocation( request, response ) {
  // https://us1.locationiq.com/v1/search.php?key=3a7a618904508a&q=seattle&format=json
  // use library called 'superagent'
  // let locationData = require('./data/geo.json');
  let city = request.query.city;
  const url = "https://us1.locationiq.com/v1/search.php";
  const queryStringParams = {
    key: process.env.LOCATION_TOKEN,
    q: city,
    format: 'json',
    limit:1,
  };
  superagent.get(url)
    .query(queryStringParams)
    .then( reply => {
      let locationData = reply.body[0];
      let location = new Location(city, locationData);
      response.json(location);
    });


}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}
console.log('/geo');
app.listen( PORT, () => console.log('Server up on', PORT));
  