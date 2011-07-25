"use strict";

let WindowSession = function(config) {
    this._session = config.session;
    this.onSet = onSet.bind(this);
};

WindowSession.prototype = {
    get session() {
        return this._session;
    },
    set session(session) {
        session.keys().forEach(function(field) {
            this._session[field] = session[field];
        }, this);

        if(this.currentSession) {
            this.currentSession.removeListener("set", this.onSet);
        }

        this.currentSession = session;
        session.on("set", this.onSet);
    }
};

function onSet(info) {
    this._session[info.name] = info.value;
}



exports.WindowSession = WindowSession;
