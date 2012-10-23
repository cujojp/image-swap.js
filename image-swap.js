/////////////////////////////////////
//
// fn.ImageSwap
// -----------------------------
// Use HTML5 srcset attributes to show and hide images based on 
// your browser viewport plus device pixel density. 
// 
// image-swap.js uses the HTML5 srcset attribute, plus javascript 
// breakpoints to load and swap image sources. When using CSS 
// 'display:none;' to hide an image on a page, an http request is
// still sent to the browser menaing the image is still loaded and
// hurting performance. 
// -----------------------------
//
// GETTING STARTED
// =======================
//
// Write your <img> tag's as you normally would but also define a class, and add an html5 srcset attribute (read more about html5 srcset attribute [here](http://goo.gl/MnfAf) ). When writing your html5 srcset attribute, define the image source, the width of the browser you wish to load the image source, and weather it is a retina image or not. 
//
// Here's an example of how the image tag should look:
//
// <img src="kitten.gif" class="kitten-img" srcset="
//   kitten_mobile.gif 320w, 
//   kitten_mobile_2x.gif 320w 2x, 
//   kitten_tablet.gif 768, 
//   kitten.gif 1024, 
//   kitten_2x.gif 1024 2x" 
// />
//
// INITIALIZATION:
// $.fn.imageSwap({imageContainer: '.swap-img', breakpoints: [480,768,1024]})
// 
// -----------------------------
//
// DEPENDENCIES:
// - /public/javascript/libs/jquery-1.7.2.js
//
//
// Copyright 2012 Kaleb White
// http://cujo.jp/
//
// Licensed under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
//
/////////////////////////////////////

