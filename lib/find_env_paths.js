'use strict';

var fs = require('fs');
var path = require('path');
var buildConfigName = require('./build_config_name');
var fileSearch = require('./file_search');

function findEnvPaths(opts, configName, extensions, searchPaths) {
  var cwd, configPath, configBase;

  var configNameSearch = buildConfigName({
    configName: configName,
    extensions: Object.keys(extensions),
  });

  if (opts.cwd) {
    cwd = path.resolve(opts.cwd);
    if (opts.configPath) {
      configPath = path.resolve(opts.configPath);
    } else {
      searchPaths = [cwd];
      configPath = fileSearch(configNameSearch, searchPaths);
    }
    if (configPath) {
      configBase = path.dirname(configPath);
    }

  } else if (opts.configPath) {
    configPath = path.resolve(opts.configPath);
    configBase = path.dirname(configPath);
    cwd = configBase;

  } else {
    cwd = process.cwd();
    searchPaths = [cwd].concat(searchPaths);
    configPath = fileSearch(configNameSearch, searchPaths);
    if (configPath) {
      configBase = path.dirname(configPath);
      cwd = configBase;
    }
  }

  try {
    fs.statSync(configPath);
  } catch (e) {
    configPath = null;
  }

  return {
    cwd: cwd,
    configPath: configPath,
    configBase: configBase,
    configNameSearch: configNameSearch,
  };
}

module.exports = findEnvPaths;
