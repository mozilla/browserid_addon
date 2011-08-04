let {Model} = require("model");

let Session = function(config) {
    let session = new Model({
        fields: ["sessions", "host"]
    });

    session.noInfo = noInfo;
    session.getActive = getActive.bind(session);

    if (config && config.bindings) {
      session.getSavedSessions = getSavedSessions;
      session.addBinding = addBinding;
      session.removeBinding = removeBinding;
      session.host = config.host;
      session.bindings = config.bindings;
      session.on("set:host", onBeforeSetHost.bind(session));
      session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
      session.on("set:sessions", onSetSessions.bind(session));
    }


    return session;
};

function noInfo() {
  let sessions = this.getSavedSessions && this.getSavedSessions(this.host);
  this.sessions = sessions;
}

function onBeforeSetSessions(sessions) {
  // Remove the old bindings for this host, if there
  // are some
  if (!this.hostChange) {
    // We only remove bindings IF we are overwriting the
    // bindings for the current host
    this.removeBinding(this.host);
  }
  this.hostChange = false;
}

function onSetSessions(sessions) {
  // Add new bindings
  let active = this.getActive();

  if(active) {
    active.host = this.host;
    this.addBinding(active);
  }
}

function onBeforeSetHost(host) {
  this.hostChange = true;
  this.sessions = this.getSavedSessions(host);
}

function addBinding(session) {
  let binding = session && session.bound_to;
  if (binding && binding.type === "cookie" && this.bindings) {
    this.bindings.add(session);
  }
}

function removeBinding(host) {
  if (this.bindings) {
    this.bindings.remove(host);
  }
}

function getSavedSessions(host) {
  let binding = this.bindings && this.bindings.get(host);
  let sessions = binding && [binding];

  return sessions;
}

function getActive() {
  let active, sessions = this.sessions;

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


exports.Session = Session;
