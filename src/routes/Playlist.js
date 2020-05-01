const express= require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Vocab = require('../models/Vocab');

// router.get('/special', (req, res) => {
//     let promiseList = [];
//     Playlist.find()
//         .sort([["order", 1]])
//         .then(playlists => {
//             let obj = {};
//             playlists.forEach(p => {
//                 obj[p._id] = p.order;
//             })
//             console.log(obj);
//             Vocab.find()
//                 .then(docs => {
//                     docs.forEach(d => {
//                         d.playlist.order = obj[d.playlist.playlist_id];
//                         d.save();
//                         promiseList.push(d);
//                     })
//                     Promise.all(promiseList)
//                         .then(data => {
//                             res.json({
//                                 d: data
//                             })
//                         })
//                         .catch(err => {
//                             res.json({
//                                 d: err.message
//                             })
//                         })
//                 })
//                 .catch(err => {
//                     res.json({
//                         em: err.message
//                     })
//                 })
//         })
//         .catch(err => {
//             res.json({
//                 data: err.message
//             })
//         })
// })

// get all playlists
router.get('/', (req, res) => {
    console.log('getting all playlists');
    let sort = [
        ["order", 1]
    ]
    Playlist.find()
        .sort(sort)
        .then(docs => {
            res.json({
                status: 'success',
                data: docs
            })
        })
        .catch(err => {
            res.json({
                status: 'error',
                message: err.message
            })
        })
})

// add playlist
router.post('/', (req, res) => {
    console.log('adding playlist');
    let playlist = new Playlist(req.body);
    playlist.save()
        .then(docs => {
            res.json({
                status: 'success',
                data: docs
            })
        })
        .catch(err => {
            res.json({
                status: 'error',
                message: err.message
            })
        })
})

// update playlist
router.patch('/', (req, res) => {
    console.log('updating playlist with _id: ' + req.body._id);
    let newName = req.body.name;
    let playlistId = req.body._id
    Playlist.findByIdAndUpdate(req.body._id, req.body, {new: true})
        .then(docs => {
            Vocab.updateMany({
                'memberships': {
                    $elemMatch: {
                        'playlist_id': playlistId
                    }
                }
            },
            { $set: {"memberships.$[elem].playlist_name": newName} },
            { multi: true,
                arrayFilters: [ {"elem.playlist_id": playlistId} ]
            }).then(results => {
                res.json({
                    status: 'success',
                    data: results
                })
            })
            .catch(err => {
                res.json({
                    status: 'failure',
                    data: err.message
                })
            })
        })
        .catch(err => {
            res.json({
                status: 'error',
                message: err.message
            })
        })
})

// delete playlist
router.delete('/id/:id', (req, res) => {
    console.log('deleting playlist from memberships');
    let deletedId = req.params.id;
    console.log(deletedId);
    let promiseList = [];
    Vocab.updateMany({
        'memberships': {
            $elemMatch: {
                'playlist_id': deletedId
            }
        }
    },{
        $pull: {
            memberships: {playlist_id: deletedId}
        }
    })
        .then(docs => {
            Playlist.findByIdAndDelete(deletedId)
                .then(result => {
                    res.json({
                        status: "success",
                        data: result
                    })
                })
                .catch(err => {
                    res.json({
                        status: "failure",
                        data: err.message
                    })
                })
        })
        .catch(err => {
            res.json({
                status: "failure",
                data: err.message
            })
        })
})

module.exports = router;



// SPECIAL
// router.get('/special', (req, res) => {
//     console.log('special update to add count field');
//     let promiseList = [];
//     Playlist.find()
//         .then(playlists => {
//             playlists.forEach( p => {
//                 Vocab.countDocuments({
//                     "playlist.playlist_id": p._id,
//                     mastered: false
//                 }).then(num => {
//                     p.learning = num;
//                     p.save();
//                     promiseList.push(p);
//                 })
//                 .catch(err => {
//                     res.json({
//                         status: 'error',
//                         data: err.message
//                     })
//                 })
//             })
//         })
//         .catch(err => {
//             res.json({
//                 status: 'error',
//                 data: err.message
//             })
//         })
//         Promise.all(promiseList)
//             .then(data => {
//                 res.json({
//                     status: 'success',
//                     data: data
//                 })
//             })
//             .catch(err => {
//                 res.json({
//                     status: 'error',
//                     data: err.message
//                 })
//             })
// })