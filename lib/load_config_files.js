'use strict';

var mapValues = require('object.map');
var isPlainObject = require('is-plain-object');
var findCwd = require('./find_cwd');
var arrayFind = require('./array_find');
var loadExtendableFile = require('./load_extendable_file');

function loadConfigFiles(configFiles, opts, extensions, eventEmitter) {
  if (!isPlainObject(configFiles)) {
    return {};
  }

  var cwd = findCwd(opts);

  return mapValues(configFiles, function(searchPaths, fileStem) {
    var defaultObj = { name: fileStem, cwd: cwd, extensions: extensions };
    return arrayFind(searchPaths, function(pathObj) {
      return loadExtendableFile({}, pathObj, defaultObj, eventEmitter);
    });
  });
}

module.exports = loadConfigFiles;
