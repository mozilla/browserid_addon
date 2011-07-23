
let WindowSession = function(config) {
    this.session = config.session;
};

WindowSession.prototype = {
    setSession: function(session) {
        session.keys().forEach(function(field) {
            this.session[field] = session[field];
        }, this);

        if(this.currentSession) {
            this.currentSession.removeListener("set", this.currentOnSet);
        }

        this.currentSession = session;
        this.currentOnSet = onSet.bind(this);
        session.on("set", this.currentOnSet);
    }
};

function onSet(info) {
    this.session[info.name] = info.value;
}



exports.WindowSession = WindowSession;
