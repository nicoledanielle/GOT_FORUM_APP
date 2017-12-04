'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Index load', function() {
  before(function() {
    return runServer();
  });

  after(function (){
    return closeServer();
  });

  it('should return a 200 status code and HTML', function(expect, done){
    // let res;
    return chai.request(app)
      .get('/')
      .end(function(err, res) { 
        expect(res).to.have.status(200); done();
      // .then(function(res) {
      //   res.should.have.status(200);
      //   res.should.be.html;
      // });
      });
  });
});