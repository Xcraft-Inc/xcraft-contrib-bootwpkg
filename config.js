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
    default: '1de77c233d2370b948a47c59e69d3d8155b65ee7',
  },
  {
    type: 'input',
    name: 'src',
    message: 'source URI',
    default:
      'https://github.com/Xcraft-Inc/wpkg/archive/1de77c233d2370b948a47c59e69d3d8155b65ee7.tar.gz',
  },
  {
    type: 'input',
    name: 'out',
    message: 'output directory',
    default: './usr',
  },
];
