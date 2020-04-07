require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
console.log('index.js loaded...');

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src/audio'));

// vocab entries
const vocabRoutes = require('./routes/Vocab');
app.use('/vocab', vocabRoutes);

// import other routes
// const nounRoutes = require('./routes/Nouns');
// app.use('/nouns', nounRoutes);
// const adjectiveRoutes = require('./routes/Adjective');
// app.use('/adjectives', adjectiveRoutes);
const nounRoutes = require('./routes/Nouns');
app.use('/nouns', nounRoutes);
// const tagRoutes = require('./routes/Tag');
// app.use('/tags', tagRoutes);
// const genericRoutes = require('./routes/GenericEntry');
// app.use('/generics', genericRoutes);

// home route
app.get('/', (req, res) => {
    console.log('GET request for "/"');
    res.send('Home page content');
})

// upload
const upload = require('./upload');
app.post('/upload', upload);

app.listen(process.env.PORT, () => {
    console.log(`app listening on port ${process.env.PORT}`);
})