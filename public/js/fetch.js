'use strict';

const ITEMS_URL = 'http://localhost:8080';
const COMMENTS_ROUTE = 'comments';

function normalizeResponseErrors(res) {
  if (!res.ok) {
    if (
      res.headers.has('content-type') &&
      res.headers.get('content-type').startsWith('application/json')
    ) {
      return res.json().then(err => Promise.reject(err));
    }
    return Promise.reject({
      status: res.status,
      message: res.statusText
    });
  }
  return res;
}

var api = {
  register: function (username, password) {
    const url = '/api/auth/register';

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },

  login: function (username, password) {
    const url = '/api/auth/login';

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },

  search: function (query) {
    const url = `${ITEMS_URL}/posts`;

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  details: function (id) {
    const url = `${ITEMS_URL}/posts/${id}`;

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  create: function (document) {
    const url = `${ITEMS_URL}/posts`;
    console.log(document);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },  
  update: function (document) {
    const url = `${ITEMS_URL}/posts/${document.id}`;

    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    })
      .then(normalizeResponseErrors)
      .then(res => res.json());
  },
  remove: function (id) {
    const url = `${ITEMS_URL}/posts/${id}`;

    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.text());
  },
  comment: function(document) {
    console.log('document.id', document.id);
    const url = `${ITEMS_URL}/posts/${document.id.id}/${COMMENTS_ROUTE}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  }
};

// userSearch: function(authToken){
  //   const url = `${ITEMS_URL}/api/users/me`;
  
  //   return fetch(url, {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({authToken})
  //   }).then(normalizeResponseErrors)
  //     .then(res => res.json());
  // },


