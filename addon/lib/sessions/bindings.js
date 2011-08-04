"use strict";

const {EventEmitter} = require("events");
const unload = require("unload");

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
    for(let host in this._bindings) {
      this.remove(host);
    }
    this._bindings = {};
    this.length = 0;
  }
});

exports.Bindings = Bindings;

