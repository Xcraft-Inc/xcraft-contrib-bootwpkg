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
    default: '22f22df29a0bd3defffc5db5527aef21404896fd',
  },
  {
    type: 'input',
    name: 'src',
    message: 'source URI',
    default:
      'https://github.com/Xcraft-Inc/wpkg/archive/22f22df29a0bd3defffc5db5527aef21404896fd.tar.gz',
  },
  {
    type: 'input',
    name: 'out',
    message: 'output directory',
    default: './usr',
  },
];
