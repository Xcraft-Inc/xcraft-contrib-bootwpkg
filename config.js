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
    default: '9abb74b21fc1a451751de5ea269bc5c9422718ea',
  },
  {
    type: 'input',
    name: 'src',
    message: 'source URI',
    default:
      'https://github.com/Xcraft-Inc/wpkg/archive/9abb74b21fc1a451751de5ea269bc5c9422718ea.tar.gz',
  },
  {
    type: 'input',
    name: 'out',
    message: 'output directory',
    default: './usr',
  },
];
