'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const PostSchema = new mongoose.Schema({
  author: {type: String, required: true},
  title: {type: String, required: true},
  content: {type: String, required: true},
  publishedAt: {type: Date, default: Date.now},
  //come back to update category
  category: {type: String},
  comments: [cCmmentSchema]
});

const CommentSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: {type: String, required: true},
  publishedAt: {type: Date, default: Date.now}
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  location: {
    type: String
  }
});

let User = mongoose.model('User', UserSchema);