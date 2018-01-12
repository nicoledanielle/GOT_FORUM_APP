/* global jQuery, handle, $, api,  */
'use strict';

const STORE = {
  authToken: undefined,
  demo: false,  
  view: 'list',
  protected: null,
  query: {},     
  list: null,      
  item: null,
};

const handle =  {

  viewRegister: function (event) {
    event.preventDefault();
    const store = event.data;
    store.view = 'signup';
    render.page(store);
  },

  register: function (event) {
    event.preventDefault();
    const username = $('.username').val();
    const password = $('.password').val();
  
    api.register(username, password)
      .then(response => {
        const store = event.data;
        store.view = 'list';
        render.page(store);
      }).catch(err => {
        console.error(err);
      });
  },

  viewLogin: function (event) {
    event.preventDefault();
    const store = event.data;
    store.view = 'login';
    render.page(store);
  },
  
  login: function (event) {
    event.preventDefault();
    const username = $('.username').val();
    const password = $('.password').val();
    const store = event.data;
    api.login(username, password)
      .then(response => {
        STORE.authToken = response.authToken;
        localStorage.setItem('authToken', store.authToken);
        Cookies.set('got-forum', STORE.authToken);
        handle.viewProtected(event);
      }).catch(err => {
        console.error(err);
      });
  },
  
  viewProtected: function () {
    api.protected(STORE.token)
      .then(response => {
        STORE.protected = response;
        render.results(STORE);
        STORE.view = 'protected';
        render.page(STORE);
      }).catch(err => {
        if (err.status === 401) {
          STORE.backTo = STORE.view;
          STORE.view = 'signup';
          render.page(STORE);
        }
        console.error('ERROR:', err);
      });
  },

  viewList: function (event) {
    event.preventDefault();
    const store = event.data;
    if (!store.list) {
      handle.search(event);
      return;
    }
    store.view = 'search';
    render.page(store);
  },

  search: function (event) {
    event.preventDefault();
    const store = event.data;
    const el = $(event.target);
    const title = el.find('[name=title]').val();
    var query;
    if (title) {
      query = {
        title: el.find('[name=title]').val()
      };
    }
    api.search(query)
      .then(response => {
        store.list = response;
        render.results(store);
  
        store.view = 'search';
        render.page(store);
      }).catch(err => {
        console.error(err);
      });
  },

  viewCreate: function (event) {
    event.preventDefault();
    const store = event.data;
    store.view = 'create';
    render.page(store);
  },

  create: function (event) {
    event.preventDefault();
    const store = event.data;
    const el = $(event.target);
    const document = {
      authToken: STORE.authToken,
      title: el.find('[name=title]').val(),
      content: el.find('[name=content]').val()
    };
    api.create(document)
      .then(response => {
        console.log('create response', response);
        store.item = response;
        store.list = null;
        render.detail(store);
        store.view = 'detail';
        render.page(store);
      }).catch(err => {
        console.error(err);
      });
  },

  viewComment: function(event){
    event.preventDefault();
    const store = event.data;
    store.view = 'comment-wizard';
    render.page(store);
  },  

  addComment: function(event){
    event.preventDefault();
    const store = event.data;
  
    const el = $(event.target);
  
    const document = {
      id: store.item,
      // author: el.find('.author').text(store.item.author.username),
      content: el.find('[name=content]').val()
    };
    api.comment(document)
      .then(response => {
        store.item = response;
        store.list = null;
        render.detail(store);
        store.view = 'detail';
        render.page(store);
      }).catch(err => {
        console.error(err);
      });
  },

  viewEdit: function (event) {
    event.preventDefault();
    const store = event.data;
    render.edit(store);
  
    store.view = 'edit';
    render.page(store);
  },
  
  update: function (event) {
    event.preventDefault();
    const store = event.data;
    const el = $(event.target);
  
    const document = {
      id: store.item.id,
      title: el.find('[name=title]').val(),
      content: el.find('[name=content]').val()
    };
    console.log(document);
    api.update(document)
      .then(response => {
        console.log(response);
        store.item = response;
        store.list = null;
        render.detail(store);
        store.view = 'detail';
        render.page(store);
      }).catch(err => {
        console.error(err.stack);
      });
  },

  details: function (event) {
    event.preventDefault();
    const store = event.data;
    const el = $(event.target);
  
    const id = el.closest('li').attr('id');
    api.details(id)
      .then(response => {
        store.item = response;
        render.detail(store);
  
        store.view = 'detail';
        render.page(store);
  
      }).catch(err => {
        store.error = err;
      });
  },

  remove: function (event) {
    event.preventDefault();
    const store = event.data;
    const id = store.item.id;
  
    // api.remove(id, store.token)
    api.remove(id)
      .then(() => {
        store.list = null; //invalidate cached list results
        return handleSearch(event);
      }).catch(err => {
        console.error(err);
      });
  },
};

