"use strict";

const tabs = require("tabs");
const {Cc, Cu, Ci} = require("chrome");
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
let Svc = {};
Cu.import("resource://gre/modules/Services.jsm", Svc);
const perms = Svc.Services.perms;

let Permissions = function() {
    this.origPerms = {};
};

Permissions.prototype = {
    allow: function(name, tab) {
        let uri = getURIForTab(tab);
        if (uri) {
            savePermission.call(this, name);
            if (!this.allowed(name)) {
                console.log("allowing: " + name);
                perms.add(uri, name, perms.ALLOW_ACTION);
            }
        }
    },

    allowed: function(name, tab) {
        let uri = getURIForTab(tab),
            allowed = false;

        if (uri) {
            let perm = perms.testPermission(uri, name);
            allowed = (perm === perms.ALLOW_ACTION);
        }

        return allowed;
    },

    reset: function(name, tab) { 
        tab = tab || tabs.activeTab;
        let uri = getURIForTab(tab);
        if (uri) {
            let permName = getTabPermName(name, tab);
            if (permName in this.origPerms) {
                let currPerm = this.origPerms[permName];
                let url = tab.url.replace("http:\/\/","");
                url = url.split("/")[0];

                if(currPerm === perms.UNKNOWN_ACTION) {
                    perms.remove(url, name);
                } else if(currPerm) {
                    perms.add(uri, name, currPerm);
                }

                delete this.origPerms[permName];
            }
        }
    }
};

function savePermission(name, tab) {
    let uri = getURIForTab(tab);
    if (uri) {
        let permName = getTabPermName(name, tab);
        if (!(permName in this.origPerms)) {
            this.origPerms[permName] = perms.testPermission(uri, name);
        }
    }
}

function getTabPermName(name, tab) {
    tab = tab || tabs.activeTab;
    let permName = tab.url + ":" + name;
    return permName;
}

function getURIForTab(tab) {
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
