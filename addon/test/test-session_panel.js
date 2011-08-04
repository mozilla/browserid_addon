"use strict";

const {SessionPanel} = require("sessions/session_panel");
const {Session} = require("sessions/session");
const {CookieMonster} = require("sessions/cookie_monster");

let session, sp;
exports.setup = function() {
    session = new Session({
      cookieManager: new CookieMonster(),
      host: "www.mozilla.com"
    });
    sp = new SessionPanel({
      session: session
    });
};

exports.teardown = function() {
    session.teardown();
    sp.teardown();

    session = sp = null;
};

exports['we got something'] = function(test) {
    test.assertStrictEqual(!!sp, true, 'we have a panel');
};

exports['can show'] = function(test) {
    sp.show();

    test.pass();
};

exports['can hide'] = function(test) {
    sp.hide();

    test.pass();
};

exports['can update the sessions'] = function(test) {
    session.sessions = [];

    test.pass();
};

