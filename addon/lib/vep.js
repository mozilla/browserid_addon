/*
 * the VEP APIs
 */

const {Ci} = require("chrome");
const {data} = require("self");
const observer = require("observer-service");
const {setTimeout} = require("timers");
const unload = require("unload");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const BROWSER_ID_URL = "https://browserid.org/sign_in";

// Add navigator apis and browser id chrome changes as pages load
exports.init = function() {
  require("./injector").registerNavigatorAPI("id", function(window) {
    let browser = window.QueryInterface(Ci.nsIInterfaceRequestor).
                         getInterface(Ci.nsIWebNavigation).
                         QueryInterface(Ci.nsIDocShell).
                         chromeEventHandler;

    // Add some functionality to the chrome browser if we have a tab
    if (browser.parentNode.getAttribute("anonid") == "browserStack")
      initChrome(browser.ownerDocument.defaultView);

    // Initialize or clean up any previous browser id state
    browser.browserIdCleanUp = browser.browserIdCleanUp || function() {};
    browser.browserIdCleanUp();

    return {
      getVerifiedEmail: function(callback) {
        // Only allow calling back once then clean up
        let didCallback = false;
        function doCallback(arg) {
          if (didCallback)
            return;

          // Fix up the correct state
          didCallback = true;
          browser.browserIdCleanUp();

          // Call it asynchronously
          setTimeout(function() {
            try {
              callback(arg || null);
            }
            catch(ex) {
              console.log(ex);
            }
          });
        }

        // Just do nothing if we should be unloaded
        if (unloaded) {
          doCallback();
          return;
        }

        // Use a channel to handle verified email requests
        openChannel(browser, window.location + "", doCallback);
      }
    };
  });

  // XXX Already injected pages still have access, so explicitly remember
  let unloaded = false;
  unload.when(function() {
    unloaded = true;
  });
};

// Initialize some top-level chrome objects
function initChrome(window) {
  // Don't initialize more than once
  let {document, gBrowser} = window;
  if (window.browserId != null)
    return;

  // Add the sign in image to the location bar
  let idImage = document.createElementNS(XUL_NS, "image");
  idImage.setAttribute("collapsed", "true");
  idImage.setAttribute("src", data.url("browserid/sign_in_green.png") + "");
  idImage.style.margin = "-1px -5px -1px -1px";
  idImage.style.position = "relative";
  let popupBox = document.getElementById("notification-popup-box");
  popupBox.parentNode.insertBefore(idImage, popupBox);

  // Update icons when switching tabs
  function onSelect(tab) {
    window.browserId.updateSignIn();
  }
  gBrowser.tabContainer.addEventListener("TabSelect", onSelect, false);

  // Provide an object to handle top-level chrome changes
  window.browserId = {
    updateSignIn: function() {
      idImage.collapsed = !gBrowser.selectedBrowser.browserIdActive;
    }
  };

  // Clean up when necessary
  unload.when(function() {
    idImage.parentNode.removeChild(idImage);
    gBrowser.tabContainer.removeEventListener("TabSelect", onSelect, false);
    window.browserId = null;
  });
}

// Open a channel to handle requests
function openChannel(browser, location, callback) {
  // Clean up any pending channel from before
  if (browser.browserIdCleanUp != null)
    browser.browserIdCleanUp();

  let document = browser.ownerDocument;
  let window = document.defaultView;

  // Update the chrome interface
  browser.browserIdActive = true;
  window.browserId.updateSignIn();

  // Prepare the display box
  let promptBox = document.createElementNS(XUL_NS, "box");
  browser.parentNode.appendChild(promptBox);
  promptBox.setAttribute("align", "center");
  promptBox.setAttribute("pack", "center");
  promptBox.style.backgroundColor = "rgba(25, 25, 25, 0.5)";
  promptBox.style.backgroundImage = "url(chrome://global/skin/icons/tabprompts-bgtexture.png)";

  // Allow dismissing when the user tries to click on content
  promptBox.addEventListener("click", function(event) {
    if (event.target == promptBox)
      browser.browserIdCleanUp();
  }, false);

  // Allow dismissing when the user hits escape
  promptBox.addEventListener("keydown", function(event) {
    if (event.keyCode == event.DOM_VK_ESCAPE)
      browser.browserIdCleanUp();
  }, false);

  // Prepare the active channel
  let channel = document.createElementNS(XUL_NS, "browser");
  channel.setAttribute("type", "content");
  channel.setAttribute("src", BROWSER_ID_URL);
  channel.style.boxShadow = "5px 5px 20px black";
  channel.style.height = "400px";
  channel.style.overflow = "hidden";
  channel.style.width = "700px";
  promptBox.appendChild(channel);

  // Prevent errors from browser.js/xul when it gets unexpected title changes
  channel.addEventListener("DOMTitleChanged", function(event) {
    event.stopPropagation();
  }, true);

  // Detect when to inject custom api to the document
  observer.add("document-element-inserted", function onInsert(doc) {
    if (doc != channel.contentDocument)
      return;
    observer.remove("document-element-inserted", onInsert);

    // Initialize the raw content object
    let nav = channel.contentWindow.wrappedJSObject.navigator;
    nav.id = nav.id || {};
    nav.id.channel = nav.id.channel || {};

    // Hook into what the site expects for override capabilities
    nav.id.channel.registerController = function(controller) {
      controller.getVerifiedEmail(location, function(assertion) {
        callback(assertion);
      }, function(reason) {
        callback();
      });
    };
  });

  // Clean up any channel display from the content area
  browser.browserIdCleanUp = function() {
    browser.browserIdCleanUp = function() {};

    // Trigger the callback if it's still waiting
    callback();

    promptBox.parentNode.removeChild(promptBox);
    browser.browserIdActive = false;
    window.browserId.updateSignIn();
  };

  // Remove any active channel bits
  unload.when(function() {
    browser.browserIdCleanUp();
  });
}
