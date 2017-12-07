'use strict';

const data = require('./seed-data');
const bodyParser = require('body-parser');

const passport = require('passport');
const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {Post} = require('./models');
const {DATABASE_URL, PORT} = require('./config');
const {router: authRouter,  localStrategy, jwtStrategy } = require('./auth');
const {router: userRouter, User} = require('./users');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

//****auth */
// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', userRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});
//******auth */


app.get('/posts', function(req, res){
  Post
    .find()
    .then(posts => {res.json(posts.map(post => post.apiRepr()));})
    .catch (err => {
      console.error(err);
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
  // const requiredFields = ['author', 'title', 'content'];
  const requiredFields = ['title', 'content'];
  for (let i=0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Post
    .create({
      title: req.body.title,
      content: req.body.content,
      // author: req.body.author
    })
    .then(forumPost =>{
      console.log(forumPost);
      res.status(201).json(forumPost.apiRepr());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
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

app.put('/posts/:id', function(req, res){
  if(!(req.params.id && req.body.id === req.body.id)){
    res.status(400).json({
      error: 'Request path ID and request body ID must match'
    });
  }
  const updated = {};
  const updatableFields = ['title', 'content'];
  updatableFields.forEach(field => {
    if(field in req.body){
      updated[field] = req.body[field];
    }
  });
  Post
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => {
      res.status(204).end();
    })
    .catch(err => {
      res.status(500).json({message: 'Something went wrong'});
    });
});

app.post('/posts/:id/comments', function(req, res){

  const requiredFields = ['author','content'];
  for(let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Post
    .findByIdAndUpdate(req.params.id, {'$push': 
      {'comments': {
        'author': req.body.author,
        'content': req.body.content,
      }}
    }, {new: true})
    .then(post =>{
      console.log(post);
      res.json(post);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});

app.put('/posts/:id1/comments/:id2', function(req, res){
  if(!(req.params.id1 && req.body.id1 === req.body.id1 || req.params.id2 && req.body.id2 === req.body.id2)){
    res.status(400).json({
      error: 'Request path ID and request body ID must match'
    });
  }
  const updated = {};
  const updatable = ['content'];
  updatable.forEach(updatableField => {
    if (updatableField in req.body){
      updated[updatableField]=req.body[updatableField];
    }
  });
  Post
    .update({_id: req.params.id1, 'comments._id': req.params.id2}, {$set: {'comments.$': updated}}, {new: true})
    .then( post => {
      //console.log(post);
      res.status(201).end()
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({message: 'Something went wrong'});
    });
});

app.delete('/posts/:id1/comments/:id2', function(req, res){
  console.log(req.params.id1)

    Post.update(
      { _id: req.params.id1 },
      { $pull: { 'comments':{_id: req.params.id2}} }
    )
      .then( result => {
        console.log(result);
        res.status(204).end();
      });
});

app.use('/api/auth', userRouter);

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      mongoose.connect(DATABASE_URL, {useMongoClient: true});
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