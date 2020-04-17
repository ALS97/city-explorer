'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect;
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
app.use(cors());
let locationCache=[]

app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello` );
});

app.get('/location', handleLocation);

function handleLocation( request, response ) {
  // eventually, get this from a real live API
  // https://us1.locationiq.com/v1/search.php?key=3a7a618904508a=seattle&format=json
  // From the browser, we do $.ajax()
  // But this is a server. And we don't have jQuery here (or ever will)
  // Use a library called 'superagent'

  let city = request.query.city.toLowerCase();

  if(locationCache[city]) {
    response.json( locationCache[city]);
    return;
  }


  const url = 'https://us1.locationiq.com/v1/search.php';
  const queryStringParams = {
    key: process.env.LOCATION_TOKEN,
    q: city,
    format: 'json',
    limit: 1,
  };
  // $.ajax(url)
  superagent.get(url)
    .query(queryStringParams)
    .then( data => {
      let locationData = data.body[0];
      let location = new Location(city, locationData);
      locationCache[city] = location;
      response.json(location);
    });
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function handleRestaurants(request, reply){
  let listOfRestaurants = [];

  let url = 'https://developers.zomato.com/api/v2.1/ ';
  let queryStringParams = {
    key: process.env.ZOMATO_TOKEN,
    lat: request.query.latitude,
    lon: request.query.longitude,
  };

  superagent.get(url)
    .query(queryStringParams)
    .set('user-key', process.env.ZOMATO_TOKEN)
    .then( data => {
      let restaurantData = data.body;
      restaurantData.nearby_restaurants.forEach(r => {
        let restaurant = new Restaurant(r);
        listOfRestaurants.push(restaurant);
      });

      response.json(listOfRestaurants);
    });

}

function Restaurant(data) {
  this.name = data.restaurant.name;
  this.cuisines = data.restaurant.cuisines;
  this.locality = data.restaurant.location.locality;
}
console.log('/geo');
app.listen( PORT, () => console.log('Server up on', PORT));
  