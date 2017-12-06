'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CommentSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: {type: String, required: true},
  publishedAt: {type: Date, default: Date.now}
});

const PostSchema = new mongoose.Schema({
  author: {type: String, required: true},
  title: {type: String, required: true},
  content: {type: String, required: true},
  publishedAt: {type: Date, default: Date.now},
  //come back to update category
  category: {type: String},
  comments: [CommentSchema]
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
});

PostSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    author: this.author,
    title: this.title,
    content: this.content,
    publishedAt: this.publishedAt
  }
}

CommentSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    author: this.author,
    content: this.content,
    publishedAt: this.publishedAt
  }
}

let User = mongoose.model('User', UserSchema);
let Post = mongoose.model('Post', PostSchema);
let Comment = mongoose.model('Comment', CommentSchema);

module.exports = {User, Post, Comment};