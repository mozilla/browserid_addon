let {Model} = require("model");

let Session = function(config) {
    let session = new Model({
        fields: ["sessions","host"]
    });

    session.getActive = getActive;
    session.noInfo = noInfo;

    session.bound = false;
    if(config) {
      session.host = config.host;
      session.cookieManager = config.cookieManager;
    }

    session.on("set:host", onSetHost.bind(session));
    session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
    session.on("set:sessions", onSetSessions.bind(session));

    session.onCookieChange = onCookieChange.bind(session);

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
        if (session.status === "active") {
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

function onBeforeSetSessions(sessions) {
  let active = this.getActive();
  let binding = active && active.bound_to;

  if(binding && binding.type === "cookie" && this.cookieManager) {
    this.cookieManager.unwatch(this.host, binding.name, this.onCookieChange);
    this.bound = false;
  }
}

function onSetSessions(sessions) {
  let active = this.getActive();
  let binding = active && active.bound_to;

  if (binding && binding.type === "cookie" && this.cookieManager) {
    this.cookieManager.watch(this.host, binding.name, this.onCookieChange);
    this.bound = true;
  }
}

function onSetHost(host) {
  // what do we do?
}

function onCookieChange() {
    this.bound = false;
}

exports.Session = Session;
