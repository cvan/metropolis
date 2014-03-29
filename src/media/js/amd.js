// Minimal AMD (not really AMD) support.

// Define a module:
//
// define('name', ['underscore', 'dep2'], function(_, dep2) {
//   exports = {};
//   ...
//   return exports;
// });

// Require a module explicitly:
//
// var _ = require('underscore');

(function(window, document, navigator, undefined) {

var defined = {};
var resolved = {};
var amdConsole = window.console;

function define(id, deps, module) {
  defined[id] = [deps, module];
}

function require(id) {
  if (!resolved[id]) {
    var definition = defined[id];

    if (!definition) {
      throw 'Attempted to resolve undefined module: ' + id;
    }

    var deps = definition[0];
    var module = definition[1];

    if (typeof deps == 'function' && module === undefined) {
      module = deps;
      deps = [];
    }

    try {
      deps = deps.map(require);
    } catch(e) {
      amdConsole.error('Error initializing dependencies: ' + id);
      throw e;
    }

    try {
      resolved[id] = module.apply(window, deps);
    } catch(e) {
      amdConsole.error('Error initializing module: ' + id);
      throw e;
    }
  }

  return resolved[id];
}

require.config = function() {};

window.require = resolved.require = require;
window.define = define;

})(window, document, navigator, void 0);
