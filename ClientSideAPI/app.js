const express = require('express');
const app = express();
const getData = require('./routes/getData');
const config = require('../config.json')
app.use('/getData',getData);

app.listen(config.port,()=>{
    console.log(`server running on port ${config.port}`)
})