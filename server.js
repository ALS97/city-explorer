'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
const superagent = require('superagent');
app.use(cors());
let lat = 0;
let lon = 0;
let activeCity = '';

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', errorHandler);
client.connect()
  .then(() =>{
    app.listen(PORT,() => console.log(`listening on ${PORT}`));
  })
  .catch(error => errorHandler(error));


let locationCache=[];

app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello` );
});

app.get('/location', handleLocation);
// app.get('/weather', handleWeather);

function handleLocation( request, response ) {
  // eventually, get this from a real live API
  // https://us1.locationiq.com/v1/search.php?key=3a7a618904508a=seattle&format=json
  // From the browser, we do $.ajax()
  // But this is a server. And we don't have jQuery here (or ever will)
  // Use a library called 'superagent'

  let city = request.query.city.toLowerCase();
  let callSQL = `SELECT * FROM location WHERE search_query='${city}'`;
  client.query(callSQL)
    .then(queryReply => {
      console.log(queryReply);
      if (queryReply.rowCount >0){
        activeCity = queryReply.rows[0].search_query;
        lat = queryReply.rows[0].latitude;
        lon = queryReply.rows[0].longitude;
        response.send(queryReply.row[0]);
      }
      else{
        console.log('Making API call');
        const url = 'https://us1.locationiq.com/v1/search.php';
        const queryStringParams = {
          key: process.env.LOCATION_TOKEN,
          q: city,
          format: 'json',
          limit: 1,
        };
      }
    });
}

function getLocation(url, searchName, response){
  superagent.get(url)
    .then(superagentReply => {
      let location = newLocation(superagentReply, searchName)
      addToSQL(searchName, location);
      response.send(location);
    })
}

 
// $.ajax(url)


function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


function newLocation(superagentReply,searchName){
  let reply = superagentReply.body.reply[0];
  let location = new Location(searchName, reply);
  lat = location.latitude;
  lon = location.longitude;
  activeCity = location.searchName;
  return location;
}

function addToSQL(searchName, location){
  let SQL = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);'
  let values = [search_query, location.formatted_query, lat, lon];
  client.query(sql, values)
    .then(results => {
      console.log ('adding...')
    })
    .catch(error => errorHandler(error));
}
// function handleWeather( request, response ) {
// eventually, get this from a real live API
// https://us1.locationiq.com/v1/search.php?key=3a7a618904508a=seattle&format=json
// From the browser, we do $.ajax()
// But this is a server. And we don't have jQuery here (or ever will)
// Use a library called 'superagent'

//   let city = request.query.city.toLowerCase();
//   if(locationCache[city]) {
//     response.json( locationCache[city]);
//     return;
//   }


//   const url = '`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/{lat},{lon}';
//   const queryStringParams = {
//     key: process.env.,
//     q: city,
//     format: 'json',
//     limit: 1,
//   };
// }


// function handleRestaurants(request, reply){
//   let listOfRestaurants = [];

//   let url = 'https://developers.zomato.com/api/v2.1/geocode';
//   let queryStringParams = {
//     key: process.env.ZOMATO_TOKEN,
//     lat: request.query.latitude,
//     lon: request.query.longitude,
//   };

//   superagent.get(url)
//     .query(queryStringParams)
//     .set('user-key', process.env.ZOMATO_TOKEN)
//     .then( data => {
//       let restaurantData = data.body;
//       restaurantData.nearby_restaurants.forEach(r => {
//         let restaurant = new Restaurant(r);
//         listOfRestaurants.push(restaurant);
//       });

//       reply.json(listOfRestaurants);
//     });

// }

// function Restaurant(data) {
//   this.name = data.restaurant.name;
//   this.cuisines = data.restaurant.cuisines;
//   this.locality = data.restaurant.location.locality;
// }

function errorHandler(error, response){
  console.log(error);
}

console.log('/geo');
app.listen( PORT, () => console.log('Server up on', PORT));