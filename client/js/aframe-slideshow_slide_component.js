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
      console.log("[AFRAME-Slideshow-Slide Component] Component initialized", this.data.src);
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
        document.querySelector("a-assets").appendChild(assetFile);
        this.createBox();
      }

    },
    createBox : function(){
      let asset = document.getElementById(this.assetId);
      let width = (asset.width || 1920), height = (asset.height || 1080);
      let index = Array.from(this.el.parentEl.children).indexOf(this.el);

      var box = document.createElement('a-box');

      var x = index % 5;
      var z = -Math.floor(index / 5);
      var p = new THREE.Vector3(x, 0, z).multiplyScalar(10);
      this.el.setAttribute('position', p);

      box.setAttribute('scale', new THREE.Vector3(3, 3, 0.2).multiplyScalar(0.5));
      box.setAttribute('draw', 'width: '+width+'; height: '+height+'');
      box.setAttribute('material', 'shader: flat; src: #'+this.assetId);
      box.setAttribute("depth", 0.5);
      box.setAttribute("height", 2);
      box.setAttribute("width", 2 * (width/height));
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