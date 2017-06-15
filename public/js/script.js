(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('aframe-slideshow', {
    schema: {
      transitionHeight  : {type: 'number', default: '2'},//Height of the animated curve between two slides
      stepTransition    : {type: 'number', default: '0.01'},//speed of the animated transition 
      folder            : {type: 'string', default: 'public/assets/slides/'},//Folder of the slides assets
      namingConv        : {type: 'string', default: 'Slide_%num%'},//Naming convention of the slides where %num% represent slide number
      imageExtension    : {type: 'string', default: 'jpg'},//extension for image assets
      videoExtension    : {type: 'string', default: 'mp4'},//extension for video assets
      nbslides          : {type: 'number', default: '0'},//total number of slides
      startpos          : {type: 'vec3',   default: undefined},//Default position for the first slides
      distBetweenSlides : {type: 'number', default: '5'},//Distance between two slides
      nbColumns         : {type: 'number', default: '5'},//Number of columns for display arrangement
      slideYPos         : {type: 'number', default: '1.6'}//Y position of the slides
    },
    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,
    /**
     * Handles component initialization, called once when component is attached. Generally for initial setup.
     * @return {[type]} [description]
     */
    init: function () {
      var that            = this;
      this.hasBeenUpdated = false;
      // console.log("[AFRAME-Slideshow Component] Component initialized");
      this.initVariables();

      if(!document.querySelector("a-assets")){
        let assets = document.createElement("a-assets");
        document.querySelector("a-scene").appendChild(assets);
      }

      this.addListeners();
      this.initSlides();
    },
    /**
     * Init the variables from the component properties
     * @return {[type]} [description]
     */
    initVariables : function(){
      this.registeredChildren = 0;
      this.nbChildren         = parseInt(this.data.nbslides, 10);
      this.currentIndex       = 0;

      if(this.data.startpos){
        this.startpos = this.data.startpos;
      }
      else{
        this.startpos   = new THREE.Vector3();
        this.startpos.x = -((this.data.nbColumns - 1) / 2) * this.data.distBetweenSlides;
        this.startpos.y = this.data.slideYPos;
        this.startpos.z = (((this.nbChildren / this.data.nbColumns) - 1) / 2) * this.data.distBetweenSlides;
      }

      this.oldCamParentPos    = new THREE.Vector3();
      
      this.cameraPath         = undefined;
      this.transitionHeight   = this.data.transitionHeight;
      this.deltaTransition    = 1;
      this.stepTransition     = this.data.stepTransition;
    },
    /**
     * Handle updates on the component data 
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     * @return {[type]} [description]
     */
    update: function () {
      if(!this.hasBeenUpdated){
        //Skip update on initialization
        this.hasBeenUpdated = true;
        return;
      }

      //TODO: Update slides accordingly to changes made
    },
    /**
     * Add Keyboard and Oculus Touch listeners to handle slide changes
     * Also add listener on resize to adapt camera position toward slides to fit screen
     */
    addListeners: function(){
      var that = this;
      document.addEventListener("keydown", function(event) {
        let catched = false;
        if(event.keyCode === 39){//Right Arrow
          that.nextSlide();
          catched = true;
        }
        else if(event.keyCode === 37){//Left Arrow
          that.prevSlide();
          catched = true;
        }

        if(catched){
          event.stopPropagation();
          event.preventDefault();
        }
      });

      function handleController(event){
        if(document.querySelector("a-scene").is('vr-mode')){
          return;
        }
        if(event.detail.id === 1){//Trigger pressed
          that.nextSlide();
        }
        else if(event.detail.id === 2){//Bumper pressed
          that.prevSlide();
        }
      }

      //Oculus controllers handling
      //TODO: make a general handling for all controllers
      if(document.querySelector("#right-hand")){
        document.querySelector("#right-hand").addEventListener("buttondown", handleController);
      }
      if(document.querySelector("#left-hand")){
        document.querySelector("#left-hand").addEventListener("buttondown", handleController);
      }

      //Handles screen resizing
      window.addEventListener("resize", () => {this.goToSlide(this.currentIndex, true);});

      //Handles entering/exiting VR mode to replace the camera to the correct position
      document.querySelector('a-scene').addEventListener('exit-vr', function () {
        document.querySelector("#camParent").object3D.position.copy(that.oldCamParentPos);
      })
      document.querySelector('a-scene').addEventListener('enter-vr', function () {
        that.oldCamParentPos.copy(document.querySelector("#camParent").object3D.position);
        document.querySelector("#camParent").object3D.position.set(0, 0, 0);
      })
    },
    /**
     * Create the 'aframe-slideshow-slide' components inside the slideshow, based on its properties
     * @return {[type]} [description]
     */
    initSlides: function(){
      //Transforming component data into arrays for video and animated slides index
      let slidesVideo    = this.data.vidSlidesIndex.split(",").map(function(obj){ return parseInt(obj, 10);});
      let slidesAnimated = this.data.animSlidesIndex.split(",").map(function(obj){ return parseInt(obj, 10);});

      for(let i = 1, len = this.data.nbslides; i <= len; ++i){
        let entity = document.createElement("a-entity");
        entity.id = "slide"+i;
        let animate = "";
        if (slidesAnimated.indexOf(i) !== -1){
          animate = "animTransition: true;";
        }

        if (slidesVideo.indexOf(i) !== -1){
          //Creating a video slide
          entity.setAttribute("aframe-slideshow-slide", "src: "+this.data.folder+this.data.namingConv.replace("%num%", i)+"."+this.data.videoExtension+"; type: video;" + animate);
        }
        else{
          //Creating an image slide
          entity.setAttribute("aframe-slideshow-slide", "src: "+this.data.folder+this.data.namingConv.replace("%num%", i)+"."+this.data.imageExtension+"; type: image;" + animate);
        }
        this.el.appendChild(entity);
      }
    },
    /**
     * Add slide-child entity to slideshow and set its position in space (rows and columns formation)
     * Check when all slides are ready
     * @param {[type]} child [description]
     */
    addChild: function(child){
      let index = Array.from(this.el.children).indexOf(child);
      let vec   = new THREE.Vector3();
      vec.x     = (index % this.data.nbColumns);
      vec.z     = -Math.floor(index / this.data.nbColumns);
      vec.multiplyScalar(this.data.distBetweenSlides).add(this.startpos);
      vec.y     = this.data.slideYPos;
      child.setAttribute('position', vec);

      if(++this.registeredChildren >= this.nbChildren){
        this.onSlideshowReady();
      }
    },
    /**
     * Triggered when all slides are ready, put the camera in front of the first slide or the one pinned in the URL
     * @return {[type]} [description]
     */
    onSlideshowReady : function(){
      document.getElementById("loaderDiv").classList.remove('make-container--visible');

      try{
        let parser  = document.createElement('a');
        parser.href = location.href;
        if(parser.hash !== "" && parser.hash.indexOf("#p") !== -1){
          let index = parseInt(parser.hash.replace("#p", ""), 10);
          this.currentIndex = (isNaN(index) ? this.currentIndex : index);
        }
      }
      catch(err){
        console.log("[AFRAME-SLIDESHOW Component] Error parsing url", err);
      }
      finally{
        this.goToSlide(this.currentIndex, true);
      }
    },
    /**
     * Go to the next slide (go back to first slide after the last one)
     * @return {[type]} [description]
     */
    nextSlide : function(){
      let nextIndex = (this.currentIndex + 1) % this.registeredChildren;
      this.goToSlide(nextIndex);
      this.currentIndex = nextIndex;
    },
    /**
     * Go to previous slide (sticks to first)
     * @return {[type]} [description]
     */
    prevSlide : function(){
      let nextIndex = Math.max(this.currentIndex - 1, 0);
      this.goToSlide(nextIndex);
      this.currentIndex = nextIndex;
    },
    /**
     * Move the camera to slide X, put the camera to the right place (slide width fitting the screen)
     * @param  {int} index         slide Index
     * @param  {boolean} skipAnimation prevent animating between slide (for first init)
     * @return {[type]}               [description]
     */
    goToSlide : function(index, skipAnimation){
      let slideChild = this.el.children[index];
      if(!slideChild){
        return;
      }
      let camera     = document.querySelector("a-scene").camera,
        camParent    = document.querySelector("#camParent").object3D,
        renderer     = document.querySelector("a-scene").renderer,
        userHeight   = camera.el.components["camera"].data.userHeight,
        geomSize     = document.querySelector("#" + slideChild.id).components["aframe-slideshow-slide"].geomWidth,
        camFov       = camera.fov,
        canvasRatio  = renderer.getSize().width / renderer.getSize().height;

      let posZ         = ((geomSize) / 2)/(Math.tan((camFov * Math.PI / 180) / 2)) / canvasRatio;

      let newPos = new THREE.Vector3(slideChild.object3D.position.x, 0, slideChild.object3D.position.z + posZ);
      if(slideChild.components["aframe-slideshow-slide"].data.animTransition && !skipAnimation){
        let pointArray = [];
        pointArray.push(camParent.position.clone());
        pointArray.push(newPos.clone().sub(camParent.position).divideScalar(2).add(camParent.position).add(new THREE.Vector3(0, this.transitionHeight, 0)));
        pointArray.push(newPos.clone())
        this.cameraPath = new THREE.CatmullRomCurve3(pointArray);
        this.deltaTransition = 0;
      }
      else{
        camParent.position.copy(newPos);
      }
    },
    /**
     * Handles slide animation transition from X-1 to X following the assigned curve
     * @param  {float} time      global scene uptime
     * @param  {float} timeDelta time since the last frame
     * @return {[type]}           [description]
     */
    tick: function (time, timeDelta) {
      if(this.deltaTransition < 1){
        let camParent = document.querySelector("#camParent").object3D;
        camParent.position.copy(this.cameraPath.getPointAt(this.deltaTransition));
        this.deltaTransition += this.stepTransition;// * (1000/60/timeDelta);
        if(this.deltaTransition > 1){
          camParent.position.copy(this.cameraPath.getPointAt(1));
        }
      }
    },
    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     * @return {[type]} [description]
     */
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     * @return {[type]} [description]
     */
    play: function () { },

    /**
     * Handles component removal, called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     * @return {[type]} [description]
     */
    remove: function () {
    }
  });
})();
},{}],2:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('aframe-slideshow-slide', {
    schema: {
      src: {type: 'string', default: ''},
      type: {type: 'string', default: 'image'}
    },
    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,
    /**
     * Handles component initialization, called once when component is attached. Generally for initial setup.
     * @return {[type]} [description]
     */
    init: function () {
      // console.log("[AFRAME-Slideshow-Slide Component] Component initialized", this.data.src);
      this.assetId = this.data.type + "_" + this.el.id;

      let assetFile;
      //Check component type and create appropriate asset
      if(this.data.type === "image"){
        assetFile = document.createElement("img");
        assetFile.setAttribute("id", this.assetId);
        assetFile.addEventListener("load", this.createBox.bind(this));
        assetFile.setAttribute("src", this.data.src);
        assetFile.setAttribute("crossorigin", "anonymous");
        document.querySelector("a-assets").appendChild(assetFile);
      }
      else if(this.data.type === "video"){
        assetFile = document.createElement("video");
        assetFile.setAttribute("id", this.assetId);
        assetFile.setAttribute("src", this.data.src);
        assetFile.setAttribute("crossorigin", "anonymous");
        assetFile.setAttribute("autoplay", "autoplay");
        assetFile.setAttribute("loop", true);
        assetFile.setAttribute("muted", "true");
        assetFile.muted = true;
        document.querySelector("a-assets").appendChild(assetFile);
        this.createBox();
      }

    },
    /**
     * Create an a-box component containing the entity asset
     */
    createBox : function(){
      let asset       = document.getElementById(this.assetId);
      this.width      = 1024, this.height = 512;
      this.geomHeight = 2;
      this.geomWidth  = this.geomHeight * (this.width/this.height);

      var box = document.createElement('a-box');
      box.setAttribute('material', 'shader: flat; src: #'+this.assetId);
      box.setAttribute("depth", 0.05);
      box.setAttribute("height", this.geomHeight);
      box.setAttribute("width", this.geomWidth);
      this.el.appendChild(box);

      this.el.parentEl.components['aframe-slideshow'].addChild(this.el);
    },
    /**
     * Handle updates on the component data 
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     * @return {[type]} [description]
     */
    update: function () {
    },
    /**
     * Handles component, called on each animation frame
     * @param  {float} time      global scene uptime
     * @param  {float} timeDelta time since the last frame
     * @return {[type]}           [description]
     */
    tick: function (time, timeDelta) {
    },
    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     * @return {[type]} [description]
     */
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     * @return {[type]} [description]
     */
    play: function () { },

    /**
     * Handles component removal, called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     * @return {[type]} [description]
     */
    remove: function () {
    }
  });
})();
},{}],3:[function(require,module,exports){
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  require("./aframe-slideshow_component.js");
  require("./aframe-slideshow_slide_component.js");
})();
},{"./aframe-slideshow_component.js":1,"./aframe-slideshow_slide_component.js":2}]},{},[3]);
