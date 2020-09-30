'use strict';

/**
 * Retrieve the inquirer definition for xcraft-core-etc.
 */
module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'package name',
    default: 'wpkg',
  },
  {
    type: 'input',
    name: 'version',
    message: 'version',
    default: 'ee773b0fe971ad9f83b908f62b27bb7ef37537e0',
  },
  {
    type: 'input',
    name: 'src',
    message: 'source URI',
    default:
      'https://github.com/Xcraft-Inc/wpkg/archive/ee773b0fe971ad9f83b908f62b27bb7ef37537e0.tar.gz',
  },
  {
    type: 'input',
    name: 'out',
    message: 'output directory',
    default: './usr',
  },
];
