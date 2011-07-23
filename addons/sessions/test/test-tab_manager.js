"use strict";

const {TabManager} = require("tab_manager");
const tabs = require("tabs");

let tm;

exports.setup = function() {
    tm = new TabManager();
};

exports['can create'] = function(test) {
    test.assertStrictEqual(!!tm, true, 'we have a tab manager');
};

exports['each initially open tab has a session'] = function(test) {
  let success = true;
  for each(let tab in tabs) {
      success = success && !!tab.session;
  }

  test.assertStrictEqual(success, true, "all tabs have a session");
};


exports['new tabs get a session'] = function(test) {
  tabs.on("open", function(tab) {
      test.assertStrictEqual(!!tab.session, true, 'new tab has a session');
      test.done();
  });
  tabs.open("http://www.mozilla.com");
  test.waitUntilDone();
};
