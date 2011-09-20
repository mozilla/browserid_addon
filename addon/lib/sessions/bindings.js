"use strict";

const {EventEmitter} = require("events");
const unload = require("unload");

// Keeps track of session bindings for a tab.  Bindings are session info that 
// is related to a cookie.  When the cookie value changes or is cleared, the 
// session is no longer valid.
let Bindings = EventEmitter.compose({
  _bindings: undefined,
  _cookieManager: undefined,
  length: 0,
  constructor: function(options) {
    this._cookieManager = options.cookieManager;
    this.clear();

    unload.ensure(this, "teardown");
  },

  teardown: function() {
    this.clear();
    this._cookieManager = null;
    this._bindings = null;
  },

  // Add a binding for a host.  Both the host and the cookie name must be 
  // specified.
  add: function(binding) {
    let host = binding.host;
    this.remove(host);
    let name = binding.bound_to.name;

    // Save off a remove function so the binding can be easily removed later.
    binding.remove = this.remove.bind(this, host);

    this._cookieManager.watch(host, name, binding.remove);
    this._bindings[host] = binding;
    this.length++;
  },

  // See if there is a binding for a particular host.
  get: function(host) {
    let binding = this._bindings[host];
    return binding;
  },

  // Remove a binding for a host
  remove: function(host) {
    let binding = this.get(host);
    
    if(binding) {
      this._bindings[host] = null;
      delete this._bindings[host];
      this.length--;
      this._cookieManager.unwatch(host, binding.bound_to.name, binding.remove);
      this._emit("remove", binding);
    }

    return binding;
  },

  clear: function() {
    for(let host in this._bindings) {
      this.remove(host);
    }
    this._bindings = {};
    this.length = 0;
  }
});

exports.Bindings = Bindings;

