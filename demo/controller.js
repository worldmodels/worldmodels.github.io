var scroll_top = 0;
var scroll_bottom = 1;
$(document).scroll(function(){
  scroll_top = $(document).scrollTop();
  scroll_bottom = scroll_top + $(document).height();
});

// blazy code
var bLazy = new Blazy({
  success: function(){
    updateCounter();
  }
});

// not needed, only here to illustrate amount of loaded images
var imageLoaded = 0;

function updateCounter() {
  imageLoaded++;
  console.log("blazy image loaded: "+imageLoaded);
}

var contKeyMap = {};

$(document).keydown(function(e) {
  e = e || event; // to deal with IE
  contKeyMap[e.keyCode] = e.type == 'keydown';
});

$(document).keyup(function(e) {
  e = e || event; // to deal with IE
  contKeyMap[e.keyCode] = e.type == 'keydown';
});

// mobile detection
var md = new MobileDetect(window.navigator.userAgent);
var mobileMode = false;
if (md.mobile()) {
  mobileMode = true;
}
if (!mobileMode) {
  console.log('desktop mode');
} else {
  console.log('mobile mode');
}

// To disable scrolling via pressing arrow keys on keyboard:
window.addEventListener("keydown", function(e) {
    // space, page up, page down and arrow keys:
    if([32, 33, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

// resize cover
function resize_cover() {
  "use strict";

  var screen_x = Math.max(window.innerWidth, 320);
  var screen_y = Math.max(window.innerHeight, 320);

  if (screen_y > screen_x) { // vertical
    //console.log("vertical mode screen_x = "+screen_x+", screen_y = "+screen_y);

    $('#cover_overlay_wrap').width(screen_x+'px');
    $('#cover_overlay_wrap').height(screen_x+'px');

    $('#cover_title').width(screen_x+'px');
    $('#cover_title').height(screen_x+'px');

  } else { // horizontal
    //console.log("horizontal mode screen_x = "+screen_x+", screen_y = "+screen_y);

    $('#cover_overlay_wrap').width(screen_x+'px');
    $('#cover_overlay_wrap').height(screen_y+'px');

    $('#cover_title').width(screen_y+'px');
    $('#cover_title').height(screen_y+'px');

  }

}

// fade in the scroll down arrow thing
function show_scrolldown() {
  "use strict";
  var screen_x = Math.max(window.innerWidth, 320);
  var screen_y = Math.max(window.innerHeight, 320);
  var threshold = 1.28; // only show if we can't initially see "World Models" real title.
  if (screen_y < threshold * screen_x) {
    $('#scrolldowntag')
      .delay(5000)
      .queue(function (next) { 
        $(this).css('opacity', '1'); 
        next(); 
      });
  }
}

// fade in the instructions
function show_instructions() {
  "use strict";
  var instruction_mobile = "Interactive demo.<br/>Tap screen to override the agent's decisions.";
  var instruction_desktop = "Interactive demo. Tap screen or use arrow keys to override the agent's decisions.";
  var instruction;
  if (mobileMode) {
    instruction = instruction_mobile;
  } else {
    instruction = instruction_desktop;
  }
  var screen_x = Math.max(window.innerWidth, 320);
  var screen_y = Math.max(window.innerHeight, 320);
  $('#cover_instruction_text').html(instruction);
  $('#cover_instruction').delay(25000).fadeOut("slow");
}

// overview diagram
function resize_overview_diagram() {
  "use strict";
  var div_name = "overview_diagram_div";
  var img_name = "overview_diagram";
  var best_width = 720;
  var screen_width = Math.max(window.document.getElementById(div_name).parentElement.clientWidth, 640)-100;
  var div_width = Math.max(window.document.getElementById(div_name).clientWidth-8, 320);
  var target_width = best_width;
  if (screen_width <= best_width) {
    target_width = div_width;
  } else {
    target_width = Math.min(screen_width, best_width);
  }
  $('#'+img_name).width(target_width+'px');
}
$( window ).resize(function() {
  resize_overview_diagram();
  resize_cover();
});

var WorldController = {};
(function(global) {
  "use strict";

  var replace_list = [
    'sketch_rnn_insect',
  ];

  var delay_list = [10];

  function replace_jpeg(filename, time_delay) {
    setTimeout(function(){
      console.log('replacing '+filename+'.jpeg with gif file.');
      $('#'+filename+'_img').attr('src', 'assets/gif/'+filename+'.gif');
    }, time_delay*1000);
  }

  function replace_jpeg_with_gif() {
    for (var i=0;i<replace_list.length;i++) {
      replace_jpeg(replace_list[i], delay_list[i]);
    }
  }

  var frameRendered = false;
  function checkFirstFrameRendered() {
    if (frameRendered === false) {
      // only do this once.
      frameRendered = true;
      console.log("Displaying document now.");

      $("#loading_text").hide();
      //$("#dtbody").show()
      $("#authors_section").show();

      //replace_jpeg_with_gif();
      resize_overview_diagram();
      resize_cover();
      show_instructions();
      show_scrolldown();
    }
  }
  global.checkFirstFrameRendered = checkFirstFrameRendered;
  console.log("Controller Initialized.");
})(WorldController);
(function(lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    //window.jsfeat = lib; // in ordinary browser attach library to window
  } else {
    module.exports = lib; // in nodejs
  }
})(WorldController);