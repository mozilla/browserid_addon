"use strict";

const tabs = require("tabs");
const {Cc, Cu, Ci} = require("chrome");
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
let Svc = {};
Cu.import("resource://gre/modules/Services.jsm", Svc);
const perms = Svc.Services.perms;
const unload = require("unload");

let Permissions = function() {
    this.origPerms = {};

    unload.ensure(this, "teardown");
};

Permissions.prototype = {
    teardown: function() {
        for(let name in this.origPerms) {
            let perm = this.origPerms[name]; 
            this.reset(name, perm.tab);
        }
    },

    allow: function(name, tab) {
        let uri = getURI(tab);
        if (uri) {
            savePermission.call(this, name);
            if (!this.allowed(name)) {
                perms.add(uri, name, perms.ALLOW_ACTION);
            }
        }
    },

    allowed: function(name, tab) {
        let uri = getURI(tab),
            allowed = false;

        if (uri) {
            let perm = perms.testPermission(uri, name);
            allowed = (perm === perms.ALLOW_ACTION);
        }

        return allowed;
    },

    reset: function(name, tab) { 
        tab = tab || tabs.activeTab;
        let uri = getURI(tab);
        if (uri) {
            removePermission.call(this, name, tab);
        }
    }
};


function savePermission(name, tab) {
    let uri = getURI(tab);
    if (uri) {
        let permName = getPermName(name, tab);
        if (!(permName in this.origPerms)) {
            this.origPerms[permName] = {
              perm: perms.testPermission(uri, name),
              tab: tab
            };
        }
    }
}

function removePermission(name, tab) {
    let permName = getPermName(name, tab);
    if (permName in this.origPerms) {
        let currPerm = this.origPerms[permName].perm;
        let url = tab.url.replace("http:\/\/","").split("/")[0];

        perms.remove(url, name);
        if(currPerm !== perms.UNKNOWN_ACTION) {
            let uri = getURI(tab);
            perms.add(uri, name, currPerm);
        }

        delete this.origPerms[permName];
    }
}

function getPermName(name, tab) {
    tab = tab || tabs.activeTab;
    let permName = tab.url + ":" + name;
    return permName;
}

function getURI(tab) {
    tab = tab || tabs.activeTab;
    let uri;

    if (tab && tab.url && tab.url !== "about:blank") {
        uri = getURIForURL(tab.url);
    }

    return uri;
}

function getURIForURL(url) {
    let uri = ioService.newURI(url, null, null);
    return uri;
}

exports.Permissions = Permissions;
