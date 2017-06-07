// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  require("./aframe-slideshow_component.js");
  require("./aframe-slideshow_slide_component.js");
  var Util         = require("./util.js");

  window.onload = function(){
    document.getElementById("loaderDiv").classList.remove('make-container--visible');

    console.log("[WARNING] Service Worker is disabled!");
    //Launch a Service Worker (if possible) for Offline handling
    if (false && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then(function(data) { 
          console.log('Service Worker Registered');
        })
        .catch(function(err){ console.log("Error in registering Service Worker", err)});
    }
  };
})();