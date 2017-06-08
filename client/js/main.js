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
      let NB_SLIDES = 7;

      var slidesVideo = [3, 4]
      // to be generated fom the list of slides
      for(let i = 1, len = NB_SLIDES; i <= len; ++i){
        var entity = document.createElement("a-entity");
        entity.id = "slide"+i;
        if (slidesVideo.indexOf(i) === -1)
          entity.setAttribute("aframe-slideshow-slide", "src: public/assets/slides/Slide ("+i+").png; type: image;");
        else
          entity.setAttribute("aframe-slideshow-slide", "src: public/assets/slides/Slide ("+i+").mp4; type: video;");
        slideshow.appendChild(entity);
      }

      slideCamera()
      // now that all slides are loaded we switch the camera
    }

    // specific to apainter
    function slideCamera(){
      // move from the apainter camera to the slideshow camera
      document.querySelector("#acamera").classList.remove('active-camera')
      document.querySelector("#acamera").setAttribute('camera', 'active', false)
      document.querySelector("#mainCam").setAttribute('camera', 'active', true)
      document.querySelector("#mainCam").classList.add('active-camera')
    }
    function paintCamera(){
      // move from the slideshow camera to the apainter camera
      document.querySelector("#mainCam").classList.remove('active-camera')
      document.querySelector("#mainCam").setAttribute('camera', 'active', false)
      document.querySelector("#acamera").setAttribute('camera', 'active', true)
      document.querySelector("#acamera").classList.add('active-camera')
    }
    document.querySelector('#apainter-logo').style.visibility = "hidden"
    document.querySelector('a-scene').addEventListener('exit-vr', function () {
      slideCamera()
    })
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
      paintCamera()
    })

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