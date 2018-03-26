// start all p5 demos.

// car

var carrnn_demo_mode = false;
var car_demo_settings = {
  div_name: 'carrnn_sketch',
  temperature: 0.75,
  slider_mode: true,
  square_mode: true,
  control_mode: true,
  cover_mode: false,
};

var custom_carrnn_sketch_01_p5;
if (carrnn_demo_mode) {
  var custom_carrnn_sketch_demo_p5;
  custom_carrnn_sketch_demo_p5 = new p5(carrnn_demo(car_demo_settings), car_demo_settings.div_name);
}

// doom

var doom01 = {
  div_name: 'cover_sketch',
  temperature: 1.4,
  agent_brain: doombrain_r130,
  slider_mode: false,
  square_mode: false,
  cover_mode: true,
};

var doomrnn_camera_mode = true;

var custom_cover_sketch;
var custom_carrnn_sketch_demo_p5;

var car_cover_settings = {
  div_name: 'cover_sketch',
  temperature: 0.25,
  slider_mode: false,
  square_mode: false,
  control_mode: true,
  cover_mode: true,
};

var car_settings = {
  div_name: 'carrnn_sketch',
  temperature: 0.25,
  slider_mode: true,
  square_mode: true,
  control_mode: true,
  cover_mode: false,
};

if (doomrnn_camera_mode) {
  if (DoomRNN.randi(0, 2) == 0) {
    custom_cover_sketch = new p5(carrnn_demo(car_cover_settings), car_cover_settings.div_name);
  } else {
    $('#cover_overlay').css('opacity', '0.1');
    custom_cover_sketch = new p5(doommrnn_demo(doom01), doom01.div_name);
  }

  // normal car thing:
  custom_carrnn_sketch_demo_p5 = new p5(carrnn_demo(car_settings), car_settings.div_name);
}

var doom02 = {
  div_name: 'doomrnn_sketch',
  temperature: 1.4,
  agent_brain: doombrain_t115,
  slider_mode: true,
  square_mode: true,
  cover_mode: false,
};

var custom_doomrnn_sketch_02_p5;
custom_doomrnn_sketch_02_p5 = new p5(doommrnn_demo(doom02), doom02.div_name);

// for the section on exploiting world model

var doom03 = {
  div_name: 'doomrnn_cheating_sketch',
  temperature: 0.5,
  temperature_slider_max: 100,
  agent_brain: doombrain_r130,
  slider_mode: true,
  square_mode: true,
  cover_mode: false,
};

var custom_doomrnn_sketch_03_p5;
custom_doomrnn_sketch_03_p5 = new p5(doommrnn_demo(doom03), doom03.div_name);

// vae

var camera_mode = true;
var the_data_dir = 'doomdata/';
var the_car_data_dir = 'cardata/';
if (camera_mode) {
  the_data_dir = 'demo/doomdata/'
  the_car_data_dir = 'demo/cardata/';
}
var interesting_doom = [0, 2, 4, 7, 9, 13, 15, 22, 24, 25, 27, 33, 52, 55, 59];
var interesting_car = [2, 5, 6, 9, 10, 15, 17, 18, 20, 21, 23, 25, 26, 28, 29];
/*
var interesting02 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var interesting03 = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
var interesting04 = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
*/
var vae01 = {
  model: DoomRNN,
  data_dir: the_data_dir,
  div_name: 'doomvae_sketch',
  min_range: 1,
  max_range: 1399,
  interesting: interesting_doom,
};

var custom_vae01_sketch_p5 = new p5(vae_demo(vae01), vae01.div_name);

var vae02;
var custom_vae02_sketch_p5;
if (camera_mode) {
    vae02 = {
    model: CarRNN,
    data_dir: the_car_data_dir,
    div_name: 'carvae_sketch',
    min_range: 1,
    max_range: 984,
    interesting: interesting_car,
  };
  custom_vae02_sketch_p5 = new p5(vae_demo(vae02), vae02.div_name);
}
