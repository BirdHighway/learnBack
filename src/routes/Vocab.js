const express = require('express');
const router = express.Router();
const Vocab = require('../models/Vocab');

// get all vocab
router.get('/', (req, res) => {
    console.log('getting vocab entries');
    console.log(req.query);
    let limit = 20;
    let skip = 0;
    let pageNumber = 1;
    let filter = {};
    if (req.query.page && req.query.page > 0) {
        pageNumber = req.query.page;
        skip = (req.query.page - 1) * limit;
    }
    if (req.query.category && req.query.category !== 'all') {
        if (req.query.category == 'uncategorized') {
            filter.type = '';
        } else {
            filter.type = req.query.category;
        }
    }
    if (req.query.searchTarget) {
        let searchText = decodeURIComponent(req.query.searchText);
        if (req.query.searchTarget === 'tags') {
            filter.tags = { $regex: searchText };
        } else if (req.query.searchTarget === 'source') {
            filter.source = { $regex: searchText };
        } else if (req.query.searchTarget === 'english') {
            filter.eng_text = { $regex: searchText };
        } else if (req.query.searchTarget === 'dialect') {
            filter.dialect = { $regex: searchText };
        }
    }
    console.log(filter);
    Vocab.find(filter)
        .limit(limit)
        .skip(skip)        
        .then(docs => {
            if (docs.length === 0) {
                res.json({
                    status: 'success',
                    total: 0,
                    data: []
                });
            } else {
                Vocab.countDocuments(filter)
                    .then(number => {
                        res.json({
                            status: 'success',
                            total: number,
                            page: pageNumber,
                            data: docs
                        });
                    })
            }
        })
        .catch(err => {
            res.json({status: 'error', message: err.message})
        })
})

// update vocab
router.patch('/', (req, res) => {
    console.log('updating vocab obj with _id: ' + req.body._id);
    Vocab.findByIdAndUpdate(req.body._id, req.body)
        .then(word => {
            res.json({status: 'success', data: word})
        })
        .catch(err => {
            res.json({status: 'failure', data: err.message})
        })
})

// new vocab word
router.post('/', (req, res) => {
    console.log('creating new vocab word');
    let word = new Vocab(req.body);
    console.log(word);
    word.save()
        .then(word => {
            res.json({status: 'success', data: word})
        })
        .catch(err => {
            res.json({status: 'failure', data: err.message})
        })
})

// bulk add through a get request
router.get('/bulk', (req, res) => {
    console.log('bulk add through a get request');
    res.json({result: 'uncomment to bulk add'});
    // let base = '21_eng_';
    // let promisedList = [];

    // for(let i=0; i<177; i++){

    //     let num = i + 1;
    //     let fileName = '';

    //     if (num < 10) {
    //         fileName = base + '00' + num + '.mp3';
    //     } else if (num < 100) {
    //         fileName = base + '0' + num + '.mp3';
    //     } else {
    //         fileName = base + num + '.mp3';
    //     }

    //     let newVocab = new Vocab({
    //         eng_text: english_words[i],
    //         eng_audio: fileName,
    //         dialect: 'Lebanese',
    //         source: 'Lebanese Vocab Book',
    //         tags: ['entertainment']
    //     })
    //     newVocab.save();
    //     promisedList.push(newVocab);
    // }

    // Promise.all(promisedList)
    //     .then(data => {
    //         res.json(data);
    //     })
    //     .catch(err => {
    //         res.json({message: err.message});
    //     })
})

module.exports = router;