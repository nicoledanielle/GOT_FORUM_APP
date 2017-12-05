'use strict';

const data = require('./seed-data');

const express = require('express');
const app = express();
app.use(express.static('public'));

// console.log(data);

app.get('/posts', function(req, res){
  res.json(data);
})

app.get('/posts/:id', function(req, res){
  console.log(req.params.id);
  res.json(data[0]);
})

app.post('/posts', function(req, res){
  console.log(req.body);
  //save req.body to dataBase
  res.json(req.body);
})

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err);
    });
  });
}
  
function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}
  
module.exports = {app, runServer, closeServer};