"use strict";
const {Permissions} = require("sessions/permissions");
const tabs = require("tabs");

const {Cc, Cu, Ci} = require("chrome");
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
let Svc = {};
Cu.import("resource://gre/modules/Services.jsm", Svc);
const perms = Svc.Services.perms;

const safeURL = "http://www.shanetomlinson.com/static/";

let pm;
exports.setup = function() {
    pm = new Permissions();
};

exports.teardown = function() {
    perms.remove(safeURL, "popup");
    pm.teardown();
    pm = null;
};


exports.testAllowedNoURI = function(test) {
    let allowed = pm.allowed("popup");
    test.assertEqual(allowed, false, "popups are not allowed by default");
};

exports.testAllowBlankPage = function(test) {
    pm.allow("popup");
    let allowed = pm.allowed("popup");
    test.assertEqual(allowed, false, "popups are not allowed for blank page");
};

exports.testAllowPageThenReset = function(test) {
    tabs.once("ready", function() {
        pm.allow("popup");
        let allowed = pm.allowed("popup");
        test.assertEqual(allowed, true, "popups are allowed");

        pm.reset("popup");
        allowed = pm.allowed("popup");
        test.assertEqual(allowed, false, "after reset, popup not allowed");
        
        test.done();
    });

    // a blank page that has no js nor css errors
    tabs.activeTab.url = safeURL;
    test.waitUntilDone();
}

exports["allow a perm on a page that already has a perm"] = function(test) {
    // Allow initially
    let uri = ioService.newURI(safeURL, null, null);
    perms.add(uri, "popup", perms.ALLOW_ACTION);

    tabs.once("ready", function() {
        pm.allow("popup");
        let allowed = pm.allowed("popup");
        test.assertEqual(allowed, true, "popups are allowed");

        pm.reset("popup");
        allowed = pm.allowed("popup");
        test.assertEqual(allowed, true, "after reset, popup not allowed");

        test.done();
    });

    // a blank page that has no js nor css errors
    tabs.activeTab.url = safeURL;
    test.waitUntilDone();

};



