/**
 * This is a session display, it reacts to changes in session models.
 * It will display if session.status == 'login' or session.status == 
 * 'loggedin'.  It will hide otherwise.
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
const {EventEmitter} = require("events");
const STATUS_SHOW = ['loggedin','login'];

const SessionDisplay = EventEmitter.compose({
    constructor: function(options) {
        let {document, session} = options;
      
        createUI.call(this, document);    
        attachSessionEvents.call(this, session);
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

    let insertBefore = document.getElementById("notification-popup-box");
    if(insertBefore) {
        insertBefore.parentNode.insertBefore(this.box, insertBefore);
    }
}

function attachSessionEvents(session) {
    session.on("set:sessions", onSetSessions.bind(this));
}

function onSetSessions(sessions) {
    var status = "none";
    if(sessions) {
        let email = getActiveEmail(sessions);

        status = "login";
        if(email) {
            this.userInfo.setAttribute("value", email);
            status = "loggedin";
        }
    }

    setStatus.call(this, status);
}

function getActiveEmail(sessions) {
    let email = sessions[0] && sessions[0].email;
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


const NODE_SPECIAL = ['parentNode'];
function createNode(document, nodeName, attribs) {
     let node = document.createElementNS(XUL_NS, nodeName);

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
         else if(attrib === 'parentNode') {
             val.insertBefore(node, null);
         }
     }

     return node;
}



