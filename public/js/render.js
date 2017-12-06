/* global $ */
'use strict';

let render = {
    page: function (store) {
      $('.view').hide();
      $('#' + store.view).show();
    },
    results: function (store) {
      $('#result').empty().append(store.protected.data);
    },
  };