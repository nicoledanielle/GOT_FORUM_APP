'use strict';

require('dotenv').config();
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const config = require('../config');
const router = express.Router();

const {User} = require('../users');

const createAuthToken = function(user) {
  return jwt.sign({user}, process.env.JWT_SECRET || 'fffff', {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});  

module.exports = {router};

router.post('/register', (req, res) => {
  
  let {username, password} = req.body;
  
  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        _id: new mongoose.Types.ObjectId(),
        username,
        password: hash,
      });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// router.get('/me', function(req, res) {
//   jwt.verify(req.body.authToken, process.env.JWT_SECRET, function(err, decodedUser) {
//     if (err) return console.log('No User Identified');
//     res.json({ user: decodedUser });
//   });
// });