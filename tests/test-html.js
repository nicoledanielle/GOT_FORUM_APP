'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');

const should = require('chai').should();

chai.use(chaiHttp);

describe('Index load', function() {
  before(function() {
    return runServer();
  });

  after(function (){
    return closeServer();
  });

  it('should return a 200 status code and HTML', function(){
    return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.html;
      });
  });
});