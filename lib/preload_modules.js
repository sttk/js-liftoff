'use strict';

var registerLoader = require('./register_loader');

function preloadModules(inst, env) {
  var basedir = env.cwd;
  env.require.filter(toUnique).forEach(function(module) {
    inst.requireLocal(module, basedir);
  });
  registerLoader(inst, inst.extensions, env.configPath, env.cwd);
}

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = preloadModules;
