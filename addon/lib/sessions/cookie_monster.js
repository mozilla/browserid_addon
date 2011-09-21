const {Cc, Ci, components} = require("chrome");
const obSvc = require("observer-service");
const unload = require("unload");

/**
 * The CookieMonster is a module that keeps track of cookies.  When a cookie's 
 * value changes, any watchers of that cookie are notified.
 */
const CookieMonster = function() {
    this.handlers = {};
    obSvc.add("cookie-changed", onServiceNotification, this);
    unload.ensure(this, "teardown");
};

CookieMonster.prototype = {
    teardown: function() {
        obSvc.remove("cookie-changed", onServiceNotification, this);
        this.handlers = null;
    },

    /**
     * Watch a cookie named `name` on `host` for changes to its value.
     *
     * @method watch
     * @param {string} host - the hostname for the cookie.
     * @param {string} name - name of the cookie to watch.
     * @param {function} callback - handler to call when cookie value changes.
     */
    watch: function(host, name, callback) {
        var handlers = this.getHandlers(host, name);
        if (handlers) {
            handlers.push(callback);
        }
    },

    /**
     * Stop watching a cookie named `name` on `host` for changes to its value.
     *
     * @method unwatch
     * @param {string} host - the hostname for the cookie.
     * @param {string} name - the name of the cookie.
     * @param {function} callback - handler to stop watching.
     */
    unwatch: function(host, name, callback) {
        var handlers = this.getHandlers(host, name);
        if (handlers) {
            handlers.forEach(function(handler, index) {
                if (handler === callback) {
                    handlers.splice(index, 1);
                }
            });
        }
    },

    /**
     * Simulate a change of value to a cookie.
     *
     * @method simulate
     * @param {string} host - the hostname for the cookie.
     * @param {string} name - the name of the cookie.
     * @param {variant} value - the new value
     */
    simulate: function(host, name, value) {
        callHandlers.call(this, host, name, value);              
    },

    /**
     * Simulate an action by the cookie service
     * @method simulateCookieSvc
     * @param {string} subject - 
     * @param {object} data
     */
    simulateCookieSvc: function(subject, data) {
      onServiceNotification.call(this, subject, data);
    },

    /**
     * Get the list of handlers for a particular host/name
     * @method getHandlers
     * @param {string} host - the hostname for the cookie.
     * @param {string} name - the name of the cookie.
     * @returns {array} array of functions.  Empty array if no handlers.
     */
    getHandlers: function(host, name) {
        if (!this.handlers) return;
        var handlers = this.handlers[name + host] = this.handlers[name + host] || [];
        return handlers;
    },

    /**
     * Clear all listeners
     * @method clear
     */
    clear: function() {
        this.handlers = {};
    }

};


function callHandlers(host, name, value) {
    var handlers = this.getHandlers(host, name);
    if (handlers) {
        handlers.forEach(function(handler) {
            handler(value);
        });
    }
}

function onServiceNotification(subject, data) {
    if (data === "batch-deleted") {
      subject.forEach(cookieChange.bind(this));
    }
    else if (data === "cleared" || data === "reload") {
      // cookies were cleared, call all handlers
      for(let host in this.handlers) {
        let handlersForHost = this.handlers[host];
        handlersForHost.forEach(function(handler) {
          handler(undefined);
        });
      }

      this.clear();
    }
    else {
      cookieChange.call(this, subject);
    }

    function cookieChange(cookie) {
        let cookieInfo = cookie.QueryInterface(Ci.nsICookie2);
        let name = cookieInfo.name;
        let host = cookieInfo.host;
        
        callHandlers.call(this, host, name, cookieInfo.value);
    }
}

exports.CookieMonster = CookieMonster;

