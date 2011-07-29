"use strict";
const {Permissions} = require("permissions");
const tabs = require("tabs");


let pm;
exports.setup = function() {
    if(!pm) {
        pm = new Permissions();
    }
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

exports.testAllowMozillaThenReset = function(test) {
    tabs.on("ready", function() {
        pm.allow("popup");
        let allowed = pm.allowed("popup");
        test.assertEqual(allowed, true, "popups are allowed");

        pm.reset("popup");
        allowed = pm.allowed("popup");
        test.assertEqual(allowed, false, "after reset, popup not allowed");

        
        test.done();
    });

    tabs.activeTab.url = "http://www.mozilla.com";
    test.waitUntilDone();
}



