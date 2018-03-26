/*
===
Carracing-RNN demo using deeplearn.js and p5
===
*/

var carrnn_demo = function(settings) {
  "use strict";
  var slider_mode = settings.slider_mode;
  var square_mode = settings.square_mode;
  var control_mode = settings.control_mode;
  var carrnn_sketch = function( p ) { 
    "use strict";

    var div_name = settings.div_name;

    var key_up = 38;
    var key_down = 40;
    var key_left = 37;
    var key_right = 39;

    /*
    var key_w = 87;
    var key_a = 65;
    var key_s = 83;
    var key_d = 68;
    */

    var key_w = key_up;
    var key_a = key_left;
    var key_s = key_down;
    var key_d = key_right;

    var img;
    var pic;

    var screen_x = 640;
    var screen_y = 480;
    var screen_width = 640;
    var screen_height = 480;
    var temperature = settings.temperature;

    var z_size = CarRNN.z_size;
    var rnn_size = CarRNN.rnn_size;

    var rnn_z, rnn_c, rnn_h, rnn_restart, rnn_action, rnn_next_state;

    var score = 0;

    var human_override;
    var human_action = [0, 0, 0];
    var keyboard_action = [0, 0, 0];
    var keyboard_increase_rate = 0.1;
    var keyboard_decay_rate = 0.9;

    // status of controls
    var cont_x, cont_y;
    var bar_stub, bar_length;

    // dom
    var canvas;
    var temperature_slider;
    var temperature_text_show = false;

    var rect;
    var origx, origy;

    var first_frame = true;

    function pic2img(pic) {
      var i, j;
      var img = p.createImage(64, 64);
      img.loadPixels();
      var N = 64;
      var k = 0;
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

    function draw_image() {
      pic = CarRNN.vae_decode(rnn_z);
      img = pic2img(pic);
      img.resize(screen_x, screen_y);
      //img.resizeNN(screen_x, screen_y);
      p.image(img, 0, 0);
    }

    function restart_game_state() {
      score = 0;
      rnn_z = CarRNN.init_random_z();
      rnn_c = CarRNN.init_rnn_state();
      rnn_h = CarRNN.init_rnn_state();
      rnn_action = CarRNN.get_action(rnn_z, rnn_h);
      human_override = false;
      keyboard_action = [0, 0, 0];
    }

    var temperature_slider_event = function() {
      temperature_text_show = true;
      var val = temperature_slider.value() / 100;
      temperature = val;
    }

    function set_screen() {
      // make dom
      var bodyRect = document.body.getBoundingClientRect()
      rect = window.document.getElementById(div_name).getBoundingClientRect();
      origy = rect.top - bodyRect.top;
      origx = rect.left - bodyRect.left;
      //screen_x = Math.max(window.innerWidth, 320);
      screen_width = Math.max(window.document.getElementById(div_name).parentElement.clientWidth, 320);
      screen_height = Math.max(window.document.getElementById(div_name).parentElement.clientHeight, 320);
      if (square_mode) {
        screen_x = Math.min(screen_width, screen_height);
        screen_y = screen_x;
      } else {
        // rect mode
        var slack = 0;
        if (settings.cover_mode) {
          slack = 0; // set to 70 if bar is on the top
        }
        screen_x = Math.max(window.document.getElementById(div_name).parentElement.clientWidth, 320);
        screen_y = Math.min(window.innerHeight-slack, screen_x);
      }

      cont_x = screen_x*0.01;
      cont_y = screen_y*0.94;
      bar_stub = screen_y*0.01;
      bar_length = screen_y*0.05;

    }

    function draw_controls() {
      var brake = rnn_action[2];
      var pedal = rnn_action[1];
      var wheel = rnn_action[0];
      if (human_override) {
        p.fill('#A93226');
      } else {
        p.fill(128); // '#F39C12'
      }
      // brake
      p.noStroke();
      //p.fill('#DC143C');
      p.rect(cont_x+bar_length-bar_stub/2, cont_y-bar_stub*0, bar_stub, brake*bar_length);
      // pedal
      //p.fill('#4876FF');
      p.rect(cont_x+bar_length-bar_stub/2, cont_y-bar_stub*0, bar_stub, -pedal*bar_length);
      // wheel
      //p.fill(0);
      p.rect(cont_x+bar_length, cont_y-bar_stub/2, wheel*bar_length, bar_stub);
    }

    p.setup = function() {

      WorldController.checkFirstFrameRendered();

      set_screen();

      // game stuff
      restart_game_state();

      canvas = p.createCanvas(screen_x, screen_y);

      // dom
      if (slider_mode) {
        temperature_slider = p.createSlider(25, 125, temperature*100);
        temperature_slider.input(temperature_slider_event)
      }

      reset_screen();

      draw_image();

      p.frameRate(30);

      p.noStroke();
      p.fill(0);

    }

    function reset_screen() {
      set_screen();
      p.resizeCanvas(screen_x, screen_y);
      //canvas.position(origx, origy);
      if (slider_mode) {
        temperature_slider.position(screen_x*3/4+origx, origy+screen_y-20);
        temperature_slider.style('width', screen_x*1/4-10+'px');
      }
    }

    p.windowResized = function() {
      reset_screen();
    }

    function update_descriptions() {
      p.textSize(15);
      p.fill(128);
      if (!settings.cover_mode) {
        p.text(score+1, 8, 20);
      }
      if (temperature_text_show) {
        p.text("𝜏 = "+temperature, screen_x*3/4+4, screen_y-25);
      }
    }

    function active_screen() {
      var result = false;
      var app_top = origy;
      var app_bottom = origy+screen_y;
      if ((app_top >= scroll_top) && (app_top <= (scroll_top+screen_height))) {
        result = true;
      }
      if ((app_bottom >= scroll_top) && (app_bottom <= (scroll_top+screen_height))) {
        result = true;
      }
      return result;
    }

    p.draw = function() {
      if (slider_mode) {
        if ((p.frameCount) % 30 == 0) {
          first_frame = true;
        }
      }
      if (first_frame) {
        first_frame = false;
        reset_screen();
      }
      if (active_screen()) {
        game_loop();
      }
    }

    function game_loop() {

      var i;
      human_override = false;

      if (p.mouseIsPressed && (p.mouseX<=screen_x) && (p.mouseX>=0) && (p.mouseY<=screen_y-20) && (p.mouseY>=0)) {
        var wheel = Math.tanh(2*(p.mouseX-screen_x/2)/(screen_x/2));
        var intent = Math.tanh(-2*(p.mouseY-screen_y/2)/(screen_y/2));
        human_action[0] = wheel;
        human_action[1] = 0;
        human_action[2] = 0;
        if (intent > 0) {
          human_action[1] = intent;
        } else {
          human_action[2] = -1*intent;
        }
        human_override = true;
      }
      if (contKeyMap[key_w] == true || contKeyMap[key_a] == true || contKeyMap[key_s] == true || contKeyMap[key_d] == true) {
        human_override = true;
        if (contKeyMap[key_w] == true) {
          keyboard_action[1] += keyboard_increase_rate;
          keyboard_action[1] = Math.min(1.0, keyboard_action[1])
          keyboard_action[2] = 0;
        }
        if (contKeyMap[key_s] == true) {
          keyboard_action[2] += keyboard_increase_rate;
          keyboard_action[2] = Math.min(1.0, keyboard_action[2])
          keyboard_action[1] = 0;
        }
        if ((contKeyMap[key_a] == true) && (contKeyMap[key_d] == false)) {
          keyboard_action[0] -= keyboard_increase_rate;
          keyboard_action[0] = Math.max(-1.0, keyboard_action[0])
        }
        if ((contKeyMap[key_a] == false) && (contKeyMap[key_d] == true)) {
          keyboard_action[0] += keyboard_increase_rate;
          keyboard_action[0] = Math.min(1.0, keyboard_action[0])
        }
        for (i=0;i<3;i++) {
          human_action[i] = keyboard_action[i];
        }
      }

      if (human_override) {
        rnn_action = human_action;
      }

      rnn_action

      score += 1

      rnn_next_state = CarRNN.rnn_forward(rnn_z, rnn_action, rnn_c, rnn_h, temperature);

      rnn_z = rnn_next_state[0];
      rnn_c = rnn_next_state[1];
      rnn_h = rnn_next_state[2];

      // update screen
      draw_image();

      // update text
      update_descriptions();

      if (human_override) {
        //show something that shows human is overriding.
      }

      // draw_controls
      if (control_mode) {
        draw_controls();
      }

      // decay keyboard
      for (i=0;i<3;i++) {
        keyboard_action[i] *= keyboard_decay_rate;
      }

      if (score > 1000) {
        restart_game_state();
      } else {
        rnn_action = CarRNN.get_action(rnn_z, rnn_h);
      }
    }
  };
  return carrnn_sketch;
}
