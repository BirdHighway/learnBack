const express = require('express');
const router = express.Router();
const GenericEntry = require('../models/GenericEntry');

// get all entries
router.get('/', (req, res) => {
    console.log('getting all entries');
    GenericEntry.find()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({message: err});
        })
})

// by _id
router.get('/id/:id', (req, res) => {
    console.log(`getting generic by _id: ${req.params.id}`);
    GenericEntry.find({ _id: req.params.id })
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json({message: err});
        })
})



// bulk add entries
router.post('/', (req, res) => {
    console.log('add bulk set of GenericEntry[]');
    console.log(req.body.entriesArray);
    GenericEntry.insertMany(req.body.entriesArray)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({message: err})
        })
})

// delete generic
router.delete('/id/:id', (req, res) => {
    console.log(`deleting generic with _id: ${req.params.id}`);
    GenericEntry.findByIdAndDelete(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({message: err});
        })
})

module.exports = router;