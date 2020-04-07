const express = require('express');
const router = express.Router();
// MongoDb setup
const {MongoClient} = require('mongodb');
const uri = "mongodb://localhost:27017/learnArabic";
ObjectId = require('mongodb').ObjectID;


async function addTags(tagName, nounIds) {
    console.log(`tagName: ${tagName}`);
    console.log(`ids:`);
    
    console.log(nounIds);
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db('learnArabic');
        console.log(`Connected to database ${db.databaseName}`);

        const collection = db.collection("nouns");

        let objectIds = nounIds.map(s => ObjectId(s));

        let result = await collection.updateMany({_id: {$in: objectIds}}, {$push: {tags: tagName}});
        

    }
    catch (ex) {
        console.error(`Something bad happened: ${ex}`);
    }
    finally {
        client.close();
    }
}
 

// add tags to nouns
router.post('/add', (req, res) => {
    console.log('adding tags');
    
    addTags(req.body.tag, req.body.ids);




	res.json({message: 'success'})
})

module.exports = router;