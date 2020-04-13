const express= require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Vocab = require('../models/Vocab');

// get all playlists
router.get('/', (req, res) => {
    console.log('getting all playlists');
    Playlist.find()
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

    // Playlist.findByIdAndDelete(req.params.id)
    //     .then(docs => {
    //         res.json({
    //             status: 'success',
    //             data: docs
    //         })
    //     })
    //     .catch(err => {
    //         res.json({
    //             status: 'failure',
    //             data: err
    //         })
    //     })
})

module.exports = router;