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
    default: 'e6634fe760196078af984b949274ae02f130c66f',
  },
  {
    type: 'input',
    name: 'src',
    message: 'source URI',
    default:
      'https://github.com/Xcraft-Inc/wpkg/archive/e6634fe760196078af984b949274ae02f130c66f.tar.gz',
  },
  {
    type: 'input',
    name: 'out',
    message: 'output directory',
    default: './usr',
  },
];
