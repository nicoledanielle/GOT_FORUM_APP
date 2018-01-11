/* global jQuery, handle, $, api,  */
'use strict';

const GLOBAL_STORE = {
  author: null
};

const handleRegister = function (event) {
  event.preventDefault();
  const username = $('.username').val();
  const password = $('.password').val();

  api.register(username, password)
    .then(response => {
      const store = event.data;
      store.view = 'list';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const handleLogin = function (event) {
  event.preventDefault();
  const username = $('.username').val();
  const password = $('.password').val();

  api.login(username, password)
    .then(response => {
      console.log(response);
      
      // store.view = 'list';
      // renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const renderPage = function (store) {
  if (store.demo) {
    $('.view').css('background-color', 'gray');
    $('#' + store.view).css('background-color', 'white');
  } else {
    $('.view').hide();
    $('#' + store.view).show();
  }
};

const renderResults = function (store) {
  const listItems = store.list.map((item) => {
    let date = new Date(item.publishedAt); 
    (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    return `<li class="list-results" id="${item.id}">
    <span class="time-stamp">${date.toString().split(' ').slice(0, 5).join(' ')}
    </span><a href="${item.url}" class="detail">${item.title}</a><span class="author-name">Posted By: ${item.author}</span><span class="comment-count">${item.comments.length} Comments
    </span></li>`;
  });
  $('#result').empty().append('<ul>').find('ul').append(listItems);
};

const renderEdit = function (store) {
  const el = $('#edit');
  const item = store.item;
  el.find('[name=title]').val(item.title);
  el.find('[name=content]').val(item.content);
}; 

const renderDetail = function (store) {
  const el = $('#detail');
  const item = store.item;
  let date = new Date(item.publishedAt); 
  (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
  
  el.find('.author').text(item.author);
  el.find('.title').text(item.title);
  el.find('.content').text(item.content);
  el.find('.date').text(date.toString().split(' ').slice(0, 5).join(' '));
  el.find('.comments').html(item.comments.map(function(val){
    let dateComments = new Date(val.publishedAt); 
    (dateComments.getMonth() + 1) + '/' + dateComments.getDate() + '/' + dateComments.getFullYear();
    
    return `<li>${val.author} said: "${val.content}" on ${dateComments.toString().split(' ').slice(0, 5).join(' ')}
    </li>`;
  }).join(''));
};

const handleSearch = function (event) {
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
      renderResults(store);

      store.view = 'search';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const handleCreate = function (event) {
  event.preventDefault();
  api.userSearch();
  console.log('logged in user', GLOBAL_STORE.author);
  const store = event.data;
  const el = $(event.target);
  const document = {
    author: GLOBAL_STORE.author,
    title: el.find('[name=title]').val(),
    content: el.find('[name=content]').val()
  };
  api.create(document)
    .then(response => {
      store.item = response;
      store.list = null; //invalidate cached list results
      renderDetail(store);
      store.view = 'detail';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const handleAddComment = function(event){
  event.preventDefault();
  const store = event.data;

  const el = $(event.target);

  const document = {
    id: store.item,
    author: el.find('[name=author]').val(),
    content: el.find('[name=content]').val()
  };
  api.comment(document)
    .then(response => {
      store.item = response;
      store.list = null;
      renderDetail(store);
      store.view = 'detail';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const handleUpdate = function (event) {
  event.preventDefault();
  console.log('event.data', event.data);
  const store = event.data;
  const el = $(event.target);

  const document = {
    id: store.item.id,
    title: el.find('[name=title]').val(),
    content: el.find('[name=content]').val()
  };
  // api.update(document, store.token)
  api.update(document)
    .then(response => {
      console.log(response);
      store.item = response;
      store.list = null; //invalidate cached list results
      renderDetail(store);
      store.view = 'detail';
      renderPage(store);
    }).catch(err => {
      console.error(err.stack);
    });
};

const handleDetails = function (event) {
  event.preventDefault();
  const store = event.data;
  const el = $(event.target);

  const id = el.closest('li').attr('id');
  api.details(id)
    .then(response => {
      store.item = response;
      renderDetail(store);

      store.view = 'detail';
      renderPage(store);

    }).catch(err => {
      store.error = err;
    });
};

const handleRemove = function (event) {
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
};
const handleViewRegister = function (event) {
  event.preventDefault();
  const store = event.data;
  store.view = 'signup';
  renderPage(store);
};
const handleViewLogin = function (event) {
  event.preventDefault();
  const store = event.data;
  store.view = 'login';
  renderPage(store);
};
const handleViewCreate = function (event) {
  event.preventDefault();
  const store = event.data;
  store.view = 'create';
  renderPage(store);
};
const handleViewList = function (event) {
  event.preventDefault();
  const store = event.data;
  if (!store.list) {
    handleSearch(event);
    return;
  }
  store.view = 'search';
  renderPage(store);
};
const handleViewEdit = function (event) {
  event.preventDefault();
  const store = event.data;
  renderEdit(store);

  store.view = 'edit';
  renderPage(store);
};

const handViewComment = function(event){
  event.preventDefault();
  const store = event.data;
  store.view = 'comment-wizard';
  renderPage(store);
};

//on document ready bind events
jQuery(function ($) {

  const STORE = {
    demo: false,        // display in demo mode true | false
    view: 'list',       // current view: list | details | create | edit 
    query: {},          // search query values
    list: null,         // search result - array of objects (documents)
    item: null,         // currently selected document
  };

  $('#create').on('submit', STORE, handleCreate);
  $('#search').on('submit', STORE, handleSearch);
  $('#edit').on('submit', STORE, handleUpdate);

  $('#signup').on('submit', STORE, handleRegister);
  $('#login').on('submit', STORE, handleLogin);

  $('#comment-wizard').on('submit', STORE, handleAddComment);

  $('#result').on('click', '.detail', STORE, handleDetails);
  $('#detail').on('click', '.remove', STORE, handleRemove);
  $('#detail').on('click', '.edit', STORE, handleViewEdit);
  $('#detail').on('click', '.leave-comment', STORE, handViewComment);

  $(document).on('click', '.viewLogin', STORE, handleViewLogin);
  $(document).on('click', '.viewSignup', STORE, handleViewRegister);
  $(document).on('click', '.viewCreate', STORE, handleViewCreate);
  $(document).on('click', '.viewList', STORE, handleViewList);

  // start app by triggering a search
  $('#search').trigger('submit');

});

