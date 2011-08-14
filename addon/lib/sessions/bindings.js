"use strict";

/**
 * The Bindings module keeps track of the current list of bindings.
 * A binding is a session that persists across page views and across multiple 
 * tabs.  A binding is a session that is bound to a particular host (exact 
 * match hostname) using the current value of a cookie.  A binding is valid 
 * as long as the cookie value does not change.  As soon as the cookie changes, 
 * the binding is considered invalid and removed from the list.  There can be 
 * at most one binding per host, so if a new binding is added for a host that 
 * is already in the list, the old binding is removed.  This could probably be 
 * simplified using the JetPack Collection.
 */
 
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

