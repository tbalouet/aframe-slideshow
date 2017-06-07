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
        event.stopPropagation();
        if(event.keyCode === 39){
          let nextIndex = (that.currentIndex + 1) % that.registeredChildren;
          that.goToSlide(nextIndex);
          that.currentIndex = nextIndex;
        }
        else if(event.keyCode === 37){
          let nextIndex = Math.max(that.currentIndex - 1, 0);
          that.goToSlide(nextIndex);
          that.currentIndex = nextIndex;
        }
        event.preventDefault();
      });

      if(!document.querySelector("a-assets")){
        let assets = document.createElement("a-assets");
        document.querySelector("a-scene").appendChild(assets);
      }
    },
    addChild: function(child){
      console.log("[AFRAME-Slideshow Component] Child added", child);

      if(++this.registeredChildren >= this.nbChildren){
        console.log("All children are home");
        this.goToSlide(this.currentIndex);
      }
    },
    goToSlide : function(index){
      let slideChild = this.el.children[index];
      if(!slideChild){
        return;
      }
      document.querySelector("a-scene").camera.position.set(slideChild.object3D.position.x, slideChild.object3D.position.y - 1, slideChild.object3D.position.z + 3);
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