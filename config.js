'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://dev:dev@ds133166.mlab.com:33166/got-forum';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                       'mongodb://localhost/test-got-forum-app';
exports.PORT = process.env.PORT || 8080; 
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';