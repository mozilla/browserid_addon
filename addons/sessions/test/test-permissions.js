"use strict";
const {Permissions} = require("permissions");
const tabs = require("tabs");


let pm;
exports.setup = function() {
    pm = new Permissions();
};

exports.teardown = function() {
    // do not tear down the pm here, we need to tear this down asynchronously 
    // on the last test.
};


exports.testAllowedNoURI = function(test) {
    let allowed = pm.allowed("popup");
    test.assertEqual(allowed, false, "popups are not allowed by default");
    pm.teardown();
    pm = null;
};

exports.testAllowBlankPage = function(test) {
    pm.allow("popup");
    let allowed = pm.allowed("popup");
    test.assertEqual(allowed, false, "popups are not allowed for blank page");
    pm.teardown();
    pm = null;
};

exports.testAllowMozillaThenReset = function(test) {
    tabs.on("ready", function() {
        console.log("made it to ready");
        pm.allow("popup");
        let allowed = pm.allowed("popup");
        test.assertEqual(allowed, true, "popups are allowed");

        pm.reset("popup");
        allowed = pm.allowed("popup");
        test.assertEqual(allowed, false, "after reset, popup not allowed");
        
        pm.teardown();
        pm = null;
        test.done();
    });

    tabs.activeTab.url = "http://www.mozilla.com";
    test.waitUntilDone();
}



