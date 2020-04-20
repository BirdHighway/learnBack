const express = require('express');
// const verbData = require('./verb-data.json');
const router = express.Router();
const VerbSet = require('../models/VerbSet');

// initial insert
router.get('/initial', (req, res) => {
    console.log('initial insert route');
    res.json({
        status: 'nothing',
        message: 'uncomment text to perform operation'
    })
    // let promisedList = [];
    // for (let j=0; j<verbData.words.length; j++) {
    //     let word = verbData.words[j];
    //     console.log(word);
    //     let newVerbSet = new VerbSet({
    //         eng_text: word[1],
    //         eng_audio: word[2],
    //         a_audio_base: word[0],
    //         status: 'new',
    //         a_pres_text: {
    //             tense: 'present',
    //             he: '',
    //             i: '',
    //             she: '',
    //             they: '',
    //             we: '',
    //             you_female: '',
    //             you_male: '',
    //             you_plural: ''
    //         },
    //         a_past_text: {
    //             tense: 'past',
    //             he: '',
    //             i: '',
    //             she: '',
    //             they: '',
    //             we: '',
    //             you_female: '',
    //             you_male: '',
    //             you_plural: ''
    //         }
    //     })
    //     newVerbSet.save();
    //     promisedList.push(newVerbSet);
    // }
    // Promise.all(promisedList)
    // .then(data => {
    //     res.json(data)
    // })
    // .catch(err => {
    //     res.json({message: err.message})
    // })
})

// get all verb sets
router.get('/', (req, res) => {
    console.log('getting all verb sets');
    let limit = 201;
    let skip = 0;
    let pageNumber = 1;
    // let filter = {};

    // if (req.query.limit) {
    //     limit = parseInt(req.query.limit);
    // }
    // if (req.query.page && req.query.page > 0) {
    //     pageNumber = req.query.page;
    //     skip = (req.query.page - 1) * limit;
    // }
    // if (req.query.status) {
    //     filter.status = req.query.status;
    // }
    // if (req.query._id) {
    //     filter._id = req.query._id;
    // }
    if (req.query._id) {
        filter = {
            _id: req.query._id
        }
    } else if (req.query.status) {
        filter = {
            status: req.query.status
        }
    } else {
        filter = {
            $or: [
                { status: 'ready' },
                { status: 'study' },
                { status: 'study2'}
            ]
        }
    }
    VerbSet.find(filter)
        .limit(limit)
        .skip(skip)
        .then(docs => {
            if (docs.length === 0) {
                res.json({
                    status: 'success',
                    total: 0,
                    data: []
                })
            } else {
                VerbSet.countDocuments(filter)
                    .then(number => {
                        res.json({
                            status: 'success',
                            total: number,
                            page: pageNumber,
                            data: docs
                        })
                    })
            }
        })
        .catch(err => {
            res.json({
                status: 'error',
                message: err.message
            })
        })

})

// update verb set
router.patch('/', (req, res) => {
    console.log('updating VerbSet with _id: ' + req.body._id);
    VerbSet.findByIdAndUpdate(req.body._id, req.body, {new: true})
        .then(verbSet => {
            res.json({status: 'success', data: verbSet})
        })
        .catch(verbSet => {
            res.json({status: 'failure', data: err.message})
        })
})

module.exports = router;