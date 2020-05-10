const express= require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Vocab = require('../models/Vocab');


router.get('/full', (req, res) => {
    console.log('get full playlist info');
    let promiseList = [];
    let fullData = Vocab.aggregate([
        {
            $group: {
                _id: "$playlist.playlist_id",
                total: {$sum: 1},
                practiceA: {$push: {ever: "$everPracticed", lastPracticed: "$lastPracticed", mastered: "$mastered", isActive: "$isActive"}},
                playlistOrder: {
                    $first: "$playlist.order"
                },
                playlistName: {
                    $first: "$playlist.playlist_name"
                }
            }
        }
        ,
        {
            $unwind: {
                path: "$practiceA"
            }
        }
        ,
        {
            $sort: {
                "practiceA.lastPracticed": 1
            }
        }
        ,
        {
            $group: {
                _id: "$_id",
                playlistName: {
                    $first: "$playlistName"
                },
                playlistOrder: {
                    $first: "$playlistOrder"
                },
                total: {$sum: 1},
                inactive: {
                    $sum: {
                        $cond: ["$practiceA.isActive", 0, 1]
                    }
                },
                mastered: {
                    $sum: {
                        // $cond: ["$practiceA.mastered", 1, 0]
                        $cond: [
                            {$and: [
                                {$eq: ["$practiceA.mastered", true]},
                                {$eq: ["$practiceA.isActive", true]}
                            ]},
                            1,
                            0
                        ]
                    }
                },
                everPracticed: {
                    $sum: {
                        // $cond: ["$practiceA.ever", 1, 0]
                        $cond: [
                            {$and: [
                                {$eq: ["$practiceA.ever", true]},
                                {$eq: ["$practiceA.isActive", true]}
                            ]},
                            1,
                            0
                        ]
                    }
                },
                dates: {$push: "$practiceA.lastPracticed"},
                mastPractices: {$push: {
                    $cond: [
                        {$and: [
                            {$eq: ["$practiceA.ever", true]},
                            {$eq: ["$practiceA.mastered", true]},
                            {$eq: ["$practiceA.isActive", true]}
                        ]},
                        "$practiceA.lastPracticed",
                        null
                    ]
                }},
                unmastPractices: {$push: {
                    $cond: [
                        {$and: [
                            {$eq: ["$practiceA.ever", true]},
                            {$eq: ["$practiceA.mastered", false]},
                            {$eq: ["$practiceA.isActive", true]}
                        ]},
                        "$practiceA.lastPracticed",
                        null
                    ]
                }},
                practices: {$push: {
                    $cond: [
                        // {$eq: ["$practiceA.ever", true]},
                        {$and: [
                            {$eq: ["$practiceA.ever", true]},
                            {$eq: ["$practiceA.isActive", true]}
                        ]},
                        "$practiceA.lastPracticed",
                        null
                    ]
                }}
            }
        },
        {
            $project: {
                playlistName: 1,
                playlistOrder: 1,
                total: "$total",
                inactive: 1,
                mastered: 1,
                everPracticed: 1,
                mastPracticeTimes: {
                    $filter: {
                        input: "$mastPractices",
                        as: "mPractice",
                        cond: {
                            $ne: ["$$mPractice", null]
                        }
                    }
                },
                unmastPracticeTimes: {
                    $filter: {
                        input: "$unmastPractices",
                        as: "uPractice",
                        cond: {
                            $ne: ["$$uPractice", null]
                        }
                    }
                },
                practiceTimes: {
                    $filter: {
                        input: "$practices",
                        as: "pDate",
                        cond: {
                            $ne: ["$$pDate", null]
                        }
                    }
                },
                midPoint: {
                    $floor: {
                        $divide: [
                            "$everPracticed",2
                        ]
                    }
                }
            }
        },
        {
            $project: {
                playlistName: 1,
                playlistOrder: 1,
                total: 1,
                inactive: 1,
                mastered: 1,
                totalMastPract: {
                    $size: "$mastPracticeTimes"
                },
                totalUnmastPract: {
                    $size: "$unmastPracticeTimes"
                },
                everPracticed: 1,
                midPoint: 1,
                oldest: {
                    $min: "$practiceTimes"
                },
                midDate: {
                    $arrayElemAt: [
                        "$practiceTimes",
                        "$midPoint"
                    ]
                },
                newest: {
                    $max: "$practiceTimes"
                },
                oldestUnmast: {
                    $min: "$unmastPracticeTimes"
                }
            }

        },
        {
            $sort: {
                playlistOrder: 1
            }
        }
    ])
    promiseList.push(fullData);
    let basicData = Playlist.find();
    promiseList.push(basicData);
    Promise.all(promiseList)
        .then(data => {
            res.json({
                status: 'success',
                data: data
            })
        })
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
            })
        })
})

