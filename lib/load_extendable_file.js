'use strict';

var path = require('path');
var fined = require('fined');
var isPlainObject = require('is-plain-object');
var defaultsDeep = require('@fav/prop.defaults-deep');
var registerLoader = require('./register_loader');

function loadExtendableFile(config, pathObj, defaultObj, eventEmitter,
    parentPath, visited) {

  var found = fined(pathObj, defaultObj);
  if (!found) {
    if (parentPath) {
      // emit an event for extends failure.
    }
    return config;
  }

  visited = visited || {};
  if (visited[found.path]) {
    // should we throw an error or emit an event against recursive extends?
    return config;
  }
  visited[found.path] = true;

  if (isPlainObject(found.extension)) {
    var cwd = pathObj.cwd || defaultObj.cwd;
    // should we distinguish a failure in the following function whether extends or not?
    registerLoader(eventEmitter, found.extension, found.path, cwd);
  }

  var loaded;
  try {
    loaded = require(found.path);
  } catch (e) {
    if (parentPath) {
      // emit an event for extends failure.
    } else {
      // eventEmitter.emit('preload:failure', found.path, e);
    }
    return;
  }

  if (!isPlainObject(loaded)) {
    return config;
  }
  config = defaultsDeep(config, loaded);

  if (loaded.extends) {
    var xtends = Array.isArray(loaded.extends) ?  loaded.extends :
      [loaded.extends];

    var defObj = {
      cwd: path.dirname(found.path),
      extensions: pathObj.extensions || defaultObj.extensions,
    };

    xtends.reduce(function(config, filePath) {
      return loadExtendableFile(config, filePath, defObj, eventEmitter,
        parentPath, visited);
    }, config);

    delete config.extends;
  }

  return config;
}

module.exports = loadExtendableFile;
