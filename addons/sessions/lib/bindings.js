"use strict";

const {EventEmitter} = require("events");

let Bindings = EventEmitter.compose({
  _bindings: undefined,
  _cookieManager: undefined,
  length: 0,
  constructor: function(options) {
    this._cookieManager = options.cookieManager;
    this.clear();
  },

  add: function(binding) {
    let host = binding.host;
    this.remove(host);
    let name = binding.bound_to.name;
    // Save this off so that we can remove it later.
    binding.remove = this.remove.bind(this, host);

    this._cookieManager.watch(host, name, binding.remove);
    this._bindings[host] = binding;
    this.length++;
  },

  get: function(host) {
    let binding = this._bindings[host];
    return binding;
  },

  remove: function(host) {
    let binding = this.get(host);
    
    if(binding) {
      this._bindings[host] = null;
      delete this._bindings[host];
      this.length--;
      this._emit("remove", binding);
      this._cookieManager.unwatch(host, binding.bound_to.name, binding.remove);
    }

    return binding;
  },

  clear: function() {
    this._bindings = {};
    this.length = 0;
  }
});

exports.Bindings = Bindings;

