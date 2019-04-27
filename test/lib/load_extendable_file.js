'use strict';

var chai = require('chai');
var expect = chai.expect;

var path = require('path');
var loadExtendableFile = require('../../lib/load_extendable_file');

describe('loadExtendableFile', function() {

  it('should not change the config when a config file is not found', function(done) {
    var config = {};
    var defaultObj = {
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configFiles'),
    };
    var ret = loadExtendableFile(config, './x.txt', defaultObj);
    expect(ret).to.deep.equal(config);
    done();
  });

  it('should load a config file by file path', function(done) {
    var config = {};
    var defaultObj = {
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configFiles'),
    };
    var ret = loadExtendableFile(config, './c.js', defaultObj);
    expect(ret).to.deep.equal({ c1: 'C1', c2: { c3: 123, c4: 'C4' } });
    done();
  });

  it('should load a config file by file name', function(done) {
    var config = {};
    var defaultObj = {
      name: 'c',
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configFiles'),
    };
    var ret = loadExtendableFile(config, { path: '.' }, defaultObj);
    expect(ret).to.deep.equal({ c1: 'C1', c2: { c3: 123, c4: 'C4' } });
    done();
  });

  it('should not override props in config', function(done) {
    var config = { c1: 'A', c2: { c3: 456 } };
    var defaultObj = {
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configFiles'),
    };
    var ret = loadExtendableFile(config, './c', defaultObj);
    expect(ret).to.deep.equal({ c1: 'A', c2: { c3: 456, c4: 'C4' } });
    done();
  });

  it('should extend a config file', function(done) {
    var defaultObj = {
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configFiles-extends'),
    };
    var ret = loadExtendableFile({}, './testconfig', defaultObj);
    expect(ret).to.deep.equal({
      aaa: 'AAA',
      bbb: 'BBB',
    });
    done();
  });

  it('should extend config file multiple times', function(done) {
    var defaultObj = {
      extensions: ['.js', '.json'],
      cwd: path.join(__dirname, '../fixtures/configfiles-extends'),
    };
    var ret = loadExtendableFile({}, './multi-extend', defaultObj);
    expect(ret).to.deep.equal({
      'multi-extend': 'loaded',
      b: 'loaded',
      b1: 'loaded',
      b2: 'loaded',
      c: 'loaded',
      foo: {
        bar: { baz: 'A', qux: 'B', quux: 'B1', corge: 'B2', grault: 'C' },
      },
    });
    done();
  });

  it.skip('should preload a loader for a extends config file', function() {
  });

  it.skip('should detect and rise an error against recursive extends', function() {
  });

  it.skip('should emit a failure event for extends when a extends config file is not found', function() {
  });

  it.skip('should emit a failure event for extends when a loader for a extends config file cannot be preloaded', function() {
  });

  it.skip('should emit a failure event for extends when a extends config file cannot be loaded', function() {
  });
});
