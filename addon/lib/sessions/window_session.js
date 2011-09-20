"use strict";

// WindowSession binds the current Session model for the window to the Session 
// model for a particular tab.  This will copy all of the tab's Session info 
// over, and then bind a listener to track any changes to that tab's info.
let WindowSession = function(config) {
    this._session = config.session;
    this.onSet = onSet.bind(this);
};

WindowSession.prototype = {
    get session() {
        return this._session;
    },
    set session(session) {
        // copy all fields over
        session.keys().forEach(function(field) {
            this._session[field] = session[field];
        }, this);

        // If we were already listening to changes on a tab's session info, 
        // stop listening.
        if(this.currentSession) {
            this.currentSession.removeListener("set", this.onSet);
        }

        // Start listening on the new tab.
        this.currentSession = session;
        session.on("set", this.onSet);
    }
};

function onSet(info) {
    this._session[info.name] = info.value;
}



exports.WindowSession = WindowSession;
