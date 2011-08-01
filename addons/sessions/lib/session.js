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

    session.on("beforeset:host", onBeforeSetHost.bind(session));
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
  if (!this.binding) {
    this.sessions = undefined;
  }
}

function onBeforeSetSessions(sessions) {
  removeBinding.call(this);
}

function onSetSessions(sessions) {
  let active = this.getActive();
  let binding = active && active.bound_to;

  addBinding.call(this, binding);
}

function onBeforeSetHost(host) {
  if(host !== this.host) {
    this.sessions = undefined;
  }
}

function onCookieChange() {
  removeBinding.call(this);
}

function addBinding(binding) {
  if (binding && binding.type === "cookie" && this.cookieManager) {
    this.binding = {
      host: this.host,
      name: binding.name,
      type: binding.type
    };
    this.cookieManager.watch(this.host, binding.name, this.onCookieChange);
  }
}

function removeBinding() {
  var binding = this.binding;
  if(binding && binding.type === "cookie" && this.cookieManager) {
    this.cookieManager.unwatch(binding.host, binding.name, this.onCookieChange);
    this.binding = undefined;
  }
}

exports.Session = Session;
