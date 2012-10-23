image-swap.js
===========

Use HTML5 srcset attributes to show and hide images based on your browser viewport plus device pixel density. 

image-swap.js uses the HTML5 srcset attribute, plus javascript breakpoints to load and swap image sources. When using CSS 'display:none;' to hide an image on a page, an http request is still sent to the browser menaing the image is still loaded and hurting performance. 

image-swap.js will show and hide an image based on when and if you define an image to be loaded, and its quite simple!

----------------------------------------------------------
Getting Started
===========

Write your <img> tag's as you normally would but also define a class, and add an html5 srcset attribute (read more about html5 srcset attribute [here](http://goo.gl/MnfAf) ). When writing your html5 srcset attribute, define the image source, the width of the browser you wish to load the image source, and weather it is a retina image or not. 

Here's an example of how the image tag should look:

    <img src="kitten.gif" class="kitten-img" srcset="
      kitten_mobile.gif 320w, 
      kitten_mobile_2x.gif 320w 2x, 
      kitten_tablet.gif 768, 
      kitten.gif 1024, 
      kitten_2x.gif 1024 2x" 
    />

Then initialize image-swap.js. 

    $.fn.imageSwap({imageContainer: '.kitten-img', breakpoints: [320,768,1024]})

Notice the imageContainer, is the class we defined in the <img> tag, and the browser width's we have defined in our image tag match our breakpoints defined in the initialization script.

NOTE: It's important the breakpoints match otherwise the script will not work!

----------------------------------------------------------

Options
===========

You can add your own options when initializing the plugin. The image class names can be modified (default class is 'swap-image'), plus we can hide and show the image based with the following options!

    imageContainer: string (the image class name) 
    createNewImage: true / false (show the image after hidden)
    removeImage: true / false (hides the image with a inline transparent 1x1.gif) 
    loadBestAvailable: true / false (if on 2x device no 2x image defined, load the low-res image)
    interval: int (how frequent does the script run on window resize in milliseconds)


----------------------------------------------------------

See it in Action
===========

This is coming soon too! I'm sorry! :(
