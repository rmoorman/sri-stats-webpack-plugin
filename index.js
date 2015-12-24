/**
 *  Script based on @roman01la's webpack-sri.
 *
 *  https://github.com/roman01la/webpack-sri
 *
 */

'use strict';

var getSriHash = require('./lib/utils').getSriHash;
var CustomStats = require('./lib/CustomStats');

var DEFAULT_PARAMS = {
  algorithm: 'sha384',
  regex: (/\.(js|css)$/i)
};

function SriWebpackPlugin(options) {
  var params = options || {};
  this.algorithm = params.algorithm || DEFAULT_PARAMS.algorithm;
  this.regex = params.regex || DEFAULT_PARAMS.regex;
};

SriWebpackPlugin.prototype.apply = function(compiler) {
  var allowedExtensions = this.regex;
  var sriAlgorithm = this.algorithm;
  var sris = {};

  compiler.plugin('this-compilation', function(compilation) {
    compilation.plugin('optimize-assets', function(assets, callback) {
      Object.keys(assets).forEach(function(file) {
        var asset = assets[file];
        var content;

        if (file.match(allowedExtensions)) {
          content = asset.source();
          sris[file] = getSriHash(sriAlgorithm, content);
        }
      });

      callback();
    });
  });

  compiler.plugin('after-emit', function(compilation, callback) {
    var stats = new CustomStats(compilation);

    stats.addCustomStat('sris', sris);

    compilation.getStats = function() {
      return stats;
    }

    callback();
  });
}

module.exports = SriWebpackPlugin;
