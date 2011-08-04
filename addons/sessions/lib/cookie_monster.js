const {Cc, Ci, components} = require("chrome");
const obSvc = require("observer-service");
const unload = require("unload");

const CookieMonster = function() {
    this.handlers = {};
    obSvc.add("cookie-changed", onCookieChange, this);
    unload.ensure(this, "teardown");
};

CookieMonster.prototype = {
    teardown: function() {
        obSvc.remove("cookie-changed", onCookieChange, this);
        this.handlers = null;
    },
    watch: function(host, name, callback) {
        var handlers = this.getHandlers(host, name);
        handlers.push(callback);
    },

    unwatch: function(host, name, callback) {
        var handlers = this.getHandlers(host, name);
        if(handlers) {
            handlers.forEach(function(handler, index) {
                if(handler === callback) {
                    handlers.splice(index, 1);
                }
            });
        }
    },

    simulate: function(host, name, value) {
        callHandlers.call(this, host, name, value);              
    },

    getHandlers: function(host, name) {
        var handlers = this.handlers[name + host] = this.handlers[name + host] || [];
        return handlers;
    },

    clear: function() {
        this.handlers = {};
    }

};


function callHandlers(host, name, value) {
    var handlers = this.getHandlers(host, name);
    if(handlers) {
        handlers.forEach(function(handler) {
            handler(value);
        });
    }
}

function onCookieChange(subject, data) {
    var cookieInfo = subject.QueryInterface(Ci.nsICookie2);
    var name = cookieInfo.name;
    var host = cookieInfo.host;
    
    callHandlers.call(this, host, name, cookieInfo.value);
}

exports.CookieMonster = CookieMonster;

