'use strict';

const {User} = require('./users/models.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  title: {type: String, required: true},
  content: {type: String, required: true},
  publishedAt: {type: Date, default: Date.now},
  comments: [{
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, required: true},
    publishedAt: {type: Date, default: Date.now}
  }]
});

PostSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    author: this.author,
    authorUsername: User.findOne({_id: this._id}).
      populate('username').
      exec(function(err){
        if (err) return console.error(err);
        console.log('username is', this.authorUsername);
      }),
    title: this.title,
    content: this.content,
    comments: this.comments,
    publishedAt: this.publishedAt
  };
};

let Post = mongoose.model('Post', PostSchema);

module.exports = {Post};