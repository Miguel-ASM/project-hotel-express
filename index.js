// Import express and mongodb
const express = require('express');
const mongodb = require('mongodb');

// Import routes
const guests   = require('./routes/guests');
const bookings = require('./routes/bookings');
const rooms    = require('./routes/rooms');
 
// initiaate app and load middleware
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.listen(3000);


// init dbase
const MongoClient = mongodb.MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/', function(err, client) {
    if(err!==undefined) {
        console.log(err);
    } else {
        app.locals.db = client.db('boot_inn');
    }
} );

// add routes to the app
app.use('/guests',guests);
app.use('/bookings',bookings);
app.use('/rooms',rooms);


