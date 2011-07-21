const {Cc, Ci, components} = require("chrome");
const obSvc = require("observer-service");

const CookieMonster = function() {
    this.handlers = {};
    obSvc.add("cookie-changed", onCookieChange, this);
};

CookieMonster.prototype = {
    watch: function(host, name, callback) {
        var handlers = this.getHandlers(host, name);
        handlers.push(callback);
    },

    unregisterListener: function(host, name, callback) {
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
    
    //console.log("cookie change: " + host + ':' + name + " action: " + data); 
    callHandlers.call(this, host, name, cookieInfo.value);
}

exports.CookieMonster = CookieMonster;

