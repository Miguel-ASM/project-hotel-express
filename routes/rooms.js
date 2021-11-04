const express = require('express');
const router = express.Router();

// Route with a GET method that returns the list of rooms.
// This view can accept a query parameter that filters available rooms.
router.get('/',function (req,res) {
    // Read the querystring paramter. If its not in the URL then parse false. If it has
    // any value different from undef, then parse true
    let showOnlyAvailable = (req.query.showOnlyAvailable)? true : false;

    // Load the dbase
    roomsCollection = req.app.locals.db.collection('rooms');
    if (showOnlyAvailable){
        roomsCollection.find({available:true}).toArray(function (err,rooms) {
            res.send(rooms);
        })
    } else {
        roomsCollection.find().toArray(function (err,rooms) {
            res.send(rooms);
        })
    }
})

module.exports = router