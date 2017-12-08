'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const faker = require('faker');
const mongoose = require('mongoose');

const should = require('chai').should();

const { DATABASE_URL } = require('../config');
const { Post } = require('../models');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb(){
  return new Promise((resolve, reject) => {
    console.warn('Deleting test Database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedPostData(){
  console.info('Seeding the Forum with Posts');
  const seedData = [];
  for(let i=1; i<=10; i++){
    seedData.push({
      author: faker.lorem.text(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }
  return Post.insertMany(seedData);
}

describe('GOT Forum posts API resource', function(){
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });


  describe('Index load', function() {

    it('should return a 200 status code and HTML', function(){
      return chai.request(app)
        .get('/')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.html;
        });
    });
  });

  describe('GET endpoints', function(){
    it('should return all posts', function(){
      let res;
      return chai.request(app)
        .get('/posts')
        .then(result => {
          res=result;
          result.should.have.status(200);
          result.body.should.have.length.of.at.least(1);
          return Post.count();
        })
        .then(count => {
          res.body.length.should.be.equal(count);
        });
    });
    it('should return post with correct fields', function(){
      let postsResult;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
          
          res.body.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'author', 'title', 'content', 'publishedAt');
          });

          postsResult = res.body[0];
          return Post.findById(postsResult.id);
        })
        .then(post => {
          postsResult.title.should.equal(post.title);
          postsResult.content.should.equal(post.content);
        });
    });
  });

  describe('POST endpoints', function(){
    it('should add a new blog post', function() {
      
      const newPost = {
        author: faker.lorem.text(),
        title: faker.lorem.sentence(),
        content: faker.lorem.text()
      };
      
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'author', 'title', 'content', 'publishedAt');
          res.body.title.should.equal(newPost.title);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.content.should.equal(newPost.content);
          return Post.findById(res.body.id);
        })
        .then(function(post) {
          post.author.should.equal(newPost.author);
          post.title.should.equal(newPost.title);
          post.content.should.equal(newPost.content);
        });
    });
  });
  describe('PUT endpoints', function(){
    it('should update fields you send over', function() {
      const updateData = {
        title: 'cats cats cats',
        content: 'dogs dogs dogs'
      };

      return Post
        .findOne()
        .then(post => {
          updateData.id = post.id;

          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(201);
          return Post.findById(updateData.id);
        })
        .then(post => {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
        });
    });   
  });

  describe('DELETE endpoints', function(){
    it('should delete a post by id', function() {
      
      let post;
      
      return Post
        .findOne()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Post.findById(post.id);
        })
        .then(_post => {
          should.not.exist(_post);
        });
    }); 
  });
});