// get one playlist
router.get('/id/:playlistId', (req, res) => {
    console.log('getting one playlist');
    console.log(req.params.playlistId);
    Playlist.find({
        _id: {
            $eq: req.params.playlistId
        }
    })
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

// UPDATE PLAYLIST
// 
// CHANGES TO:
// ORDER
//
router.patch('/order', (req, res) => {
    console.log('update playlist order');
    let playlistId = req.body._id;
    let newOrder = req.body.order;
    Playlist.findByIdAndUpdate(
        playlistId,
        {
            order: newOrder
        },
        {
            new: false,
            useFindAndModify: false
        })
        .then(oldVersion => {
            Vocab.updateMany(
                {"playlist.playlist_id": playlistId},
                {$set: {
                    "playlist.order": newOrder
                }},
                {new: true}
            ).then(docs => {
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
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
            })
        })
})

// UPDATE PLAYLIST
// (changes to:)
//
// name
// isActive
//
router.patch('/', (req, res) => {
    console.log('updating playlist');
    console.log(req.body);
    let newName = req.body.name;
    let newStatus = req.body.isActive;
    let playlistId = req.body._id;
    Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: req.body.name,
            isActive: req.body.isActive
        },
        {
            new: false,
            useFindAndModify: false
        })
        .then(oldVersion => {
            let promiseList = [];
            if (newName !== oldVersion.name) {
                // update vocab entries with new playlist name
                console.log('name has been updated');
                let nameUpdate = Vocab.updateMany(
                    {"playlist.playlist_id": playlistId},
                    {$set: {
                        "playlist.playlist_name": newName
                    }},
                    {new: true}
                )
                promiseList.push(nameUpdate);
            }
            if (newStatus !== oldVersion.isActive) {
                // update vocab entries with new isActive status
                let statusUpdate = Vocab.updateMany(
                    {"playlist.playlist_id": playlistId},
                    {$set: {
                        "isActive": newStatus
                    }},
                    {new: true}
                );
                promiseList.push(statusUpdate);
            }
            Promise.all(promiseList)
                .then(data => {
                    res.json({
                        status: 'success',
                        data: data
                    })
                })
                .catch(err => {
                    res.json({
                        status: 'error',
                        data: err.message
                    })
                })
            // if (newName == oldVersion.name) {
            //     // vocab entries for this playlist do not need to be updated
            //     console.log('name has NOT been updated');
            //     res.json({
            //         status: 'success',
            //         data: oldVersion
            //     })
            // } else {
            //     // update vocab entries with new playlist name
            //     console.log('name has been updated');
            //     Vocab.updateMany(
            //         {"playlist.playlist_id": playlistId},
            //         {$set: {
            //             "playlist.playlist_name": newName
            //         }},
            //         {new: true}
            //     ).then(docs => {
            //         res.json({
            //             status: 'success',
            //             data: docs
            //         })
            //     })
            //     .catch(err => {
            //         res.json({
            //             status: 'error',
            //             data: err.message
            //         })
            //     })
            // }

        })
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
            })
        })
})

// delete playlist
router.delete('/id/:id', (req, res) => {
    console.log('deleting playlist');
    console.log(req.params);
    let deleteId = req.params.id;
    Vocab.updateMany({
        'playlist.playlist_id': {
            $eq: deleteId
        }},
        {
            $set: {
                "playlist.playlist_id": '',
                "playlist.playlist_name": '',
                "playlist.order": 999
            }
        })
        .then(docs => {
            Playlist.findByIdAndDelete(deleteId)
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
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
            })
        })
})

// delete playlist
// router.delete('/id/:id', (req, res) => {
//     console.log('deleting playlist from memberships');
//     let deletedId = req.params.id;
//     console.log(deletedId);
//     let promiseList = [];
//     Vocab.updateMany({
//         'memberships': {
//             $elemMatch: {
//                 'playlist_id': deletedId
//             }
//         }
//     },{
//         $pull: {
//             memberships: {playlist_id: deletedId}
//         }
//     })
//         .then(docs => {
//             Playlist.findByIdAndDelete(deletedId)
//                 .then(result => {
//                     res.json({
//                         status: "success",
//                         data: result
//                     })
//                 })
//                 .catch(err => {
//                     res.json({
//                         status: "failure",
//                         data: err.message
//                     })
//                 })
//         })
//         .catch(err => {
//             res.json({
//                 status: "failure",
//                 data: err.message
//             })
//         })
// })

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