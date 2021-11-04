const { ObjectID } = require('bson');
const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>res.send('Hola Mundo'));


// POST request to create a new booking in the database
router.post('/checkin',async function (req, res) {
    // Data for the booking is in the request body
    let bookingData = req.body;
    // Data base collections used in this view
    let db = req.app.locals.db;
    let guestsCollection   = db.collection('guests');
    let roomsCollection    = db.collection('rooms');
    let bookingsCollection = db.collection('bookings');

    // get the client
    let guest = await guestsCollection.findOne({dni:bookingData.guest});
    // Check if the client exists and does not have any active booking
    if (guest == undefined) {
        res.status(400).send({err:`Guest with dni ${bookingData.guest} is not registered. Please register first`})
        return;
    } else if (
        (await bookingsCollection.findOne({guest:bookingData.guest,checkOutDate:{$exists:false}}) )!=undefined
    ){
        res.status(400).send({err:`Guest with dni ${bookingData.guest} has already booked a room`});
        return;
    }

    // Get the room
    let room = await roomsCollection.findOne({number:bookingData.room});
    // Check if the room exists and it is available
    if (room == undefined) {
        res.status(400).send({err:`Room ${bookingData.room} does not exist in the hotel.`})
        return;
    } else if (!room.available){
        res.status(400).send({err:`Room ${bookingData.room} is not available at the moment.`})
        return;
    }

    // If the room is available send a booking object as response and set the available
    // status of the room to false
    roomsCollection.updateOne(room,{$set : {available:false}});
    bookingsCollection.insertOne(bookingData,function (err,data) {
        bookingsCollection.findOne({"_id":data.insertedId},function (err,booking) {
            res.send(booking);
        })
    })
})

// PUT request to update a booking: this sets the checkOutDate, therefore
// the client is checking out and the state of the booked room should change to available:true
router.put('/checkout/:bookingId',function (req,res) {
    // Read bookingId from the url params
    let bookingId = req.params.bookingId;

    // Data base collections used in this view
    let db = req.app.locals.db;
    let roomsCollection    = db.collection('rooms');
    let bookingsCollection = db.collection('bookings');
    
    // Set the date for the checkout
    let dateStr = (new Date()).toISOString().split('T')[0];

    // Find the booking entry, update it with the checkout date. Filter out
    // bookings which are not active (have checkout Date).
    bookingsCollection.findOneAndUpdate(
        {_id : ObjectID(bookingId),checkOutDate:{$exists:false}},
        {$set : {checkOutDate : dateStr}},
        {returnDocument:'after'},
        function (err,{value:booking}) {
            // send the updated booking object and modify the state of the room
            roomsCollection.updateOne({number:booking.room},{$set:{available:true}})
            res.send(booking);
        }
    )
})

module.exports = router;