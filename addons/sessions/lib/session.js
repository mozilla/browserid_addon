let {Model} = require("model");

let Session = function(config) {
    let session = new Model({
        fields: ['sessions']
    });

    session.getActive = getActive;
    session.noInfo = noInfo;

    session.bound = false;
    if(config) {
      session.host = config.host;
      session.cookieManager = config.cookieManager;
    }

    session.on("set:sessions", onSetSessions.bind(session));

    return session;
};

function getActive() {
  let active, 
      sessions = this.sessions;
  
  if (sessions) {
    if (sessions.length === 1) {
      active = sessions[0];
    } else {
      sessions.forEach(function(session) {
        if (session.status === 'active') {
          active = session;
        }
      });
    }
  }

  return active;
}

function noInfo() {
  if (!this.bound) {
    this.sessions = undefined;
  }
}

function onSetSessions(sessions) {
  let active = this.getActive();
  let binding = active && active.bound_to;

  if (binding && binding.type === "cookie" && this.cookieManager) {
    this.cookieManager.watch(this.host, binding.name, onCookieChange.bind(this));
    this.bound = true;
  }
};

function onCookieChange() {
    this.bound = false;
}

exports.Session = Session;
