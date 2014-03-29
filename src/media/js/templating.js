define('templating', ['settings', 'utils'], function(settings, utils) {
  var SafeString = nunjucks.require('runtime').SafeString;
  var env = nunjucks.configure({autoescape: true});
  var envGlobals = nunjucks.require('globals');

  env.addGlobal = function(name, func) {
    envGlobals[name] = func;
  };

  env.makeSafe = function(func) {
    return function() {
      return new SafeString(func.apply(this, arguments));
    };
  };

  function render(name, ctx, cb) {
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = {};
    }
    return env.render(name + '.html', ctx, function(err, res) {
      if (err) {
        return console.error(err);
      }
      cb(res);
    });
  }

  function _l(str, id, opts) {
    // For pluralisation.
    var pluralOpts = {};
    if (opts && 'n' in opts) {
      pluralOpts = {n: opts.n};
    }
    // Use webL10n to localise.
    str = _(id, pluralOpts) || str;
    return opts ? utils.format(str, opts) : str;
  }

  env.addFilter('floor', Math.floor);
  env.addFilter('format', utils.format);
  env.addFilter('translate', utils.translate);

  env.addGlobal('_', env.makeSafe(_l));
  env.addGlobal('settings', settings);

  return {
    _l: _l,
    env: env,
    render: render
  };
});
