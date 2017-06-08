(function(){
  "use strict";

  AFRAME.registerComponent('aframe-slideshow', {
    schema: {},
    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,
    /**
     * Handles component initialization, called once when component is attached. Generally for initial setup.
     * @return {[type]} [description]
     */
    init: function () {
      var that = this;
      console.log("[AFRAME-Slideshow Component] Component initialized");
      this.nbChildren = this.el.children.length;
      this.registeredChildren = 0;
      this.currentIndex = 0;

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

      if(!document.querySelector("a-assets")){
        let assets = document.createElement("a-assets");
        document.querySelector("a-scene").appendChild(assets);
      }

      window.addEventListener("resize", () => {this.goToSlide(this.currentIndex);});

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
      console.log("[AFRAME-Slideshow Component] Child added", child);

      if(++this.registeredChildren >= this.nbChildren){
        console.log("All children are home");
        this.goToSlide(this.currentIndex);
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
    goToSlide : function(index){
      let slideChild = this.el.children[index];
      if(!slideChild){
        return;
      }
      let camera     = document.querySelector("a-scene").camera,
        renderer     = document.querySelector("a-scene").renderer,
        userHeight   = camera.el.components["camera"].data.userHeight,
        geomWidth    = document.querySelector("#" + slideChild.id).components["aframe-slideshow-slide"].geomWidth,
        camFov       = camera.fov,
        canvasRatio  = renderer.getSize().width / renderer.getSize().height,
        posZ         = ((geomWidth) / 2)/(Math.tan((camFov * Math.PI / 180) / 2)) / canvasRatio;

      document.querySelector("#camParent").object3D.position.set(slideChild.object3D.position.x, slideChild.object3D.position.y - userHeight, slideChild.object3D.position.z + posZ);
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