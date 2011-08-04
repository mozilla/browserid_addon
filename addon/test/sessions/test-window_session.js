"use strict";

const {WindowSession} = require("sessions/window_session");
const {Session} = require("sessions/session");

let ws, session;

exports.setup = function() {
    session = new Session({
      host: "www.mozilla.com"
    });
    ws = new WindowSession({
        session: session
    });
};

exports['do we have a window manager'] = function(test) {
    test.assertEqual(!!ws, true, 'we have a window manager');
};

exports['setSession updates current session'] = function(test) {
    let newSession = new Session({
      host: "www.mozilla.com"
    });
    newSession.sessions = [{
      email: "stomlinson@mozilla.com"
    }];

    ws.session = newSession;

    test.assertStrictEqual(session.sessions[0].email, "stomlinson@mozilla.com", 'setting the session updates the original session');
};

exports['updating session after it is set current updates the currentSession'] = function(test) {
    let newSession = new Session({
      host: "www.mozilla.com"
    });

    ws.session = newSession;
    newSession.sessions = [{
      email: "stomlinson@mozilla.com"
    }];

    test.assertStrictEqual(session.sessions[0].email, "stomlinson@mozilla.com", 'setting the session updates the original session');
};



exports['multiple sessions works alright'] = function(test) {
    let firstSession = new Session({
      host: "www.mozilla.com"
    });
    let secondSession = new Session({
      host: "www.mozilla.com"
    });

    ws.session = firstSession;
    ws.session = secondSession;

    firstSession.sessions = [{
        email: "stomlinson@mozilla.com"
    }];
    test.assertStrictEqual(!!ws.session.sessions, false, "setting data on a past session");
};
