/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || path.join(__dirname, '../tsconfig.test.json');

require('ts-node/register/transpile-only');
require('tsconfig-paths/register');

// require chai plugins or mocha specific files here...
require('chai').use(require('chai-as-promised'));
