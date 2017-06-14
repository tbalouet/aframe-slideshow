(function(){
  "use strict";

  AFRAME.registerComponent('aframe-slideshow', {
    schema: {
      transitionHeight  : {type: 'number', default: '2'},
      folder            : {type: 'string', default: 'public/assets/slides/'},
      nbslides          : {type: 'number', default: '0'},
      stepTransition    : {type: 'number', default: '0.01'},
      startpos          : {type: 'vec3',   default: undefined},
      distBetweenSlides : {type: 'number', default: '5'},
      nbColumns         : {type: 'number', default: '5'},
      slideYPos         : {type: 'number', default: '1.6'}
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
      this.nbChildren         = parseInt(this.data.nbslides);
      this.registeredChildren = 0;
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

      if(!document.querySelector("a-assets")){
        let assets = document.createElement("a-assets");
        document.querySelector("a-scene").appendChild(assets);
      }

      this.addListeners();
      this.initSlides();
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

      if(document.querySelector("#right-hand")){
        document.querySelector("#right-hand").addEventListener("buttondown", (event) => {
          if(document.querySelector("a-scene").is('vr-mode')){
            return;
          }
          if(event.detail.id === 1){
            that.nextSlide();
          }
          else if(event.detail.id === 2){
            that.prevSlide();
          }
        });
      }
      if(document.querySelector("#left-hand")){
        document.querySelector("#left-hand").addEventListener("buttondown", (event) => {
          if(document.querySelector("a-scene").is('vr-mode')){
            return;
          }
          if(event.detail.id === 1){
            that.nextSlide();
          }
          else if(event.detail.id === 2){
            that.prevSlide();
          }
        });
      }

      document.querySelector('a-scene').addEventListener('exit-vr', function () {
        document.querySelector("#camParent").object3D.position.copy(that.oldCamParentPos);
      })
      document.querySelector('a-scene').addEventListener('enter-vr', function () {
        that.oldCamParentPos.copy(document.querySelector("#camParent").object3D.position);
        document.querySelector("#camParent").object3D.position.set(0, 0, 0);
      })
    },
    initSlides: function(){
      var slidesVideo = this.data.vidSlidesIndex.split(",").map(function(obj){ return parseInt(obj, 10);});
      var slidesAnimated = this.data.animSlidesIndex.split(",").map(function(obj){ return parseInt(obj, 10);});
      // to be generated fom the list of slides
      for(let i = 1, len = this.data.nbslides; i <= len; ++i){
        var entity = document.createElement("a-entity");
        entity.id = "slide"+i;
        let animate = "";
        if (slidesAnimated.indexOf(i) !== -1){
          animate = "animTransition: true;";
        }
        if (slidesVideo.indexOf(i) !== -1){
          entity.setAttribute("aframe-slideshow-slide", "src: "+this.data.folder+"Slide_("+i+").mp4; type: video;" + animate);
        }
        else{
          entity.setAttribute("aframe-slideshow-slide", "src: "+this.data.folder+"Slide_("+i+").png; type: image;" + animate);
        }
        this.el.appendChild(entity);
      }
    },
    addChild: function(child){
      let index = Array.from(this.el.children).indexOf(child.el);
      let vec = new THREE.Vector3();
      vec.x = (index % this.data.nbColumns);
      vec.z = -Math.floor(index / this.data.nbColumns);
      vec.multiplyScalar(this.data.distBetweenSlides).add(this.startpos);
      vec.y = this.data.slideYPos;
      child.el.setAttribute('position', vec);

      if(++this.registeredChildren >= this.nbChildren){
        this.onSlideshowReady();
      }
    },
    onSlideshowReady : function(){
      document.getElementById("loaderDiv").classList.remove('make-container--visible');
      this.goToSlide(this.currentIndex, true);
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
      // if(canvasRatio > 1.9){
      //   //Trick for fullscreen
      //   canvasRatio = 1;
      //   geomSize    = document.querySelector("#" + slideChild.id).components["aframe-slideshow-slide"].geomHeight;
      // }
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