const render = {
  page: function (store) {
    if (store.demo) {
      $('.view').css('background-color', 'gray');
      $('#' + store.view).css('background-color', 'white');
    } else {
      $('.view').hide();
      $('#' + store.view).show();
    }
  },

  results: function (store) {
    const listItems = store.list.map((item) => {
      let date = new Date(item.publishedAt); 
      (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
      return `<li class="list-results" id="${item.id}">
      <span class="time-stamp">${date.toString().split(' ').slice(0, 5).join(' ')}
      </span><a href="${item.url}" class="detail">${item.title}</a><span class="author-name">Posted By: ${item.author.username}</span><span class="comment-count">${item.comments.length} Comments
      </span></li>`;
    });
    $('#result').empty().append('<ul>').find('ul').append(listItems);
  },

  edit: function (store) {
    const el = $('#edit');
    const item = store.item;
    el.find('[name=title]').val(item.title);
    el.find('[name=content]').val(item.content);
  },

  detail: function (store) {
    const el = $('#detail');
    const item = store.item;
    let date = new Date(item.publishedAt); 
    (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    
    el.find('.author').text(item.author.username);
    el.find('.title').text(item.title);
    el.find('.content').text(item.content);
    el.find('.date').text(date.toString().split(' ').slice(0, 5).join(' '));
    el.find('.comments').html(item.comments.map(function(val){
      let dateComments = new Date(val.publishedAt); 
      (dateComments.getMonth() + 1) + '/' + dateComments.getDate() + '/' + dateComments.getFullYear();
      
      return `<li>${val.author} said: "${val.content}" on ${dateComments.toString().split(' ').slice(0, 5).join(' ')}
      </li>`;
    }).join(''));
  },

};

const checkCookies = function () {
  let cookie = Cookies.get( 'got-forum' );
  if (cookie === undefined) {
    handle.viewLogin();
  }
  else {
    handle.viewProtected();
  }
};

jQuery(function ($) {

  $(document).on('load', checkCookies());

  $('#create').on('submit', STORE, handle.create);
  $('#search').on('submit', STORE, handle.search);
  $('#edit').on('submit', STORE, handle.update);

  $('#signup').on('submit', STORE, handle.register);
  $('#login').on('submit', STORE, handle.login);

  $('#comment-wizard').on('submit', STORE, handle.addComment);

  $('#result').on('click', '.detail', STORE, handle.details);
  $('#detail').on('click', '.remove', STORE, handle.remove);
  $('#detail').on('click', '.edit', STORE, handle.viewEdit);
  $('#detail').on('click', '.leave-comment', STORE, handle.viewComment);

  $(document).on('click', '.viewLogin', STORE, handle.viewLogin);
  $(document).on('click', '.viewSignup', STORE, handle.viewRegister);
  $(document).on('click', '.viewCreate', STORE, handle.viewCreate);
  $(document).on('click', '.viewList', STORE, handle.viewList);

  // start app by triggering a search
  $('#search').trigger('submit');
  $('.viewProtected').trigger('click');
});

