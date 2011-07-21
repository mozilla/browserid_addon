# BrowserID and Sessions API Firefox Addons

Contained in this project are two addons, one to implement BrowserID as a 
Firefox addon, the second implementing the still experimental Sessions API. 

## BrowserID Addon
This is an addon that implements BrowserID as part of the browser chrome
instead of opening a popup window to log in.

Code for this is found in addons/browserid

## Sessions API Addon
The Sessions API is an experimental API designed to bring session information
into the browser chrome.  The goal is to train the user to relate their
login information with a particular site as well as to look to their URL
bar for all of their session related needs.  When visiting a supporting site,
a small box to the left of the URL bar will allow a user to login, logout, and
view their session information.

Code for this is found in addons/sessions

## Developer Info:

* Mozilla Labs
* @mozlabs
* https://mozillalabs.com
* http://identity.mozilla.com

## Background Info
* https://wiki.mozilla.org/Identity
* https://wiki.mozilla.org/Identity/Verified_Email_Protocol

Primary Developer:
Shane Tomlinson - stomlinson@mozilla.com, @shane_tomlinson


## License Info:
MPL 1.1, GPL 2.0, LGPL 2.1
