
var vae_demo = function(settings) {
  "use strict";

  var vae_sketch = function( p ) { 
    "use strict";

    // functions
    var model = settings.model;
    var dequantize = model.dequantize;
    var randn = model.randn;
    var randi = model.randi;

    var div_name = settings.div_name;
    var img;
    var file_img;
    var file_latent;
    var pic;
    var z;
    var z_size = model.z_size;
    var mu, sigma;
    var file_number = 0;
    var min_range = settings.min_range;
    var max_range = settings.max_range;
    var interesting = settings.interesting;
    var N = interesting.length;

    // dom
    var canvas;
    var slider = [];
    var single_slider;
    var random_file_button;
    var random_z_button;
    var rect, origy, origx, screen_x, screen_y;

    // settings
    var min_image_size = 320;
    var image_size = 200;
    var suggested_slider_width = 100;
    var suggested_slider_height = 100;
    var slider_width, slider_height;

    // display_orientation
    var horizontal = true;
    var file_x, file_y;
    var img_x, img_y;
    var file_button_x, file_button_y;
    var z_button_x, z_button_y;
    var file_desc_x, file_desc_y;
    var z_desc_x, z_desc_y;
    var latent_desc_x, latent_desc_y;
    var slider_x = new Array(N);
    var slider_y = new Array(N);
    var screen_width, screen_height;

    // loading image event handling
    var loading_file_img = false;

    // resize and timing issues
    var redraw_frame = true;

    function set_screen() {
      var i, j, k;

      screen_width = Math.max(window.document.getElementById(div_name).parentElement.clientWidth, min_image_size);
      screen_height = Math.max(window.document.getElementById(div_name).parentElement.clientHeight, min_image_size);

      // make dom
      var bodyRect = document.body.getBoundingClientRect()
      rect = window.document.getElementById(div_name).getBoundingClientRect();

      origy = rect.top - bodyRect.top;
      origx = rect.left - bodyRect.left;

      horizontal = true;

      if ((window.innerWidth - rect.left*2) < (min_image_size*2+suggested_slider_width+20) && p.frameCount > 0) {
        horizontal = false;
      }

      if (horizontal) {
        image_size = Math.max((screen_width - (suggested_slider_width+20) ) / 2, min_image_size);
        slider_width = suggested_slider_width;
        slider_height = image_size / N;
        screen_x = image_size*2+slider_width+20;
        screen_y = image_size+100;

        img_y = file_y = 50;
        file_x = 0;
        img_x = image_size+slider_width+20

        z_button_y = file_button_y = image_size+50+20;
        file_button_x = 10;
        z_button_x = image_size+10;

        for(i=0;i<N;i++) {
          slider_x[i] = image_size+7.5;
          slider_y[i] = 55 + i*slider_height;
        }

        file_desc_x = 10;
        file_desc_y = 35;
        latent_desc_x = slider_width/2+image_size;
        latent_desc_y = 45;
        z_desc_x = image_size + slider_width+20+10;
        z_desc_y = 35;

      } else {
        // likely to be mobile or a thin vertical browser session.
        image_size = min_image_size;
        slider_height = 25;
        screen_x = Math.max(image_size, screen_width);
        screen_y = image_size*2+5*slider_height+175;
        slider_width = (image_size)/3-10;

        file_x = (screen_x-image_size)/2;
        file_y = 50;

        file_desc_x = file_x;
        file_desc_y = 35;

        file_button_x = file_x+(image_size/4);
        file_button_y = image_size+60;

        img_x = (screen_x-image_size)/2;
        img_y = screen_y - image_size;

        z_desc_x = img_x;
        z_desc_y = image_size*1+160+0+slider_height*5;

        z_button_x = img_x+(image_size/3);
        z_button_y = image_size + 108 + slider_height*5;

        latent_desc_x = file_x+10;
        latent_desc_y = image_size+85;

        k = 0;
        for(i=0;i<3;i++) {
          for(j=0;j<5;j++) {
            slider_x[k] = img_x+5+(slider_width+10)*i;
            slider_y[k] = image_size+100+j*slider_height;
            k += 1;
          }
        }

      }

    }

    function draw_sliders() {
      var i;
      for(i=0;i<N;i++) {
        slider[i].style('width', slider_width+'px');
        slider[i].position(origx+slider_x[i], origy+slider_y[i]);
      }
    }

    function set_sliders(z) {
      var i;
      for(i=0;i<N;i++) {
        slider[i].value(z[interesting[i]]*100);
      }
    }

    function get_sliders() {
      var i;
      var z_slider = new Array(z_size);
      for(i=0;i<z_size;i++) {
        z_slider[i] = z[i];
      }
      for(i=0;i<N;i++) {
        z_slider[interesting[i]] = slider[i].value() / 100;
      }
      return z_slider;
    }

    function update_image() {
      img = decode(z);
      draw_image(img, img_x, img_y);
    }

    function redraw_screen() {
      /*p.stroke(1);
      p.rect(0, 0, screen_x-1, screen_y-1, 10);*/

      random_file_button.position(origx+file_button_x, origy+file_button_y);
      random_z_button.position(origx+z_button_x, origy+z_button_y);

      draw_sliders();
      update_image();

      p.textSize(16);
      p.text("Screenshot Image", file_desc_x, file_desc_y);

      p.textSize(16);
      p.text("Z", latent_desc_x, latent_desc_y);

      p.textSize(16);
      p.text("Reconstruction", z_desc_x, z_desc_y);

      loading_file_img = true;

    }

    function random_file_button_event() {
      load_random_image();
      loading_file_img = true;
    }

    function random_z_button_event() {
      z = model.random_normal_vector();
      set_sliders(z);
      draw_sliders();
      update_image();
    }

    function load_latent_json() {
      $.getJSON( settings.data_dir+file_number+".json", function( data ) {
        var i;
        z = new Array(z_size);
        if (data[0].length > 1) { // I'm so stupid i saved data in different format
          // carracing
          mu = dequantize(data[0], 10000);
          sigma = dequantize(data[1], 10000);
        } else {
          // doom
          mu = dequantize(data[0][0], 10000);
          sigma = dequantize(data[1][0], 10000);
        }
        for (i=0;i<z_size;i++) {
          z[i] = randn(mu[i], sigma[i]);
        }
        set_sliders(z);
        update_image();
      });
    }

    function load_random_image() {
      file_number = randi(min_range, max_range);
      file_img = p.loadImage(settings.data_dir+file_number+".png");
      load_latent_json();
      loading_file_img = true;
    }

    function reset_screen() {
      set_screen();
      p.resizeCanvas(screen_x, screen_y);
      redraw_screen();
    }

    p.setup = function() {
      var i;

      WorldController.checkFirstFrameRendered();

      set_screen();

      load_random_image();

      random_file_button = p.createButton('Load Random Screenshot');
      random_file_button.mousePressed(random_file_button_event);
      random_z_button = p.createButton('Randomize Z');
      random_z_button.mousePressed(random_z_button_event);

      canvas = p.createCanvas(screen_x, screen_y);

      for (i=0;i<N;i++) {
        single_slider = p.createSlider(-250, 250, 0 * 100);
        single_slider.input(slider_event);
        slider.push(single_slider);
      }

      z = model.random_normal_vector();
      set_sliders(z);

      redraw_screen()

      p.frameRate(30);
    };

    p.draw = function() {
      if ((p.frameCount) % 30 == 0) {
        redraw_frame = true;
      }
      if (redraw_frame) {
        redraw_frame = false;
        reset_screen();
        redraw_screen();
      }
      if (loading_file_img) {
        file_img.resizeNN(image_size, image_size);
        if (file_img.pixels.length > 1000 && file_img.width > 50) {
          loading_file_img = false;
          p.image(file_img, file_x, file_y);
        }
      }
    }

    p.windowResized = function() {
      reset_screen();
    }

    function pic2img(pic) {
      var img = p.createImage(64, 64);
      img.loadPixels();
      var N = 64;
      var i, j, k = 0;
      var m;
      for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
          m = i*N+j;
          img.pixels[4*m] = pic[k]*255;
          img.pixels[4*m+1] = pic[k+1]*255;
          img.pixels[4*m+2] = pic[k+2]*255;
          img.pixels[4*m+3] = 255;
          k += 3;
        }
      }
      img.updatePixels();
      return img;
    }

    function decode(z) {
      return pic2img(model.vae_decode(z));
    }

    function draw_image(the_img, x, y) {
      the_img.resizeNN(image_size, image_size);
      p.image(the_img, x, y);
    }

    function slider_event() {
      z = get_sliders();
      update_image();
    }

  };
  return vae_sketch;
}
