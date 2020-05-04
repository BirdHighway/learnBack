const express= require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Vocab = require('../models/Vocab');

// special
// router.get('/special', (req, res) => {
//     console.log('special update');
//     let promiseList = [];
//     Playlist.collection.updateMany(
//         {},
//         {$unset: {
//             tags: 1
//         }}
//     ).then(docs => {
//             res.json({
//                 status: 'success',
//                 data: docs
//             })
//         })
//     .catch(err => {
//         res.json({
//             status: 'error',
//             data: err.message
//         })
//     })
// })

router.get('/full', (req, res) => {

    p = Vocab.aggregate([
        {
            $group: {
                _id: "$playlist.playlist_id",
                total: {$sum: 1},
                practiceA: {$push: {ever: "$everPracticed", lastPracticed: "$lastPracticed", mastered: "$mastered"}},
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
        },
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
                mastered: {
                    $sum: {
                        $cond: ["$practiceA.mastered", 1, 0]
                    }
                },
                everPracticed: {
                    $sum: {
                        $cond: ["$practiceA.ever", 1, 0]
                    }
                },
                dates: {$push: "$practiceA.lastPracticed"},
                mastPractices: {$push: {
                    $cond: [
                        {$and: [
                            {$eq: ["$practiceA.ever", true]},
                            {$eq: ["$practiceA.mastered", true]}
                        ]},
                        "$practiceA.lastPracticed",
                        null
                    ]
                }},
                unmastPractices: {$push: {
                    $cond: [
                        {$and: [
                            {$eq: ["$practiceA.ever", true]},
                            {$eq: ["$practiceA.mastered", false]}
                        ]},
                        "$practiceA.lastPracticed",
                        null
                    ]
                }},
                practices: {$push: {
                    $cond: [
                        {$eq: ["$practiceA.ever", true]},
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
                }
            }

        },
        {
            $sort: {
                playlistOrder: 1
            }
        }
    ])

    // p = Vocab.aggregate([
    //     {$facet: {
    //         "total": [
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1}
    //             }}
    //         ],
    //         "mastered": [
    //             {$match: {
    //                 mastered: true
    //             }},
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1}
    //             }}
    //         ],
    //         "unmastered": [
    //             {$match: {
    //                 mastered: false
    //             }},
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1}
    //             }}
    //         ],
    //         "practiced": [
    //             {$match: {
    //                 everPracticed: true
    //             }},
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1},
    //                 oldest: {$max: "$lastPracticed"},
    //             }}
    //         ],
    //         "past24": [
    //             {$match: {
    //                 everPracticed: true,
    //                 lastPracticed: {
    //                     $gt: new Date(new Date().setDate(new Date().getDate() - 1))
    //                 }
    //             }},
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1}
    //             }}
    //         ],
    //         "past48": [
    //             {$match: {
    //                 everPracticed: true,
    //                 lastPracticed: {
    //                     $gt: new Date(new Date().setDate(new Date().getDate() - 2))
    //                 }
    //             }},
    //             {$group: {
    //                 _id: "$playlist.playlist_name",
    //                 total: {$sum: 1}
    //             }}
    //         ]
    //     }}
    // ])
    
    // p = Vocab.aggregate([
    //     {$group: {
    //         _id: "$playlist.playlist_name",
    //         oldest: {$min: "$lastPracticed"},
    //         total: {$sum: 1}
    //     }}
    // ])
    
    p.then(data => {
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

// get full playlist information
// router.get('/full', (req, res) => {
//     console.log('getting full playlist information');
//     let sort = [
//         ["order", 1]
//     ];
//     let promiseList = [];
//     Playlist.find()
//         .sort(sort)
//         .then(docs => {

//             docs.forEach(d => {
//                 let id = d._id;
//                 console.log(d);
//                 p = Vocab.aggregate([
//                     {
//                         $facet:
//                         {
//                             "total": [
//                                 {
//                                     $match:
//                                         { "playlist.playlist_id": id}
//                                 }, { $count: "count" }]
//                             ,
//                             "mastered":
//                                 [{
//                                     $match:
//                                     { 
//                                         $and: [
//                                             { "playlist.playlist_id": id},
//                                             { mastered: true }]
//                                     }
//                                 },
//                                 { $count: "count" }],
//                             "unmastered":
//                                 [{$match: {
//                                         $and: [
//                                             { "playlist.playlist_id": id},
//                                             { mastered: false }]
//                                         }
//                                 },
//                                 { $count: "count"}],
//                             "oldest_unmastered":
//                                 [{$match: {
//                                         $and: [
//                                             { "playlist.playlist_id": id},
//                                             { mastered: false }]
//                                         }
//                                 },
//                                 { $sort: {
//                                     lastPracticed: 1
//                                 }}
//                             ],
//                             "oldest_mastered":
//                                 [{$match: {
//                                     $and: [
//                                         { "playlist.playlist_id": id},
//                                         { mastered: true }]
//                                     }
//                                 },
//                                 { $sort: {
//                                     lastPracticed: 1
//                                 }}
//                             ],
//                         }
//                     },
//                 {
//                     $project: {
//                         "total": {$arrayElemAt: ["$total.count",0]},
//                         "mastered": {$arrayElemAt: ["$mastered.count",0]},
//                         "unmastered": {$arrayElemAt: ["$unmastered.count",0]},
//                         "oldest_unmastered": {$arrayElemAt: ["$oldest_unmastered.lastPracticed",0]},
//                         "oldest_mastered": {$arrayElemAt: ["$oldest_mastered.lastPracticed",0]}
//                     }
//                 }]).exec();
//                 promiseList.push(p);
//             })

//             Promise.all(promiseList)
//                 .then(data => {
//                     res.json({
//                         status: 'success',
//                         data: [data, docs]
//                     })
//                 })
//                 .catch(err => {
//                     res.json({
//                         status: 'error',
//                         data: err.message
//                     })
//                 })

//             // Vocab.aggregate([
//             //     {
//             //         $facet:
//             //         {
//             //             "total": [
//             //                 {
//             //                     $match:
//             //                         { "playlist.playlist_id": "5e9b983f99ac7e08cb429652"}
//             //                 }, { $count: "count" }]
//             //             ,
//             //             "mastered":
//             //                 [{
//             //                     $match:
//             //                     { 
//             //                         $and: [
//             //                             { "playlist.playlist_id": "5e9b983f99ac7e08cb429652"},
//             //                             { mastered: true }]
//             //                     }
//             //                 },
//             //                 { $count: "count" }],
//             //             "unmastered":
//             //                 [{$match: {
//             //                         $and: [
//             //                             { "playlist.playlist_id": "5e9b983f99ac7e08cb429652"},
//             //                             { mastered: false }]
//             //                         }
//             //                 },
//             //                 { $count: "count"}],
//             //             "oldest_unmastered":
//             //                 [{$match: {
//             //                         $and: [
//             //                             { "playlist.playlist_id": "5e9b983f99ac7e08cb429652"},
//             //                             { mastered: false }]
//             //                         }
//             //                 },
//             //                 { $sort: {
//             //                     lastPracticed: 1
//             //                 }}
//             //             ],
//             //             "oldest_mastered":
//             //                 [{$match: {
//             //                     $and: [
//             //                         { "playlist.playlist_id": "5e9b983f99ac7e08cb429652"},
//             //                         { mastered: true }]
//             //                     }
//             //                 },
//             //                 { $sort: {
//             //                     lastPracticed: 1
//             //                 }}
//             //             ],
//             //         }
//             //     },
//             // {
//             //     $project: {
//             //         "total": {$arrayElemAt: ["$total.count",0]},
//             //         "mastered": {$arrayElemAt: ["$mastered.count",0]},
//             //         "unmastered": {$arrayElemAt: ["$unmastered.count",0]},
//             //         "oldest_unmastered": {$arrayElemAt: ["$oldest_unmastered.lastPracticed",0]},
//             //         "oldest_mastered": {$arrayElemAt: ["$oldest_mastered.lastPracticed",0]}
//             //     }
//             // }])
//             //     .then(data => {
//             //         res.json({
//             //             status: 'success',
//             //             data: data
//             //         })
//             //     })
//             //     .catch(err => {
//             //         res.json({
//             //             status: 'error',
//             //             data: err.message
//             //         })
//             //     })
//         })
//         .catch(err => {
//             res.json({
//                 status: 'error',
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
    let id = req.body.playlist_id;
    let name = req.body.playlist_name;
    let order = req.body.order;
    Playlist.findByIdAndUpdate(id, {name: name, order: order}, {new: false, useFindAndModify: false})
        .then(docs => {
            Vocab.updateMany(
                {"playlist.playlist_id": id},
                {$set: {
                    "playlist.playlist_name": name,
                    "playlist.order": order
                }},
                {new: true})
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
        .catch(err => {
            res.json({
                status: 'error',
                data: err.message
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