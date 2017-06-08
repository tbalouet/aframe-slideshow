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