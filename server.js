'use strict';

const data = require('./seed-data');

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {User, Post} = require('./models');
const {DATABASE_URL, PORT} = require('./config');

app.use(express.static('public'));

app.get('/posts', function(req, res){
  Post
    .find()
    .then(posts => res.json(Post.apiRepr()))
    .catch (err => {
      console.err(err);
      res.status(500).json({error: 'something went wrong'});
    });
  // res.json(data);
});

app.get('/posts/:id', function(req, res){
  Post.findById(req.params.id)
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
  // console.log(req.params.id);
  // res.json(data[0]);
});

app.post('/posts', function(req, res){
  const requiredFields = ['author', 'title', 'content'];
  for (let i=0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Post
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(post => res.status(201).json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
  // console.log(req.body);
  // //save req.body to dataBase
  // res.json(req.body);
});

app.delete('/posts/:id', (req, res) => {
  Post
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});


let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      mongoose.connect(DATABASE_URL);
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