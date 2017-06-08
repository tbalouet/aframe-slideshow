(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('aframe-slideshow', {
    schema: {
      transitionHeight : {type: 'number', default: '2'},
      stepTransition   : {type: 'number', default: '0.01'},
      startpos         : {type: 'vec3',   default: {x: 0, y: 0, z: 0}},
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
      var that                = this;
      // console.log("[AFRAME-Slideshow Component] Component initialized");
      this.nbChildren         = this.el.children.length;
      this.registeredChildren = 0;
      this.currentIndex       = 0;
      
      this.cameraPath         = undefined;
      this.transitionHeight   = this.data.transitionHeight;
      this.deltaTransition    = 1;
      this.stepTransition     = this.data.stepTransition;

      if(!document.querySelector("a-assets")){
        let assets = document.createElement("a-assets");
        document.querySelector("a-scene").appendChild(assets);
      }

      this.addListeners();
    },
    addListeners: function(){
      var that = this;
      document.addEventListener("keydown", function(event) {
        let catched = false;
        if(event.keyCode === 39){
          that.nextSlide();
          catched = true;
        }
        else if(event.keyCode === 37){
          that.prevSlide();
          catched = true;
        }

        if(catched){
          event.stopPropagation();
          event.preventDefault();
        }
      });

      window.addEventListener("resize", () => {this.goToSlide(this.currentIndex, true);});

      if(document.querySelector("#controllerRight")){
        document.querySelector("#controllerRight").addEventListener("buttondown", (event) => {
          if(event.detail.id === 1){
            that.nextSlide();
          }
          else if(event.detail.id === 2){
            that.prevSlide();
          }
        });
      }
      if(document.querySelector("#controllerLeft")){
        document.querySelector("#controllerLeft").addEventListener("buttondown", (event) => {
          if(event.detail.id === 1){
            that.nextSlide();
          }
          else if(event.detail.id === 2){
            that.prevSlide();
          }
        });
      }
    },
    addChild: function(child){
      let index = Array.from(this.el.children).indexOf(child.el);
      var x = index % 5;
      var y = document.querySelector("a-scene").camera.el.object3D.position.y;
      var z = -Math.floor(index / 5);
      var p = new THREE.Vector3(x, 0, z).multiplyScalar(10).add(this.data.startpos);
      p.y = y;
      child.el.setAttribute('position', p);

      if(++this.registeredChildren >= this.nbChildren){
        this.goToSlide(this.currentIndex, true);
      }
    },
    nextSlide : function(){
      let nextIndex = (this.currentIndex + 1) % this.registeredChildren;
      this.goToSlide(nextIndex);
      this.currentIndex = nextIndex;
    },
    prevSlide : function(){
      let nextIndex = Math.max(this.currentIndex - 1, 0);
      this.goToSlide(nextIndex);
      this.currentIndex = nextIndex;
    },
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
      if(canvasRatio > 1.7){
        //Trick for fullscreen
        canvasRatio = 0.95;
        geomSize    = document.querySelector("#" + slideChild.id).components["aframe-slideshow-slide"].geomHeight;
      }
      let posZ         = ((geomSize) / 2)/(Math.tan((camFov * Math.PI / 180) / 2)) / canvasRatio;

      let newPos = new THREE.Vector3(slideChild.object3D.position.x, slideChild.object3D.position.y - userHeight, slideChild.object3D.position.z + posZ);
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
      if(this.deltaTransition < 1){
        let camParent = document.querySelector("#camParent").object3D;
        camParent.position.copy(this.cameraPath.getPointAt(this.deltaTransition));
        this.deltaTransition += this.stepTransition * (1000/60/timeDelta);
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
    createBox : function(){
      let asset       = document.getElementById(this.assetId);
      this.width      = (asset.width || 1920), this.height = (asset.height || 1080);
      this.geomHeight = 2;
      this.geomWidth  = this.geomHeight * (this.width/this.height);

      var box = document.createElement('a-box');

      // box.setAttribute('scale', new THREE.Vector3(3, 3, 0.2).multiplyScalar(0.5));
      box.setAttribute('draw', 'width: '+this.width+'; height: '+this.height+'');
      box.setAttribute('material', 'shader: flat; src: #'+this.assetId);
      box.setAttribute("depth", 0.05);
      box.setAttribute("height", this.geomHeight);
      box.setAttribute("width", this.geomWidth);
      this.el.appendChild(box);

      this.el.parentEl.components['aframe-slideshow'].addChild(this);
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
},{"./aframe-slideshow_component.js":1,"./aframe-slideshow_slide_component.js":2,"./util.js":4}],4:[function(require,module,exports){
var Util = {};
(function(){
  "use strict";
  /**
   * Check if user is on mobile
   * Useful for needed user interaction for media video/audio
   * @return {Boolean} if user is on mobile
   */
  Util.isMobile = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  /**
   * Analyse an URL search part, look for 'varToExtract=somevalue' in the string
   * @param  {[type]} varToExtract variable we want to extract from the URL
   * @return {[type]} the value associated to the varToExtract, or null if nothing was found
   */
  Util.extractFromUrl = function(varToExtract){
    return new Promise((resolve, reject) => {
      try{
        let parser  = document.createElement('a');
        parser.href = location.href;
        let value   = parser.search.substring(1).split("&").filter(function(cell){ return (cell.indexOf(varToExtract + "=") !== -1);});
        value       = (value.length > 0 ? value[0].split("=") : null);

        resolve(value && value.length > 0 ? value[1] || null : null);
      }
      catch(err){
        reject(err);
      }
    })
  };

  /**
   * Generate an Unique ID
   * @return {string} Unique ID of length 4
   */
  Util.guid = function(){
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4();
  }
})()

module.exports = Util;
},{}]},{},[3]);
