## aframe-slideshow-component

[![Version](http://img.shields.io/npm/v/aframe-slideshow-component.svg?style=flat-square)](https://npmjs.org/package/aframe-slideshow-component)
[![License](http://img.shields.io/npm/l/aframe-slideshow-component.svg?style=flat-square)](https://npmjs.org/package/aframe-slideshow-component)

A component to present slide shows inside an A-Frame scene

The point is to allow you to embed your slides inside a WebVR demo done with A-Frame, to simplify presentations and directly showcase 
features to your users.

This was used during the DevFestLille June 2017 by Thomas Balouet (@thomasbalou) and Fabien Benetou (@utopiah). We demonstrated use of 3D Web
(by the existence of the Slideshow in 3D itself), as well as the Gamepad API, and the A-Painter project allowing us to draw over the slides in VR.
The component's work is to fetch images and videos in a repository, display them in the 3D space as planes and enable the user to navigate through them.

![Thomas drawing over the slides](https://pbs.twimg.com/media/DB40NBAW0AIgxVB.jpg:large)

[Link to the A-Frame presentation made at GDG Lille](https://aframe-slides.firebaseapp.com)
[Live demo of the component](https://tbalouet.github.io/aframe-slideshow/examples/basic)

For [A-Frame](https://aframe.io).

### API

| Property        | Description                                                      | Default Value         |
| --------        | -----------                                                      | -------------         |
|transitionHeight |Height of the animated curve between two slides                   |'2'                    |
|stepTransition   |Speed of the animated transition                                  |'0.01'                 |
|folder           |Folder of the slides assets                                       |'public/assets/slides/'|
|namingConv       |Naming convention of the slides where %num% represent slide number|'Slide_%num%'          |
|imageExtension   |File extension for image assets                                   |'jpg'                  |
|videoExtension   |File extension for video assets                                   |'mp4'                  |
|nbslides         |Total number of slides                                            |'0'                    |
|startpos         |Default position for the first slides                             |undefined              |
|distBetweenSlides|Distance between two slides                                       |'5'                    |
|nbColumns        |Number of columns for display arrangement                         |'5'                    |
|slideYPos        |Y position of the slides                                          |'1.6'                  |


### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-slideshow-component/dist/aframe-slideshow-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity aframe-slideshow="nbslides:5;folder:public/assets/slides/;namingConv:Slide_%num%;vidSlidesIndex:3;animSlidesIndex:5"></a-entity>
  </a-scene>
</body>
```

<!-- If component is accepted to the Registry, uncomment this. -->
<!--
Or with [angle](https://npmjs.com/package/angle/), you can install the proper
version of the component straight into your HTML file, respective to your
version of A-Frame:

```sh
angle install aframe-slideshow-component
```
-->

#### npm

Install via npm:

```bash
npm install aframe-slideshow-component
```

Then require and use.

```js
require('aframe');
require('aframe-slideshow-component');
```
