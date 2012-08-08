// Plain Text Offenders
// Chrome Extension
// Written By: Melsa Smith, 2012

var server_req = new XMLHttpRequest();
var server = "http://pto.vexillifer.ca/plaintextoffenders/v1/";

var cache = {};
var output = '';

// If a new domain is accessed, check if PTO
function tabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url !== undefined){
    if (tab.active){ // Do not change state for tabs updated in bg
      checkPTOStatus(changeInfo.url);
    }
  }
}

// Change the icon for active tab
function tabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    checkPTOStatus(tab.url);
  });
}

function checkPTOStatus(url) {
    var domain = getDomain(url);
    var link = cache[domain];
    if (domain === ''){ // Valid domain not found, leave as default
      chrome.browserAction.setIcon({path: 'PTOGrey16.png'});

    } else if (link === undefined){ // Cache miss, determine if offender
      // Default to non-offender - may result in false negative
      chrome.browserAction.setIcon({path: 'PTOGrey16.png'});

      server_req.open( "GET", server + domain, true);
      server_req.onload = retrievePTOStatus;
      server_req.send(null);
    } else if (link === '') { // Link is cached as a non-offender
      chrome.browserAction.setIcon({path: 'PTOGrey16.png'});
      output = '';

    } else { // Link is cached as an offender
      chrome.browserAction.setIcon({path: 'PTORed16.png'});
      postOffender(domain, link);
    }
}

// Retrieve PTO Status from server and update cache
function retrievePTOStatus() {
  var jsonResponse = JSON.parse(server_req.responseText);
  if (jsonResponse.url !== null) {
    chrome.browserAction.setIcon({path: 'PTORed16.png'});
    cache[jsonResponse.name] = jsonResponse.url;
    postOffender(jsonResponse.name, jsonResponse.url);
  } else {
    chrome.browserAction.setIcon({path: 'PTOGrey16.png'});
    cache[jsonResponse.name] = '';
    output = '';
  }
}

// Post offender info to extension form
function postOffender(domain, link){
  output = link;
}

// TODO check why some are null
function getDomain(url){
  var domain = url.match(/^((http|ftp|https):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
  if (domain === null){
    domain = '';
    return domain;
  } else {
    return domain[3].replace("www.", "");
  }
}

// Link users to PTO report
function onClick() {
  if (output === ''){
    alert('Non-Offender!');
  } else {
    chrome.tabs.create({url: output});
  }
}

chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.tabs.onActivated.addListener(tabActivated);
chrome.browserAction.onClicked.addListener(onClick);


// Read cache
// var cache_req = new XMLHttpRequest();
// cache_req.overrideMimeType('text/plain');
// cache_req.open("GET", "cache.txt", true);
// cache_req.onreadystatechange = function() {
//   if (cache_req.readyState == 4 && cache_req.status == 200) {
//     cache = cache_req.responseText;
//     alert("Cache Load: " + cache);
//     // lines = txtFile.responseText.split("\n"); 
//   }
// };
// cache_req.send(null);

