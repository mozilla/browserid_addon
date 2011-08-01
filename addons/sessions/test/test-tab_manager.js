"use strict";

const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
const tabs = require("tabs");
const {Helpers} = require("helpers");

// We need the window manager to create the window session model.
let tm, wm = new WindowManager();

exports.setup = function() {
    tm = new TabManager();
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
      test.assertStrictEqual(!!tab.session, true, "new tab has a session");
      tab.activate();

      test.done();
  });
  tabs.open("http://www.mozilla.com");
  test.waitUntilDone();
};

exports["Window's session is updated whenever a new tab is made active"] = function(test) {
  //tabs.open("http://www.mozilla.com");
  let tab = tabs[0];
  tab.session.sessions = ['asdf'];
  tab.activate();

  let windowSession = tab.window.session;
  let tabSession = tab.session;


  /*console.log("windowSession: ");
  Helpers.toConsole(windowSession);
  console.log("tabSession: ");
  Helpers.toConsole(tabSession);
  */
  test.expectFail(function() {
    test.assertEqual(windowSession.length, tabSession.sessions.length, "windows session updated whenever a new tab is made active");
  });
};
/*
exports["sessionsUpdate with status set to null sets session status to none"] = function(test) {
  let tab = tabs.activeTab;
  let session = tab.session;

  tm.sessionsUpdate(tab, {
      sessions: null
  });

  test.assertEqual(session.sessions, null, "session\'s sessions set to null");
};
*/
