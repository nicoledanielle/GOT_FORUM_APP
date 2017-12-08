'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://localhost/got-forum-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATBASE_URL ||
                       'mongodb://localhost/test-got-forum-app';
exports.PORT = process.env.PORT || 8080;