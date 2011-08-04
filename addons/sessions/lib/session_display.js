/**
 * This is a session display, it reacts to changes in session models.
 * It will display if session.status == "login" or session.status == 
 * "loggedin".  It will hide otherwise.
 * @class Session
 */
/**
 * Triggered whenever the sign in button is clicked.
 * @event login
 */
/**
 * Triggered whenever the userinfo button is clicked.
 * @event userinfo 
 */

"use strict";

const {Cc, Ci, Cs, Cr} = require("chrome");
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const SVG_NS = "http://www.w3.org/2000/svg";
const {EventEmitter} = require("events");
const STATUS_SHOW = ["loggedin","login"];
const unload = require("unload");

const SessionDisplay = EventEmitter.compose({
    constructor: function(options) {
        let {document, session} = options;
        this.session = session;
        this.document = document;
      
        createUI.call(this, document);    
        attachSessionEvents.call(this);
        
        let identityBox = getIdentityBox.call(this);
        this.origLeft = identityBox && identityBox.style.paddingLeft;
        
        this.hide();
        unload.ensure(this, 'teardown');
    },

    teardown: function() {
        if (this.box && this.box.parentNode) {
            this.box.parentNode.removeChild(this.box);
        }
    },
        
    show: function() {
        this.box.show();
        let identityBox = getIdentityBox.call(this);
        if (identityBox) {
            identityBox.style.paddingLeft = "10px";
        }

        this._emit("show");
    },


    hide: function() {
        this.box.hide();
        let identityBox = getIdentityBox.call(this);
        if (identityBox) {
            identityBox.style.paddingLeft = this.origLeft;
        }
        this._emit("hide");
    },

    setStatus: setStatus
});

exports.SessionDisplay = SessionDisplay;

function createUI(document) {
    this.box = createNode(document, "box", {
        id: "identity-session-box"
    });
    addHoverEvents.call(this, this.box);
    this.box.addEventListener("click", function() {
        this._emit(this.eventToEmit); 
    }.bind(this), false);

    this.signIn = createNode(document, "label", {
        id: "identity-session-signin",
        value: "Sign in",
        parentNode: this.box
    });

    this.userInfo = createNode(document, "label", {
        id: "identity-session-userinfo",
        value: "",
        parentNode: this.box
    });

    this.svg = createNode(document, "svg", {
        id: "identity-session-arrow",
        height: "18px",
        width: "10px",
        viewBox: "0 0 20 20",
        preserveAspectRatio: "none",
        version: "1.1",
        baseProfile: "full",
        parentNode: this.box
    }, SVG_NS);

    let defs = createNode(document, "defs", {
        parentNode: this.svg
    }, SVG_NS);

    let gradient = createNode(document, "linearGradient", {
        id: "sessionArrowGradient",
        parentNode: defs,
        x1: "100%",
        y1: "100%"
    }, SVG_NS);

    let start = createNode(document, "stop", {
        offset: "0%",
        "stop-color": "#cccccc",
        parentNode: gradient
    }, SVG_NS);

    let end = createNode(document, "stop", {
        offset: "100%",
        "stop-color": "#ffffff",
        parentNode: gradient
    }, SVG_NS);
    this.end = end;

    let arrow = createNode(document, "polygon", {
      points: "0,1 19,10 0,19",
      fill: "url(#sessionArrowGradient)",
      parentNode: this.svg,
    }, SVG_NS);
    addHoverEvents.call(this, arrow);

    let arrowBorderTop = createNode(document, "line", {
      x1: "0",
      y1: "1",
      x2: "19",
      y2: "10",
      parentNode: this.svg,
    }, SVG_NS);

    let arrowBorderBottom = createNode(document, "line", {
      x1: "0",
      y1: "19",
      x2: "19",
      y2: "10",
      parentNode: this.svg,
    }, SVG_NS);

    let identityBox = getIdentityBox.call(this);
    if (identityBox) {
        identityBox.parentNode.insertBefore(this.box, identityBox);
    }
    else {
        let parent = document.getElementById("urlbar");
        parent.insertBefore(this.box, parent.firstChild);
    }
}

function getIdentityBox() {
    let identityBox = this.document.getElementById("identity-box");
    return identityBox;
}

function attachSessionEvents() {
    this.session.on("set:sessions", onSetSessions.bind(this));
}

function onSetSessions(sessions) {
    var status = "none";
    if (sessions) {
        let email = getActiveEmail.call(this);

        status = "login";
        if (email) {
            this.userInfo.setAttribute("value", email);
            status = "loggedin";
        }
    }

    setStatus.call(this, status);
}

function getActiveEmail() {
    let active = this.session.getActive(),
        email = active && active.email;
    return email;
}

function setStatus(status) {
    switch (status) {
        case "login":
            this.signIn.show();
            this.userInfo.hide();
            this.eventToEmit = "login";
            this.show();
            break;
        case "loggedin":
            this.signIn.hide();
            this.userInfo.show();
            this.eventToEmit = "userinfo";
            this.show();
            break;
        default:
            this.hide();
            break;
    } 
}


const NODE_SPECIAL = ["parentNode"];
function createNode(document, nodeName, attribs, ns) {
     let node = document.createElementNS(ns || XUL_NS, nodeName);

     node.show = function() {
        node.collapsed = node.hidden = false;
     };

     node.hide = function() {
        node.collapsed = node.hidden = true;
     };

     for (let attrib in attribs) {
         let val = attribs[attrib];
         if (NODE_SPECIAL.indexOf(attrib) === -1) {
            node.setAttribute(attrib, val);
         }
         else if (attrib === "parentNode") {
             val.appendChild(node);
         }
     }

     return node;
}


function addHoverEvents(el) {
  var me=this;
  el.addEventListener("mouseover", function(event) {
    /* This is 1-x where x is the first percentage in identity-session.css */
    me.end.setAttribute("offset", "60%");
  }, false);
  el.addEventListener("mouseout", function(event) {
    me.end.setAttribute("offset", "100%");
  }, false);
}
