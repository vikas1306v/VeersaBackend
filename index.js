var express = require('express');
var app = express();
const dotenv = require('dotenv');
dotenv.config(); 
const connectToDB = require('./db/connection');
connectToDB();


app.get('/', function (req, res) {
  console.log(process.env.PORT)
  res.send('Hello World!');

});
app.listen(3000, function () {

  console.log('Example app listening on port 3000!');
});