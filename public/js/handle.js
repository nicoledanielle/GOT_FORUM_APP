/* global $, render, api, userSTORE */
'use strict';

var handle = {
  signup: function (event) {
    event.preventDefault();
    const el = $(event.target);
    const username = el.find('[name=username]').val().trim();
    const password = el.find('[name=password]').val().trim();
    el.trigger('reset');
    api.signup(username, password)
      .then(() => {
        userSTORE.view = 'login';
        render.page(userSTORE);
      }).catch(err => {
        if (err.reason === 'ValidationError') {
          console.error('ERROR:', err.reason, err.message);
        } else {
          console.error('ERROR:', err);
        }
      });
  },
  login: function (event) {
    event.preventDefault();
    const el = $(event.target);
    const username = el.find('[name=username]').val().trim();
    const password = el.find('[name=password]').val().trim();
    api.login(username, password)
      .then(response => {
        userSTORE.token = response.authToken;
        localStorage.setItem('authToken', userSTORE.token);
        handle.viewProtected(event);
      }).catch(err => {
        if (err.reason === 'ValidationError') {
          console.error('ERROR:', err.reason, err.message);
        } else {
          console.error('ERROR:', err);
        }
      });
  },
  refresh: function () {
    api.refresh(userSTORE.token)
      .then(response => {
        userSTORE.token = response.authToken;
        localStorage.setItem('authToken', userSTORE.token);
      }).catch(err => {
        userSTORE.token = null; // remove expired token
        localStorage.removeItem('authToken');
        console.error('ERROR:', err);
      });
  },

  viewProtected: function (event) {
    event.preventDefault();    
    api.protected(userSTORE.token)
      .then(response => {
        userSTORE.protected = response;
        render.results(userSTORE);
        userSTORE.view = 'protected';
        render.page(userSTORE);
      }).catch(err => {
        if (err.status === 401) {
          userSTORE.backTo = userSTORE.view;
          userSTORE.view = 'signup';
          render.page(userSTORE);
        }
        console.error('ERROR:', err);
      });
  },
  viewLogin: function (event) {
    event.preventDefault();
    userSTORE.view = 'login';
    render.page(userSTORE);
  },
  viewSignup: function (event) {
    event.preventDefault();
    userSTORE.view = 'signup';
    render.page(userSTORE);
  }
};