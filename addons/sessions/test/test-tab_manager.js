"use strict";

const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
const tabs = require("tabs");
const {Helpers} = require("helpers");

// We need the window manager to create the window session model.
let tm, wm;


exports.setup = function() {
    wm = new WindowManager();
    tm = new TabManager();
};

exports.teardown = function() {
    tm.teardown();
    wm.teardown();

    tm = wm = null;
};

exports["can create"] = function(test) {
    test.assertStrictEqual(!!tm, true, "we have a tab manager");
};

exports["each initially open tab has a session"] = function(test) {
  let success = true;
  for each(let tab in tabs) {
      success = success && !!tab.session;
  }

  test.assertStrictEqual(success, true, "all tabs have a session");
};


exports["new tabs get a session"] = function(test) {
  tabs.on("open", function(tab) {
      test.assertNotUndefined(tab.session, "new tab has a session");
      test.assertNotUndefined(tab.session.bindings, "new tab has bindings too");
      tab.activate();

      test.done();
  });
  tabs.open("http://www.mozilla.com");
  test.waitUntilDone();
};

exports["Window's session is updated whenever a new tab is made active"] = function(test) {
  let tab = tabs[0];
  tab.session.sessions = ['asdf'];
  tab.activate();

  let windowSession = tab.window.session;
  let tabSession = tab.session;


  test.expectFail(function() {
    test.assertEqual(windowSession.length, tabSession.sessions.length, "windows session updated whenever a new tab is made active");
  });
};

