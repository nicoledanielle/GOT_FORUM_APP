'use strict';

function buildUrl(path, query) {
  var url = new URL(path, window.location.origin);
  if (query) {
    Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  }
  return url;
}

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
    // const url = buildUrl(ITEMS_URL, query);
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
    // const url = buildUrl(ITEMS_URL, query);
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
    const url = buildUrl(ITEMS_URL, query);

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  details: function (id) {
    const url = buildUrl(`${ITEMS_URL}/${id}`);

    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(normalizeResponseErrors)
      .then(res => res.json());
  },
  create: function (document) {
    const url = buildUrl(`${ITEMS_URL}`);

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
    const url = buildUrl(`${ITEMS_URL}/${document.id}`);
    
    // console.log('dev tools', document);

    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: document ? JSON.stringify(document) : null
    })
    .then(normalizeResponseErrors)
    // .then(res => {
    //   console.log(res.json());
    //   return res;
    // })
      .then(res => res.json());
  },
  remove: function (id) {
    const url = buildUrl(`${ITEMS_URL}/${id}`);

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
    const url = buildUrl(`${ITEMS_URL}/${document.id.id}/${COMMENTS_URL}`);

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


