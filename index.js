var util = require('util');
var EE = require('events').EventEmitter;

var extend = require('extend');
var resolve = require('resolve');
var flaggedRespawn = require('flagged-respawn');

var parseOptions = require('./lib/parse_options');
var getNodeFlags = require('./lib/get_node_flags');

var loadConfigFiles = require('./lib/load_config_files');
var findEnvPaths = require('./lib/find_env_paths');
var findModulePackage = require('./lib/find_module_package');
var preloadModules = require('./lib/preload_modules');

function Liftoff(opts) {
  EE.call(this);
  extend(this, parseOptions(opts));
}
util.inherits(Liftoff, EE);

Liftoff.prototype.requireLocal = function(moduleName, basedir) {
  try {
    this.emit('beforeRequire', moduleName);
    var result = require(resolve.sync(moduleName, { basedir: basedir }));
    this.emit('require', moduleName, result);
    return result;
  } catch (e) {
    this.emit('requireFail', moduleName, e);
  }
};

Liftoff.prototype.buildEnvironment = function(opts) {
  opts = opts || {};

  var cfg = loadConfigFiles(this.configFiles, opts, this.extensions, this);
  var env = findEnvPaths(opts, this.configName, this.extensions,
    this.searchPaths);
  var mod = findModulePackage(this.moduleName, env.configBase, env.cwd);

  return {
    cwd: env.cwd,
    require: [].concat(opts.require || []),
    configNameSearch: env.configNameSearch,
    configPath: env.configPath,
    configBase: env.configBase,
    modulePath: mod.modulePath,
    modulePackage: mod.modulePackage || {},
    configs: cfg,
  };
};

Liftoff.prototype.handleFlags = function(cb) {
  if (typeof this.v8flags === 'function') {
    this.v8flags(function(err, flags) {
      if (err) {
        cb(err);
      } else {
        cb(null, flags);
      }
    });
  } else {
    process.nextTick(function() {
      cb(null, this.v8flags);
    }.bind(this));
  }
};

Liftoff.prototype.prepare = function(opts, fn) {
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  opts = opts || {};

  process.title = this.processTitle;

  var completion = opts.completion;
  if (completion && this.completions) {
    return this.completions(completion);
  }

  var env = this.buildEnvironment(opts);

  fn.call(this, env);
};

Liftoff.prototype.execute = function(env, forcedFlags, fn) {
  if (typeof forcedFlags === 'function') {
    fn = forcedFlags;
    forcedFlags = undefined;
  }
  if (typeof fn !== 'function') {
    throw new Error('You must provide a callback function.');
  }

  this.handleFlags(function(err, flags) {
    if (err) {
      throw err;
    }
    flags = flags || [];

    flaggedRespawn(flags, process.argv, forcedFlags, execute.bind(this));

    function execute(ready, child, argv) {
      if (child !== process) {
        var execArgv = getNodeFlags.fromReorderedArgv(argv);
        this.emit('respawn', execArgv, child);
      }
      if (ready) {
        preloadModules(this, env);
        fn.call(this, env, argv);
      }
    }
  }.bind(this));
};

module.exports = Liftoff;
