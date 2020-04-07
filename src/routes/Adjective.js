const express = require('express');
const router = express.Router();
const Adjective = require('../models/Adjective');

// get all adjectives
router.get('/', (req, res) => {
    console.log('getting all adjectives');
    Adjective.find()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json({message: err})
        })
})

module.exports = router;