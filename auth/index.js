'use strict';
const {router} = require('./router');
const {localStrategy, jwtStrategy} = require('./strategies');

module.exports = {router, localStrategy, jwtStrategy};

// ``` fetch('http://localhost:8080/api/protected', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//        Authorization: `Bearer ${authToken}`
//     }
//   }) ```


// new messages
// [4:00] 
// `localStorage.setItem('token', authToken)`


// [4:00] 
// ` const authToken = localStorage.getItem('token')`