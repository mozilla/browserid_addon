const {WindowSession} = require("window_manager");
const {Session} = require("session");

let wm, session;

exports.setup = function() {
    session = new Session();
    wm = new WindowSession({
        session: session
    });
};

exports['do we have a window manager'] = function(test) {
    test.assertEqual(!!wm, true, 'we have a window manager');
};

exports['setSession updates current session'] = function(test) {
    let newSession = new Session();
    newSession.email = "stomlinson@mozilla.com";

    wm.setSession(newSession);

    test.assertEqual(session.email, "stomlinson@mozilla.com", 'setting the session updates the original session');
};

exports['updating session after it is set current updates the currentSession'] = function(test) {
    let newSession = new Session();

    wm.setSession(newSession);
    newSession.email = "stomlinson@mozilla.com";

    test.assertEqual(session.email, "stomlinson@mozilla.com", 'setting the session updates the original session');
};



exports['multiple sessions works alright'] = function(test) {
    let firstSession = new Session();
    let secondSession = new Session();

    wm.setSession(firstSession);
    wm.setSession(secondSession);

    firstSession.email = "stomlinson@mozilla.com";
    test.assertNotEqual(session.email, "stomlinson@mozilla.com", "setting data on a past session");
};
