const express = require('express');
const router = express.Router();
const Vocab = require('../models/Vocab');

// get all vocab
router.get('/', (req, res) => {
    console.log('getting vocab entries');
    console.log(req.query);
    let limit = 50;
    let skip = 0;
    let pageNumber = 1;
    let filter;
    let sort = {};
    if (req.query.sorting) {
        sort = {lastPracticed: 1}
    }
    if (req.query.playlist) {
        filter = {};
    } else {
        filter = {"memberships.playlist_name": {"$ne" : "Hidden"}};
    }

    if (req.query.limit ) {
        limit = parseInt(req.query.limit);
    }
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
    if (req.query.excludeTag) {
        filter.tags = {"$ne": req.query.excludeTag};
    }
    if (req.query.playlist) {
        if (req.query.playlist == 'no-memberships') {
            filter.memberships = [];
        } else {
            filter.memberships = {$elemMatch: {'playlist_id': req.query.playlist}};
        }
    }
    console.log(filter);
    Vocab.find(filter)
        .sort(sort)
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

// touch
router.patch('/touch', (req, res) => {
    console.log('updating lastPracticed to current date');
    console.log('setting everPracticed to true');
    Vocab.findOneAndUpdate(
        { _id: req.body._id },
        {
            lastPracticed: new Date().toISOString(),
            everPracticed: true
        },
        { new: true }
    ).then(word => {
        res.json({
            status: 'success',
            data: word
        })
    })
    .catch(err => {
        res.json({
            status: 'failure',
            data: err.message
        })
    })
})

// mark mastered
router.patch('/mastered', (req, res) => {
    console.log('marking vocab mastered with _id: ' + req.body._id);
    Vocab.findOneAndUpdate(
        { _id: req.body._id },
        { mastered: true },
        { new: true }
        ).then( word => {
            res.json({
                status: 'success',
                data: word
            })
        })
        .catch( err => {
            res.json({
                status: 'failure',
                data: err.message
            })
        })
})

// update vocab
router.patch('/', (req, res) => {
    console.log('updating vocab obj with _id: ' + req.body._id);
    Vocab.findByIdAndUpdate(req.body._id, req.body, {new: true})
        .then(word => {
            res.json({status: 'success', data: word})
        })
        .catch(err => {
            res.json({status: 'failure', data: err.message})
        })
})

// bulk playlist membership update
router.post('/playlists', (req, res) => {
    console.log('bulk playlist update');

    let pId = req.body.playlist_id;
    let pName = req.body.playlist_name;
    let additions = req.body.additions;
    let removals = req.body.removals;

    let promisedList = [];

    if (additions && additions.length > 0) {
        let a = Vocab.updateMany({
            '_id': {$in: additions}
        },
        {
            $push: {memberships: {playlist_id: pId, playlist_name: pName}}
        },
        {new: true})
        promisedList.push(a);
    }
    if (removals && removals.length > 0) {
        let b = Vocab.updateMany({
            '_id': {$in: removals}
        },
        {
            $pull: {memberships: {playlist_id: pId}}
        },
        {new: true})
        promisedList.push(b);
    }
    Promise.all(promisedList)
        .then(data => {
            res.json({
                status: "success",
                data: data
            })
        })
        .catch(err => {
            res.json({
                status: "failure",
                data: err.message
            })
        })
})

// add or remove from playlist
router.patch('/playlists', (req, res) => {
    let vId = req.body.vocab_id;
    let pId = req.body.playlist_id;
    let action = req.body.action;
    console.log('action: ' + action);
    console.log('vocab_id: ' + vId);
    console.log('playlist_id: ' + pId);
    if (action === 'add') {
        let pName = req.body.playlist_name;
        Vocab.findOneAndUpdate({_id: vId},
            {$push: {memberships: {playlist_id: pId, playlist_name: pName}}}, {new: true})
            .then(doc => {
                console.log(doc);
                res.json({
                    status: "success",
                    data: doc
                })
            })
            .catch(err => {
                res.json({
                    status: "failure",
                    data: err.message
                })
            })
    } else {
        Vocab.findOneAndUpdate({_id: vId},
            {$pull: {memberships: {playlist_id: pId}}}, {new: true})
            .then(doc => {
                console.log(doc);
                res.json({
                    status: "success",
                    data: doc
                })
            })
            .catch(err => {
                res.json({
                    status: "failure",
                    data: err.message
                })
            })
    }

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

// delete word
router.delete('/id/:id', (req, res) => {
    Vocab.findByIdAndDelete(req.params.id)
        .then(docs => {
            res.json({
                status: 'success',
                data: docs
            })
        })
        .catch(err => {
            res.json({
                status: 'failure',
                data: err
            })
        })
})


module.exports = router;







// router.get('/special', (req, res) => {
//     console.log('updating all');
//     Vocab.updateMany(
//         {},
//         {
//             $set: {
//                 everPracticed: false
//             }
//         },
//         {new: true})
//     .then(docs => {
//         res.json({
//             data: docs
//         })
//     })
//     .catch(err => {
//         res.json({
//             data: err
//         })
//     })
// })

// special update
// router.get('/special', (req, res) => {
    // let filter = {
    //     "memberships": {$elemMatch: {"playlist_name": "Pronouns and Adverbs"}}
    // }
    // let promisedList = [];
    // Vocab.updateMany({
    //     'memberships': {
    //         $elemMatch: {
    //             'playlist_name': 'Pronouns and Adverbs'
    //         }
    //     }
    // },
    // { $set: {"memberships.$[elem].playlist_name": 'Playlist A'} },
    // { multi: true,
    //     arrayFilters: [ {"elem.playlist_name": "Pronouns and Adverbs"} ] 
    // }).then(docs => {
    //     res.json({
    //         status: "success",
    //         data: docs
    //     })
    // }).catch(err => {
    //     res.json({
    //         status: "failuer",
    //         data: err.message
    //     })
    // })

    // Vocab.find(filter)
        // .then(data => {
        //     res.json(data);
        // })
        // .catch(err => {
        //     res.json({message: err})
        // })
    // let promisedList = [];
    // Vocab.find()
    //     .then(data => {
    //         data.forEach((word) => {
    //             word.eng_audio = '21/' + word.eng_audio;
    //             word.eng_text = word.eng_text.substr(3);
    //             word.save();
    //             promisedList.push(word);
    //         })
    //         Promise.all(promisedList)
    //             .then(result => {
    //                 res.json(result);
    //             })
    //             .catch(err => {
    //                 res.json({status: 'error', message: err.message});
    //             })
    //     })
    //     .catch(err => {
    //         res.json({status: 'outer error', message: err.message});
    //     })
// })


// add to playlist
// router.post('/playlists/:id', (req, res) => {
//     console.log('adding playlist to vocab with _id: ' + req.params.id);
//     let newPlaylist = {
//         playlist_id: req.body.playlist_id,
//         playlist_name: req.body.playlist_name
//     }
//     console.log(newPlaylist);
//     Vocab.findById(req.params.id)
//         .then(doc => {
//             doc.memberships.push(newPlaylist);
//             doc.save()
//                 .then(updatedData => {
//                     res.json({
//                         status: 'success',
//                         data: updatedData
//                     })
//                 })
//                 .catch(err => {
//                     res.json({
//                         status: 'failure',
//                         data: err.message
//                     })
//                 })
//         })
//         .catch(err => {
//             res.json({
//                 status: 'failure',
//                 data: err.message
//             })
//         })
// })

// add to playlist
// router.post('/playlists/:id', (req, res) => {
//     console.log('adding playlist to vocab with _id:' + req.params.id);
//     let playlist = {
//         playlist_id: req.body.playlist_id,
//         playlist_name: req.body.playlist_name
//     }
//     console.log('playlist: ');
//     console.log(playlist);
//     Vocab.findByIdAndUpdate(
//         req.params._id, 
//         {$push: {playlists: {playlist_id: req.body.playlist_id,
//             playlist_name: req.body.playlist_name}}}
//         ).then(word => {
//             res.json({
//                 status: 'success',
//                 data: word
//             })
//         })
//         .catch(err => {
//             res.json({
//                 status: 'failure',
//                 data: err.message
//             })
//         })
// })

// remove from playlist
// router.delete('/playlists/:id', (req, res) => {
//     console.log('add vocab obj to playlist with _id: ' + req.params.id);
//     Vocab.findByIdAndUpdate(req.body._id, { $push: { "playlists": req.params.id}}, {new: true})
//         .then(word => {
//             res.json({
//                 status: 'success',
//                 data: word
//             })
//         })
//         .catch(err => {
//             res.json({
//                 status: 'failure',
//                 data: err.message
//             })
//         })
// })



// bulk add through a get request
// router.get('/bulk', (req, res) => {
//     console.log('bulk add through a get request');
//     res.json({result: 'uncomment to bulk add'});
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
// })