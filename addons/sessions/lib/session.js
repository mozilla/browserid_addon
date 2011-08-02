let {Model} = require("model");

let Session = function(config) {
    let session = new Model({
        fields: ["sessions", "host"]
    });

    session.getActive = getActive;
    session.noInfo = noInfo;

    if (config && config.bindings) {
      // Have to bind it to the session - it is used as a callback
      session.onBindingRemove = onBindingRemove.bind(session);
      session.getSavedSessions = getSavedSessions;
      session.addBinding = addBinding;
      session.removeBinding = removeBinding;
      session.host = config.host;
      session.bindings = config.bindings;
      session.bindings.on("remove", session.onBindingRemove);
      session.on("beforeset:host", onBeforeSetHost.bind(session));
      session.on("beforeset:sessions", onBeforeSetSessions.bind(session));
      session.on("set:sessions", onSetSessions.bind(session));
    }


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
  this.sessions = this.getSavedSessions && this.getSavedSessions(this.host);
}

function onBeforeSetSessions(sessions) {
  if (!this.hostChange) {
    // We only remove bindings IF we are overwriting the
    // bindings for the current host
    this.removeBinding();
  }
  this.hostChange = false;
}

function onSetSessions(sessions) {
  let active = this.getActive();

  this.addBinding(active);
}

function onBeforeSetHost(host) {
  if (host !== this.host) {
    this.hostChange = true;
    this.sessions = this.getSavedSessions(host);
  }
}

function onBindingRemove(binding) {
  if (binding.host === this.host) {
    this.removeBinding();
  }
}

function addBinding(session) {
  let binding = session && session.bound_to;
  if (binding && binding.type === "cookie" && this.bindings) {
    session.host = this.host;
    this.bindings.add(session);
  }
}

function removeBinding() {
  if (this.bindings) {
    this.bindings.remove(this.host);
  }
}

function getSavedSessions(host) {
  let binding = this.bindings && this.bindings.get(host);
  let sessions = binding && [binding];

  return sessions;
}


exports.Session = Session;
