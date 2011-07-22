
let WindowManager = function(config) {
    this.session = config.session;
};

WindowManager.prototype = {
    setSession: function(session) {
        session.getFields().forEach(function(field) {
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



exports.WindowManager = WindowManager;