!(function( $, window, document, undefined ){
  var ImageSwap,
  $win = $(window),
  defaults,
  breakpoints,
  helpers

  /////////////////////////////////////
  // Begin ImageSwap
  /////////////////////////////////////
  
  defaults = {
    imageContainer: '.swap-img',
    createNewImage: true, // if an image doesnt exist, do you want to make one?
    removeImage: true, // if an image srcset does not exist, we hide the image for that breakpoint
    loadBestAvailable: true, // if a 100% match is not found, load the cloesest image IN that breakpoint
    interval: 250,
    breakpoints: [
      480,
      768,
      1024
    ]
  }

  ImageSwap = function( elem, options ){
    var options
    this.options = options ? $.extend({}, defaults, options) : defaults
    options = this.options

    // fn.ImageSwap properties
    //========================================
    // our module's class name
    this.$swapImage = $('img' + options.imageContainer)
    // debouncer settings
    this.$windowInterval = options.interval
    // show our images after hiding
    this.$createEmptyImage = options.createNewImage
    // hide the image tag if no breakpoint found
    this.$removeImage = options.removeImage
    // load the best available image 
    this.$bestAvailable = options.loadBestAvailable
    // our breakpoints
    this.$breakpoints = options.breakpoints
    // srcset regex gets the URL than parses through the width values  
    this.$urlRegex = '[-a-zA-Z0-9@:%_+.~#?&//=]*'
    this.$imageFragmentRegex = '\\s*(' + this.$urlRegex + ')\\s*([0-9xwh.\\s]*)'
    this.INT_REGEXP = /^[0-9]+$/
    // fragments of the srcset attribute
    this.$srcsetRegex = '(' + this.$imageFragmentRegex + ',?)+'
    this.IMAGE_FRAGMENT_REGEXP = new RegExp(this.$imageFragmentRegex)
    // boolean to trigger if the image has been set or not
    this.setImage = false
    // our current breakpoint
    this.currBreakpoint = 0
    
    // Let's start the show!
    this.init()
  }

  // ImageSwap Methods
  ImageSwap.prototype = {

    swapImage: function(currImage, src, details, bp) {
      var $img = currImage,
      imgSrc = src ,
      imgWidth = details.w

      this.currBreakpoint = bp
      if ($($img).is(':hidden') && this.$createEmptyImage) {
        $($img).show()
      }

      $($img).addClass(bp).attr('src',imgSrc)
      this.setImage = false
    },

    // used for the width  and height plus retina / non retina qualities of the image
    imageDescriptions: function(string) {
      var descriptors = string.split(/\s/)
      var out = {}     
      for (var i = 0; i < descriptors.length; i++) {
        var desc = descriptors[i]
        if (desc.length > 0) {
          var lastChar = desc[desc.length-1], 
          value = desc.substring(0, desc.length-1), // get rid of the end w/h/x
          intVal = parseInt(value, 10),
          floatVal = parseFloat(value)
          if (value.match(this.INT_REGEXP) && lastChar === 'w') {
            out[lastChar] = intVal
          } else if (value.match(this.INT_REGEXP) && lastChar =='h') {
            out[lastChar] = intVal
          } else if (!isNaN(floatVal) && lastChar == 'x') {
            out[lastChar] = floatVal
          } else {
            this.error = 'Invalid srcset descriptor found in "' + desc + '".'
            this.isValid = false
          }
        }
      }
      return out
    },

    getImageData: function(bp,img) {
      var bestMatch = null,
      self = this, 
      srcSetCandidates = [],
      imgsrc = img,
      srcsetStrings = $(imgsrc).attr('srcset').split(','),
      ImageInfo = function(options) {
        this.src = options.src;
        this.w = options.w || Infinity;
        this.h = options.h || Infinity;
        this.x = options.x || 1;
      }

      this.currBreakpoint = bp
      // if we want to use the largest available from our object of images

      // loop through the source strings to parse the query
      // technically this is now looping through each possible image source regardless of 2x or 0x
      for (var i = 0; i < srcsetStrings.length; i++) {
        var winX = window.devicePixelRatio,
        match = srcsetStrings[i].match(self.IMAGE_FRAGMENT_REGEXP),
        matchSrc = match[1],
        matchWidth = self.imageDescriptions(match[2]),
        // throw the source and width/res into a new object
        srcInfo = new ImageInfo({
          src:matchSrc,
          x: matchWidth.x,
          w: matchWidth.w,
        })

        // we have our images width when it should be loaded thats matchWidth.w
        // we also have the pixel density thats matchWidth.x
        // lets find our current images we should load
        if (this.currBreakpoint <= srcInfo.w) {
          // - Find our image sources, regardless of multiples are defined
          if (matchWidth.w === this.currBreakpoint) {
            srcSetCandidates.push(srcInfo);     
          }
        }
      }

      // now we loop through our candidates and add the right one to the source!
      if (srcSetCandidates.length === 0) {
        console.error('No Images found for breakpoint '+this.currBreakpoint+'. Please add an image source within the srcset attribute.')
        $(imgsrc).attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==').hide()
        return
      }
      
      for (var j = 0; j < srcSetCandidates.length; j++) {
        console.log(srcSetCandidates,this.currBreakpoint,$win.outerWidth())

        if (
          winX >= 1.5 && // Are we high dpi?
          this.currBreakpoint <= srcSetCandidates[j].w  && // if our current breakpoint is larger
          srcSetCandidates[j].x >= winX // our images resoltuion is smaller than the window x
        ) {
          self.swapImage(imgsrc, srcSetCandidates[j].src, matchWidth, this.currBreakpoint)
          return
        }
        
        if (
          winX <= 1.5 && // are we low dpi?
          this.currBreakpoint <= srcSetCandidates[j].w && // is our image still larger than our breakpoint?
          srcSetCandidates[j].x <= winX // our images resoltuion is smaller than the window x
        ) {
          console.log(srcSetCandidates)
          self.swapImage(imgsrc, srcSetCandidates[j].src, matchWidth, this.currBreakpoint)
          return
        }

        if (srcSetCandidates.length === 1) {
          console.warn('No images match our current breakpoint, or device resolution!')

          if (this.$bestAvailable) {
            self.swapImage(imgsrc, srcSetCandidates[j].src, matchWidth, this.currBreakpoint)
            return
          }

          if (this.$removeImage) {
            $(imgsrc).attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==').hide()
          }
        }
      }
    },

    setupBreakpoints: function() {
			var winWidth = $win.width(), 
      winX = $win.devicePixelRatio
      self = this,
			done = false,
      imgsrc = this.$swapImage

      //console.log(this.$breakpoints[bp], this.lastSize)

      for (var bp in this.$breakpoints.sort(function(x,y) { return (y-x) })) {

        // mobile detection, load the smallest image!
        // window is currently smaller than any defined breakpoints
        if (!done && winWidth <= this.$breakpoints[this.$breakpoints.length-1]) {

          for (var i in this.$breakpoints.sort(function(x,y) { return (y-x) })) {
            var bp = this.$breakpoints[this.$breakpoints.length-1]
            if(imgsrc[i]) {
              self.getImageData(bp,imgsrc[i])
            }
          }
          done = true
        }

        // were going to use only the largest available breakpoint
        //for all our breakpoints we need to sort them and reverse the order it seems
        if (!done && winWidth >= this.$breakpoints[bp]) {
          for (var i in this.$breakpoints.sort(function(x,y) { return (y-x) })) {
            if(this.$breakpoints[bp] && imgsrc[i]) {    
              self.getImageData(this.$breakpoints[bp],imgsrc[i])
                                                                                          
            }
          }
          done = true
        }
      } // end looping through breakpoints
    },

    throttle : function(fn, timeout) {

      var timer, args, needInvoke

      return function() {
        args = arguments
        needInvoke = true

        if(!timer) {
          (function() {
            if(needInvoke) {
              fn.apply(args)
              needInvoke = false
              timer = setTimeout(arguments.callee, timeout)
            }
            else { timer = null }
          })()
        }
      }
    },
    
    init: function() { 
      var self = this

      $(domReady)

      function domReady(){
        // DOM Ready inits
        // Recommend calling a sequence of private functions here to kick off the app
        initializeBreakpoints()
        // one time init
        self.setupBreakpoints()  
      }

      // handleResponsive is a utility to assign all of the breakpoint event handlers we want for this module
      function initializeBreakpoints() {
        // run the throttle method and bind your setupBreakpoints to self to keep var's in scope
        $win.bind('resize', self.throttle($.proxy(self.setupBreakpoints, self), self.$windowInterval))
        //$win.bind('resize', self.throttle(self.setupBreakpoints.bind(self), self.$windowInterval))
      } // end initializeBreakpoints

    } // end fn.init

  } // end ImageSwap.prototype

  // Attach the ImageSwap constructor to our global namespace
  //app._Modules.ImageSwap = ImageSwap
  
  $.fn.imageSwap = function(options) {
    new ImageSwap(this, options)
  }

})( jQuery, window , document );
