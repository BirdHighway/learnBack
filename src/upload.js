const IncomingForm = require('formidable').IncomingForm;

module.exports = function upload(req, res) {
    let form = new IncomingForm();

    form.on('file', (field, file) => {
        // do work on file / add to database
        // can be accessed using file.path
        // uploaded files are stored in a temporary directory
        // somewhere on the system
        // to do something with them, you can copy them from
        // there using the node.js file-system API

    })

    form.on('end', () => {
        res.json();
    })

    form.parse(req);
}