"use strict";

let WindowSession = function(config) {
    this.session = config.session;
    this.onSet = onSet.bind(this);
};

WindowSession.prototype = {
    setSession: function(session) {
        session.keys().forEach(function(field) {
            this.session[field] = session[field];
        }, this);

        if(this.currentSession) {
            this.currentSession.removeListener("set", this.onSet);
        }

        this.currentSession = session;
        session.on("set", this.onSet);
    }
};

function onSet(info) {
    this.session[info.name] = info.value;
}



exports.WindowSession = WindowSession;
