const express = require('express');
const router = express.Router();

// GET endpoint to obtain the list of registered guests
router.get('/',function (req,res) {
    let db = req.app.locals.db;
    db.collection('guests').find().toArray(function (err,guests) {
        res.send(guests);
    });
})

// GET endpoint to obtain the active booking of a guest
router.get('/:dni/active-booking',function (req,res) {
    // read params from the url
    let dni = req.params.dni;
    // Load db collections
    let db = req.app.locals.db;
    let bookingsCollection = db.collection('bookings');
    // let guestsCollection   = db.collections('guests');

    // find the active booking and send it in a response
    bookingsCollection.findOne( {guest:dni,checkOutDate:{$exists:false}}, function (err,booking) {
        res.send(booking);
    } )
})

// GET endpoint to obtain the historic of bookings of a guest
router.get('/:dni/history',function (req,res) {
    // read params from the url
    let dni = req.params.dni;
    // Load db collections
    let db = req.app.locals.db;
    let bookingsCollection = db.collection('bookings');
    // let guestsCollection   = db.collections('guests');

    // find the historic of bookings and send it in a response
    bookingsCollection.find( {guest:dni,checkOutDate:{$exists:true}}).toArray(function (err,booking) {
        res.send(booking);
    } )
})

// POST endpoint to register a client
router.post('/',async function (req,res) {
    let db = req.app.locals.db;
    let guestsCollection = db.collection('guests');
    let {dni,firstName,lastName} = req.body;
    dni = dni.toUpperCase()
    guestsCollection.findOne({dni:dni},{dni:1})
    .then(data=>{
        if (data!=undefined){
            res.status(409).send({
                err : `A guest with dni ${dni} already exists in the database`
            })
        } else{
            return guestsCollection.insertOne({dni,firstName,lastName})
        }
    })
    .then(data=>{
        guestsCollection.findOne({"_id":data.insertedId},function (err,guest) {
            res.send(guest);
        })
    })
    .catch(err=>{
        res.status(500).send({err})
    })
})

// PUT endpoint to edit the name (firstName and lastName of a guest)
router.put('/:dni',function (req,res) {
    // Read data from the request
    let requestDNI = req.params.dni.toUpperCase();
    let {firstName,lastName} = req.body;
    // Load the database
    let db = req.app.locals.db;
    let guestsCollection = db.collection('guests');

    // update the entry in the database
    guestsCollection.updateOne(
        {dni:requestDNI},
        {
            $set : {
                firstName : firstName,
                lastName : lastName
            }
        }
    )
    .then(updateInfo=>{
        if (updateInfo.matchedCount > 0){
            guestsCollection.findOne(
                {dni:requestDNI},
                function (err,guest) {
                    res.send(guest)
                }
            )
        } else{
            res.send('no match')
        }
    })
})








module.exports = router;