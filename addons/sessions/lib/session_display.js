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

const SessionDisplay = EventEmitter.compose({
    constructor: function(options) {
        let {document, session} = options;
        this.session = session;
      
        createUI.call(this, document);    
        attachSessionEvents.call(this);


        this.hide();
    },

    teardown: function() {
        if(this.box) {
            this.box.parentNode.removeChild();
        }
    },
        
    show: function() {
        this.box.show();
        this._emit("show");
    },


    hide: function() {
        this.box.hide();
        this._emit("hide");
    }
});

exports.SessionDisplay = SessionDisplay;

function createUI(document) {
    this.box = createNode(document, "box", {
        id: "identity-session-box"
    });

    this.signIn = createNode(document, "label", {
        id: "identity-session-signin",
        value: "Sign in",
        parentNode: this.box
    });
    this.signIn.addEventListener("click", this._emit.bind(this, "login"), false);

    this.userInfo = createNode(document, "label", {
        id: "identity-session-userinfo",
        value: "",
        parentNode: this.box
    });
    this.userInfo.addEventListener("click", this._emit.bind(this, "userinfo"), false);

    this.svg = createNode(document, "svg", {
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

    let start = createNode(document, "stop", {
        offset: "100%",
        "stop-color": "#ffffff",
        parentNode: gradient
    }, SVG_NS);

    let arrow = createNode(document, "polygon", {
      points: "0,1 19,10 0,19",
      fill: "url(#sessionArrowGradient)",
      parentNode: this.svg,
    }, SVG_NS);

    let arrowBorderTop = createNode(document, "line", {
      x1: "0",
      y1: "1",
      x2: "19",
      y2: "10",
      stroke: "#cccccc",
      "stroke-width": "1px",
      parentNode: this.svg,

    }, SVG_NS);

    let arrowBorderBottom = createNode(document, "line", {
      x1: "0",
      y1: "19",
      x2: "19",
      y2: "10",
      stroke: "#cccccc",
      "stroke-width": "1px",
      parentNode: this.svg,

    }, SVG_NS);

    let insertBefore = document.getElementById("identity-box");
    if(insertBefore) {
        insertBefore.parentNode.insertBefore(this.box, insertBefore);
    }
}

function attachSessionEvents() {
    this.session.on("set:sessions", onSetSessions.bind(this));
}

function onSetSessions(sessions) {
    var status = "none";
    if(sessions) {
        let email = getActiveEmail.call(this);

        status = "login";
        if(email) {
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
    switch(status) {
        case "login":
            this.signIn.show();
            this.userInfo.hide();
            this.show();
            break;
        case "loggedin":
            this.signIn.hide();
            this.userInfo.show();
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

     for(let attrib in attribs) {
         let val = attribs[attrib];
         if(NODE_SPECIAL.indexOf(attrib) === -1) {
            node.setAttribute(attrib, val);
         }
         else if(attrib === "parentNode") {
             val.appendChild(node);
         }
     }

     return node;
}



