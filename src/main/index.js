'use strict';

const { Application } = require('./application');
const isDevelopment = process.env.NODE_ENV == 'development';

new Application(isDevelopment);
