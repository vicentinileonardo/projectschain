const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// serve static files
//app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ msg: 'hello!' });
})

// start the server
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});


/**
 * 
 * token id
 * indirizzo ipfs
 * etc
 * 
 */