const express = require('express');
// const verbData = require('./verb-data.json');
const router = express.Router();
const VerbSet = require('../models/VerbSet');

// get specific groupings of verbs
router.get('/collections', (req, res) => {
    console.log('verbs/collections/ GET request');
    let limit = 0;
    let sort = [];
    let filter = {}
    if (!req.query.collectionType) {
        res.json({
            status: 'error',
            data: 'No collectionType specified!'
        });
    }
    let collectionType = req.query.collectionType;
    if (collectionType === 'entire-set') {
        // return every single verb, even those without text entered
        filter = {}
    } else if (collectionType === 'ready') {
        // return all verbs that do not have the status of "new" or "hidden"
        filter = {
            status: {
                $nin: [
                    "new",
                    "hidden"
                ]
            }
        }
    } else if (collectionType === 'by-status') {
        let status = req.query.status;
        filter = {
            status: {
                $eq: status
            }
        }
    }
    VerbSet.find(filter)
        .sort(sort)
        .limit(limit)
        .then(docs => {
            res.json({
                status: 'success',
                data: docs
            })
        })
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
            })
        })
})

// get all verb sets
router.get('/', (req, res) => {
    console.log('getting all verb sets');
    let limit = 201;
    let skip = 0;
    let pageNumber = 1;
    let sort = [];
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
    if (req.query.sortPracticed) {
        if (req.query.sortPracticed == 'true') {
            sort = [
                ["lastPracticed", 1]
            ]
        }
    }
    VerbSet.find(filter)
        .sort(sort)
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

// touch
router.patch('/touch', (req, res) => {
    console.log('updating last practiced for verb with id: ' + req.body._id);
    VerbSet.findOneAndUpdate(
        { _id: req.body._id },
        {
            lastPracticed: new Date().toISOString(),
            everPracticed: true
        },
        { new: true }
    ).then(doc => {
        res.json({
            status: 'success',
            data: doc
        })
    }).catch(err => {
        res.json({
            status: 'failure',
            data: err.message
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



router.get('/special', (req, res) => {
    console.log('updating all');
    VerbSet.updateMany(
        {},
        {
            $set: {
                everPracticed: false,
                lastPracticed: "1970-01-01T00:00:00.000Z"
            }
        },
        {new: true})
    .then(docs => {
        res.json({
            data: docs
        })
    })
    .catch(err => {
        res.json({
            data: err
        })
    })
})




// initial insert
// router.get('/initial', (req, res) => {
//     console.log('initial insert route');
//     res.json({
//         status: 'nothing',
//         message: 'uncomment text to perform operation'
//     })
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
// })