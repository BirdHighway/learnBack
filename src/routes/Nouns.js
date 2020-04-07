const express = require('express');
const router = express.Router();
const Noun = require('../models/Noun');

// get all nouns
router.get('/', (req, res) => {
    console.log('getting all nouns');
    Noun.find()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json({message: err})
        })
})

// update a noun
router.patch('/', (req, res) => {
    console.log('update a noun');
    const update = {
        eng_text: req.body.eng_text,
        a_sing_text: req.body.a_sing_text,
        a_pl_text: req.body.a_pl_text,
        source: req.body.source,
        tags: req.body.tags
    }
    console.log(update);
    console.log(req.body._id);
    Noun.findByIdAndUpdate(req.body._id, update)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({message: err});
        })       
})

// get nouns by category
router.get('/category/:category', (req, res) => {
    let category = req.params.category.replace('_','/');
    console.log(`getting nouns by category: ${category}`);
    Noun.find({ tags: category })
        .then(data => {
            res.json(data)
        })
})

// get single noun
// by english text
router.get('/eng/:nounName', (req, res) => {
    console.log('getting single noun by english text');
    Noun.find({ eng_text: req.params.nounName })
        .then(data => {
            res.json(data)
        })
})
// by _id
router.get('/id/:id', (req, res) => {
    console.log('getting single noun by id');
    Noun.find({ _id: req.params.id })
        .then(data => {
            res.json(data[0])
        })
})

// add noun
router.post('/', (req, res) => {
    console.log('adding single noun');
    const newNoun = Noun({
        eng_text: req.body.eng_text,
        eng_audio: req.body.eng_audio,
        a_sing_text: req.body.a_sing_text,
        a_sing_audio: req.body.a_sing_audio,
        a_pl_text: req.body.a_pl_text,
        a_pl_audio: req.body.a_pl_audio
    });
    newNoun.save()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json({message: err})
        })
})

// sketchy bulk input through get request
// router.get('/bulk', (req, res) => {
    
//     let base = 'nouns-';
//     let promisedList = [];
//     let testList = [];

//     for(let i=0; i<3; i++){
//         let initial = i * 3;
//         let eng = base + '0' + (initial + 1) + '.wav';
//         let a_s = base + '0' + (initial + 2) + '.wav';
//         let a_p = base + '0' + (initial + 3) + '.wav';
//         let newNoun = Noun({
//             eng_text: '',
//             eng_audio: eng,
//             a_sing_text: '',
//             a_sing_audio: a_s,
//             a_pl_text: '',
//             a_pl_audio: a_p,
//             source: 'Jordan'
//         })
//         // testList.push(newNoun);
//         // newNoun.save();
//         promisedList.push(newNoun);
//     }

//     for(let i=3; i<54; i++){
//         let initial = i * 3;
//         let eng = base + (initial + 1) + '.wav';
//         let a_s = base + (initial + 2) + '.wav';
//         let a_p = base + (initial + 3) + '.wav';
//         let newNoun = Noun({
//             eng_text: '',
//             eng_audio: eng,
//             a_sing_text: '',
//             a_sing_audio: a_s,
//             a_pl_text: '',
//             a_pl_audio: a_p,
//             source: 'Jordan'
//         })
//         // testList.push(newNoun);
//         // newNoun.save();
//         promisedList.push(newNoun);
//     }
    
//     Promise.all(promisedList)
//     .then(data => {
//         res.json(data);
//     })
//     .catch(err => {
//         res.json({message: err});
//     })
    // res.json({nouns: testList});



    // let wordList = req.body.wordList;
    // let promiseList = [];
    // for(let i=0; i<wordList.length; i++){
    //     let english = wordList[i];
    //     let newNoun = Noun({
    //         eng_text: english,
    //         eng_audio: english + '-e.wav',
    //         a_sing_text: '',
    //         a_sing_audio: english + '-s.wav',
    //         a_pl_text: '',
    //         a_pl_audio: ''
    //     });
    //     newNoun.save();
    //     promiseList.push(newNoun);
    // }
    // Promise.all(promiseList)
    //     .then(data => {
    //         res.json(data);
    //     })
    //     .catch(err => {
    //         res.json({message: err});
    //     })
// })

// add noun bulk
router.post('/bulk', (req, res) => {
    console.log('uncomment code to perform bulk save');
    res.json({message: 'uncomment code to perform bulk save'});
    // let wordList = req.body.wordList;
    // let promiseList = [];
    // for(let i=0; i<wordList.length; i++){
    //     let english = wordList[i];
    //     let newNoun = Noun({
    //         eng_text: english,
    //         eng_audio: english + '-e.wav',
    //         a_sing_text: '',
    //         a_sing_audio: english + '-s.wav',
    //         a_pl_text: '',
    //         a_pl_audio: ''
    //     });
    //     newNoun.save();
    //     promiseList.push(newNoun);
    // }
    // Promise.all(promiseList)
    //     .then(data => {
    //         res.json(data);
    //     })
    //     .catch(err => {
    //         res.json({message: err});
    //     })
})

// delete noun
router.delete('/id/:id', (req, res) => {
    console.log(`deleting noun with ID: ${req.params.id}`);
    Noun.findByIdAndDelete(req.params.id)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json({message: err})
        })
})

module.exports = router;