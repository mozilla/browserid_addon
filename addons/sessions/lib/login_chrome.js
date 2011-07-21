const {Cc, Ci, Cs, Cr} = require("chrome");
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const {EventEmitter} = require("events");

const LoginManager = EventEmitter.compose({
    constructor: function(options) {
        let {document} = options;


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

        this.image = createNode(document, "image", {
            id: "identity-session-icon",
            parentNode: this.box
        });
        this.image.hide();

        this.siteName = createNode(document, "label", {
            id: "identity-session-site",
            value: "site name",
            parentNode: this.box
        });
        this.siteName.hide();

        let insertBefore = document.getElementById("notification-popup-box");
        if(insertBefore) {
            insertBefore.parentNode.insertBefore(this.box, insertBefore);
        }

    },
        
    show: function(host) {
        this.box.show();
        this.siteName.setAttribute("value", host);
    },

    login: function(host) {
        this.show(host);
        this.signIn.show();
        this.userInfo.hide();
    },

    loggedIn: function(username, host) {
        this.show(host);
        this.signIn.hide();
        this.userInfo.setAttribute("value", username);
        this.userInfo.show();
    },

    none: function() {
        this.box.hide();
    },

    setURL: function(url) {
        this.siteName.setAttribute("value", url);
    }

});

exports.LoginManager = LoginManager;

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

