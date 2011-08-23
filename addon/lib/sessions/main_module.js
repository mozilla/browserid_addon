"use strict";
const {data} = require("self");
const {PageMod} = require("page-mod");
const {Helpers} = require("helpers");
const {WindowManager} = require("sessions/window_manager");
const {TabManager} = require("sessions/tab_manager");
const tabs = require("tabs");
const {Permissions} = require("sessions/permissions");
const timer = require("timer");

/**
 * The main session module.
 *
 * The main flow is - WindowManager is a window watcher.  For every window that 
 * is opened, a Session model, a SessionDisplay, and a SessionPanel are created.
 *
 * A single TabManager keeps track of all tabs that are opened across all 
 * windows. It creates a session for every tab and does the management of those 
 * sessions. The  TabManager also keeps track of which tab is currently active, every 
 * time a new tab becomes active, the TabManager tell that tab's window that a new 
 * tab has become active and that it should display that tab's sessions. 
 *
 * The way this works is that there are two sets of content scripts.  One set 
 * of content scripts is loaded into every page that is opened into the 
 * browser.  This set of content scripts listens for changes to 
 * navigator.id.sessions as well as triggers the login and logout events 
 * whenever there is interaction with the Sign In and Sign Out buttons that are 
 * located in the browser chrome.  This set of content scripts also notifies us 
 * whenever a new page is loaded and whenever the page is ready.
 *
 * The second set of content scripts deals with the SessionPanel that is loaded 
 * into each window.  Whenever the user presses "Sign Out" in the SessionPanel, 
 * we have to tell the site that it needs to log the user out - this is done 
 * via the 'logout' event.
 */
exports.MainSession = function() {
  let pm = new Permissions();
  let windowManager = new WindowManager();
  windowManager.on("login", emitEvent.bind(null, "emitevent.login"));
  windowManager.on("logout", emitEvent.bind(null, "emitevent.logout"));
  let tabManager = new TabManager();

  let currWorker;

  let pageMod = PageMod({
      include: ["*"],
      contentScriptWhen: "start",
      contentScriptFile: data.url("sessions/page_interaction.js"),
      onAttach: function(worker) {
          /**
           * only do this if we are in a tab - jetpack panels cause
           * a worker to be created as well, but we don't want to bind
           * to them.
           *
           * sessions.set means the page set navigator.id.sessions and we have 
           * to update the tab's session model.
           *
           * sessions.opentab means that a new page was opened in the tab and 
           * we have to prepare that tab's session model for a possible reset
           *
           * sessions.tabready means that the tab's contents are fully ready 
           * and that we should either remove the session display or update its 
           * contents.
           *
           * We have to keep track of which worker to respond to for a tab.  
           * Since a page can have multiple iframes, some of those iframes 
           * coming after the initial session information is set, we only 
           * set the tab's worker to be the worker that we receive messages 
           * from.  We do this whenever we get a response for any of the 
           * messages below.
           */
          if (worker.tab) {
              worker.port.on("sessions.set", onSessionSet.bind(worker));
              worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker));
              worker.port.on("sessions.tabready", onSessionTabReady.bind(worker));
          }
      }
  });


  /**
   * The page has set its session data, update the tab's session model.
   */
  function onSessionSet(data) {
      this.tab.worker = this;
      tabManager.sessionUpdate(this.tab, data);
  }


  /**
   * A new page was opened within the tab, notify the tab's session model that 
   * it may have to reset itself.
   */
  function onSessionTabOpen(data) {
      this.tab.worker = this;
      tabManager.sessionReset(this.tab, data);
  };

  /**
   * The tab's content is now ready, either update the session display or 
   * remove it if there is no session data.
   */
  function onSessionTabReady() {
      this.tab.worker = this;
      tabManager.tabReady(this.tab);
  };

  function emitEvent(eventName) {
      let tab = tabs.activeTab;
      if (tab) {
          /**
           * This is ghetto fantastic.  For BrowserID to work, it opens a popup 
           * window.  The popup window is opened programatically, but is 
           * normally blocked because there is no click within the page.  We 
           * are giving temporary permissions to open a popup and then we reset 
           * the permission to its original state.
           */
          pm.allow("popup");
          tab.worker.port.emit(eventName);
          timer.setTimeout(function() {
              pm.reset("popup", tab);
          }, 500);
      }
  };

}

