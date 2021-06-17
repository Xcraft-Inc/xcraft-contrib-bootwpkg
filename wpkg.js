'use strict';

var path = require('path');
var async = require('async');

const xCMake = require('xcraft-contrib-bootcmake');
const xPlatform = require('xcraft-core-platform');
const xFs = require('xcraft-core-fs');

var cmd = {};

/* TODO: must be generic. */
var makeRun = function (makeDir, resp, callback) {
  const pkgConfig = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-bootwpkg'
  );

  resp.log.info('begin building of wpkg');

  var make = 'make';

  if (xPlatform.getOs() === 'win') {
    make = 'mingw32-make';
  }

  var os = require('os');
  var list = ['all'];

  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    parser: 'cmake',
    resp,
  });

  var currentDir = process.cwd();
  process.chdir(makeDir);
  async.eachSeries(
    list,
    function (args, callback) {
      var fullArgs = ['-j' + os.cpus().length].concat(args);

      xProcess.spawn(make, fullArgs, {}, function (err) {
        callback(err ? 'make failed: ' + err : null);
      });
    },
    function (err) {
      process.chdir(currentDir);

      if (!err) {
        xFs.cp(path.join(makeDir, 'dist/usr'), path.resolve(pkgConfig.out));
        resp.log.info('wpkg is built and installed');
      }

      callback(err ? 'make failed' : null);
    }
  );
};

/* TODO: must be generic. */
var cmakeRun = function (srcDir, resp, callback) {
  /* FIXME, TODO: use a backend (a module) for building with cmake. */
  /* cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make all install */

  var buildDir = path.join(srcDir, '../BUILD_WPKG');
  xFs.rm(buildDir);
  xFs.mkdir(buildDir);

  var args = [
    '-DCMAKE_COLOR_MAKEFILE=OFF',
    '-DCMAKE_BUILD_TYPE=Release',
    `-DCMAKE_CXX_FLAGS=-Wl,-rpath,../lib`,
  ];

  if (xPlatform.getOs() === 'win') {
    args.unshift('-G', 'MinGW Makefiles');
  }

  args.push(srcDir);

  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    parser: 'cmake',
    resp,
  });

  var currentDir = process.cwd();
  process.chdir(buildDir);
  xProcess.spawn('cmake', args, {}, function (err) {
    process.chdir(currentDir);
    callback(err ? 'cmake failed: ' + err : null);
  });
};

/**
 * Build the wpkg package.
 */
cmd.build = function (msg, resp) {
  const xcraftConfig = require('xcraft-core-etc')(null, resp).load('xcraft');
  const pkgConfig = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-bootwpkg'
  );
  var xEnv = require('xcraft-core-env');

  var archive = path.basename(pkgConfig.src);
  var inputFile = pkgConfig.src;
  var outputFile = path.join(xcraftConfig.tempRoot, 'src', archive);

  async.auto(
    {
      taskHttp: function (callback) {
        var xHttp = require('xcraft-core-http');

        xHttp.get(
          inputFile,
          outputFile,
          function () {
            callback();
          },
          function (progress, total) {
            resp.log.progress('Downloading', progress, total);
          }
        );
      },

      taskExtract: [
        'taskHttp',
        function (callback) {
          var xExtract = require('xcraft-core-extract');
          var outDir = path.dirname(outputFile);

          /* HACK: a very long filename exists in the tarball, then it is a
           *       problem for node.js and the 260 chars limitation.
           */
          xExtract.targz(
            outputFile,
            outDir,
            /very-very-very-long/,
            resp,
            function (err) {
              var srcDir = path.join(
                xcraftConfig.tempRoot,
                'src',
                `${pkgConfig.name}-${pkgConfig.version}`
              );
              callback(err ? 'extract failed: ' + err : null, srcDir);
            },
            function (progress, total) {
              resp.log.progress('Extracting', progress, total);
            }
          );
        },
      ],

      taskMSYS: [
        'taskExtract',
        function (callback) {
          if (xPlatform.getOs() === 'win') {
            callback(null, xCMake.stripShForMinGW());
            return;
          }
          callback();
        },
      ],

      taskCMake: [
        'taskMSYS',
        function (callback, results) {
          cmakeRun(results.taskExtract, resp, callback);
        },
      ],

      taskMake: [
        'taskCMake',
        function (callback, results) {
          makeRun(
            path.join(results.taskExtract, '../BUILD_WPKG'),
            resp,
            callback
          );
        },
      ],
    },
    function (err, results) {
      if (err) {
        resp.log.err(err);
      }

      /* Restore MSYS path. */
      if (results.taskMSYS) {
        for (const p of results.taskMSYS) {
          xEnv.var.path.insert(p.index, p.location);
        }
      }

      resp.events.send(`wpkg.build.${msg.id}.finished`);
    }
  );
};

/**
 * Retrieve the list of available commands.
 *
 * @returns {Object} The list and definitions of commands.
 */
exports.xcraftCommands = function () {
  return {
    handlers: cmd,
    rc: {
      build: {
        desc: 'build and install WPKG',
      },
    },
  };
};
