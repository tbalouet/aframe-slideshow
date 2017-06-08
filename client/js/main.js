// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  require("./aframe-slideshow_component.js");
  require("./aframe-slideshow_slide_component.js");
  var Util         = require("./util.js");

  window.onload = function(){
    document.getElementById("loaderDiv").classList.remove('make-container--visible');

    window.setTimeout(function() { populateSlideshow() }, 500)

    function populateSlideshow(){
      var slideshow = document.querySelector("[aframe-slideshow]");
      let NB_SLIDES = 37;

      var slidesVideo = [3, 4, 20, 26, 28];
      // to be generated fom the list of slides
      for(let i = 1, len = NB_SLIDES; i <= len; ++i){
        var entity = document.createElement("a-entity");
        entity.id = "slide"+i;
        let animate = "";
        if(i === 20 || i === 21){
          animate = "animTransition: true;";
        }
        if (slidesVideo.indexOf(i) === -1)
          entity.setAttribute("aframe-slideshow-slide", "src: public/assets/slides/Slide ("+i+").png; type: image;" + animate);
        else
          entity.setAttribute("aframe-slideshow-slide", "src: public/assets/slides/Slide ("+i+").mp4; type: video;" + animate);
        slideshow.appendChild(entity);
      }
    }

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