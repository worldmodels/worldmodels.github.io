var CarRNN = {};

(function(global) {
  "use strict";

  var z_size = 32;
  var rnn_size = 256;
  var num_mixture = 5;

  function dequantize(x, factor) {
    for (var i=x.length-1;i>=0;i--) {
      x[i] /= factor;
    }
    return x;
  }

  var init_mu=[-99,-57,93,-153,76,-3564,299,-6,-48,-11019,125,-2,-31,-154,-180,-6405,-509,19316,785,394,8990,26649,-151,1127,95,1777,-2585,362,-869,-2320,-197,82];
  var init_logvar=[-496,-98,-9351,12,-102,-19143,-329,9,41,-25745,255,105,-33,-21,204,-14394,-47,-37190,335,-150,-29550,-42716,-435,-33322,79,-4782,-13269,-193,-17355,-20592,257,227];

  var agent_bias=[-9,-57,-28];
  var agent_wheel=[-3,-2,16,-5,2,28,-12,-1,-2,8,-16,-15,5,0,-2,-54,4,139,-12,7,-3,-28,-3,-40,7,17,-15,1,0,52,-2,8,44,59,-65,-2,53,-36,4,-55,66,54,-108,52,-12,0,-51,29,-17,-3,71,15,106,-26,-38,-4,15,-112,-22,-77,27,25,28,50,-6,-87,32,3,-36,-36,-32,-21,27,23,-93,51,36,-82,10,16,37,-32,-8,17,35,-7,22,64,21,-7,22,27,3,60,61,-23,43,0,130,35,1,90,31,-20,40,36,63,-25,-24,12,73,-18,0,-7,20,18,31,-19,56,-8,21,-98,9,14,0,-45,47,-2,21,-19,23,-23,9,20,74,61,-66,-92,13,49,46,-22,63,77,20,8,-10,-72,70,-51,34,-14,-41,-58,108,-12,27,-60,23,-55,49,1,-87,2,-26,-38,-143,67,-26,32,-108,-43,39,-63,11,138,120,6,61,57,-2,49,29,-62,1,77,28,37,-4,-47,32,-34,-58,-8,38,2,13,-43,-19,22,39,-14,7,-5,-54,18,36,-57,39,-2,-14,23,-37,36,-36,20,-25,-60,-68,31,17,-55,-39,80,-48,-144,-18,-7,-17,-25,-48,66,2,-49,63,46,-5,34,-35,18,21,6,-62,-11,-85,19,-15,-30,-31,-27,-95,2,59,-37,78,7,-7,-71,66,41,22,0,12,0,-110,77,-15,25,-27,-3,-10,5,-4,-7,-48,-3,-33,23,-61,-18,-13,-56,34,-7,42,-35,62,-27];
  var agent_pedal=[93,-5,82,33,-30,-46,-48,36,31,-29,24,8,28,-32,-20,-23,26,-15,8,-67,-92,-56,11,50,27,-31,36,21,26,49,-23,48,10,66,-81,46,76,0,-25,-25,-37,7,57,-31,-28,0,62,-13,-5,-38,-43,-10,-45,-21,-10,-95,78,25,-55,-11,-15,-35,-54,-24,-26,-77,-29,48,48,-127,2,-10,-68,36,-6,36,-17,-34,-26,17,57,-39,26,-57,53,-70,-20,-9,45,-28,-3,-33,33,-56,-52,-2,35,-46,-6,55,-46,27,-29,-10,-44,-19,25,-24,-57,-8,-51,53,-9,-47,7,-15,78,-29,41,25,11,1,42,-14,-19,15,8,-7,76,-105,26,26,-13,-22,-23,-37,-3,-33,18,21,-2,31,7,-53,6,-4,91,-42,58,-14,-16,1,26,35,-23,-46,79,8,-72,1,67,12,25,6,-16,26,52,-49,-57,-8,25,-28,46,45,-21,-20,45,-14,-8,13,65,-59,-60,5,-9,-11,-11,-8,18,-33,-117,-23,22,1,0,40,-56,-44,-38,24,-4,-35,37,-12,98,57,16,20,-27,31,-88,-34,64,1,-46,67,-80,-46,-66,-32,14,-61,-1,-2,-23,-25,0,-42,23,-16,14,-20,-15,-33,2,23,57,-1,7,89,-18,3,-2,-53,10,-22,-60,-45,36,42,47,10,11,-3,-15,-24,22,-35,49,-20,-19,68,-1,-68,-8,53,14,-22,-37,5,-19,-44,54,12,-4,45,40,-26,-71,8,-35,46,-27,20,5,39,23,8];
  var agent_brake=[-2,24,4,22,-63,16,1,4,-17,-28,-41,10,0,0,-19,-39,-58,-55,-8,-32,46,17,21,-23,-30,4,13,9,-9,-45,-62,18,-8,7,0,21,-8,-18,-32,-3,-14,57,-58,50,16,75,78,-32,-21,-71,-31,-47,40,48,10,-56,-18,-17,24,-6,-25,-10,-93,21,-6,-15,16,9,-9,-14,-26,2,-14,24,-40,-22,-48,92,-47,-141,13,0,22,-38,-10,7,-60,-87,41,26,27,-50,29,-7,-12,-93,-26,-43,-35,-13,-43,-93,-38,51,10,21,49,-4,-30,-2,33,27,50,-4,90,35,29,-45,-27,51,-51,-39,35,-48,43,-26,12,-32,49,16,-47,-44,-10,20,-102,-44,-59,35,73,32,94,23,-18,-19,-18,55,42,84,-5,-14,-46,-18,-13,-55,-26,-34,-31,37,-8,59,-20,69,10,6,-56,15,39,9,-42,-28,-51,-43,-2,23,-78,6,23,76,36,58,23,13,-28,16,-7,-6,-35,-60,-35,37,-25,43,-9,79,41,-35,70,31,6,-23,-14,20,-38,-10,-32,17,-115,54,50,-1,28,-28,40,61,-98,-19,1,-26,44,25,30,9,-18,12,0,-8,42,-28,27,73,11,-10,17,-59,-39,-12,3,-15,-31,0,-65,53,37,51,74,16,5,47,20,27,-9,-22,14,-42,-62,64,-3,-37,-72,5,13,44,12,-22,-19,2,-6,-18,-25,6,-10,-25,-27,8,-11,-2,-11,0,20,-54,47,2,12,-25,25,4,-65,-34];

  // Random numbers util (from https://github.com/karpathy/recurrentjs)
  var return_v = false;
  var v_val = 0.0;
  function gaussRandom() {
    if(return_v) {
      return_v = false;
      return v_val;
    }
    var u = 2*Math.random()-1;
    var v = 2*Math.random()-1;
    var r = u*u + v*v;
    if(r == 0 || r > 1) return gaussRandom();
    var c = Math.sqrt(-2*Math.log(r)/r);
    v_val = v*c; // cache this
    return_v = true;
    return u*c;
  }
  function randf(a, b) { return Math.random()*(b-a)+a; };
  function randi(a, b) { return Math.floor(Math.random()*(b-a)+a); };
  function randn(mu, std){ return mu+gaussRandom()*std; };
  // from http://www.math.grin.edu/~mooret/courses/math336/bivariate-normal.html
  function birandn(mu1, mu2, std1, std2, rho) {
    var z1 = randn(0, 1);
    var z2 = randn(0, 1);
    var x = Math.sqrt(1-rho*rho)*std1*z1 + rho*std1*z2 + mu1;
    var y = std2*z2 + mu2;
    return [x, y];
  };

  function tanh(z) {
    var y = new Array(z.length);
    for (var i=0;i<z.length;i++) {
      y[i] = Math.tanh(z[i]);
    }
    return y;
  };

  function exp(z) {
    var y = new Array(z.length);
    for (var i=0;i<z.length;i++) {
      y[i] = Math.exp(z[i]);
    }
    return y;
  };

  function sum(z) {
    var y = 0;
    for (var i=0;i<z.length;i++) {
      y += z[i];
    }
    return y;
  };

  function elem_mul(y, z) {
    // element-wise mult
    var x = new Array(z.length);
    for (var i=0;i<z.length;i++) {
      x[i] = y[i] * z[i];
    }
    return x;
  };

  function elem_add(y, z) {
    // vector add
    var x = new Array(z.length);
    for (var i=0;i<z.length;i++) {
      x[i] = y[i] + z[i];
    }
    return x;
  };

  function random_normal_vector() {
    // the same as random_latent_vector. in the future, random_latent_vector may be non-gaussian.
    var z = new Array(z_size);
    for (var i=0;i<z_size;i++) {
      z[i] = gaussRandom();
    }
    return z;
  };

  function init_rnn_state() {
    // the same as random_latent_vector. in the future, random_latent_vector may be non-gaussian.
    var s = new Array(rnn_size);
    for (var i=0;i<rnn_size;i++) {
      s[i] = 0;
    }
    return s;
  };

  function getVAEModelParams(data) {

    var factor = 10000;

    dec_fc_kernel = dl.Array2D.new([z_size, 1024], dequantize(data[0], factor));
    dec_fc_bias = dl.Array1D.new(dequantize(data[1], factor));
    dec_deconv1_kernel = dl.Array4D.new([5, 5, 128, 1024], dequantize(data[2], factor));
    dec_deconv1_bias = dl.Array1D.new(dequantize(data[3], factor));
    dec_deconv2_kernel = dl.Array4D.new([5, 5, 64, 128], dequantize(data[4], factor));
    dec_deconv2_bias = dl.Array1D.new(dequantize(data[5], factor));
    dec_deconv3_kernel = dl.Array4D.new([6, 6, 32, 64], dequantize(data[6], factor));
    dec_deconv3_bias = dl.Array1D.new(dequantize(data[7], factor));
    dec_deconv4_kernel = dl.Array4D.new([6, 6, 3, 32], dequantize(data[8], factor));
    dec_deconv4_bias = dl.Array1D.new(dequantize(data[9], factor));

  }

  function getRNNModelParams(data) {

    var factor = 10000;

    // note, the ordering for car_rnn model weight files in json is different than doom_rnn.
    output_w = dl.Array2D.new([256, 480], dequantize(data[0], factor));
    output_b = dl.Array1D.new(dequantize(data[1], factor));
    lstm_kernel = dl.Array2D.new([291, 1024], dequantize(data[2], factor));
    lstm_bias = dl.Array1D.new(dequantize(data[3], factor));

    lstm_forget_bias = dl.Scalar.new(1.0);

  }

  function vae_decode(z_array) {
    var out = math.scope(function(keep, track) { // keep and track are two methods to help with memory management
      // Because you are constructing an array directly,
      // our automatic memory manager doesn't know about it. You should "track" it.
      // Later versions will fix this problem and do this automatically, we're working on it
      var dec_z;
      if (z_array) {
        dec_z = track(dl.Array1D.new(z_array));
      } else {
        dec_z = track(dl.Array1D.randNormal([z_size]));
      }
      var h = math.add(math.matMul(dec_z.reshape([1, z_size]), dec_fc_kernel), dec_fc_bias);
      h = h.reshape([1, 1, 4*256]);
      h = math.relu(math.add(math.conv2dTranspose(h, dec_deconv1_kernel, [5, 5, 128], 2, "valid"), dec_deconv1_bias));
      h = math.relu(math.add(math.conv2dTranspose(h, dec_deconv2_kernel, [13, 13, 64], 2, "valid"), dec_deconv2_bias));
      h = math.relu(math.add(math.conv2dTranspose(h, dec_deconv3_kernel, [30, 30, 32], 2, "valid"), dec_deconv3_bias));
      h = math.sigmoid(math.add(math.conv2dTranspose(h, dec_deconv4_kernel, [64, 64, 3], 2, "valid"), dec_deconv4_bias));
      return h;
    })
    return out.dataSync();
  }

  // sample from a categorial distribution
  function sample_softmax(z_sample) {
    var x = randf(0, 1);
    var N = z_sample.length;
    var accumulate = 0;
    var i;
    for (i=0;i<N;i++) {
      accumulate += z_sample[i];
      if (accumulate >= x) {
        return i;
      }
    }
    console.log('error sampling pi index');
    return -1;
  };

  function rnn_forward(z, action, c, h, temp) {
    var temperature = 1.0;
    if (temp && temp > 0) {
      temperature = temp;
    }
    var out = math.scope(function(keep, track) { // keep and track are two methods to help with memory management
      // Because you are constructing an array directly,
      // our automatic memory manager doesn't know about it. You should "track" it.
      // Later versions will fix this problem and do this automatically, we're working on it
      var input_vec = z.concat(action);
      var rnn_input = track(dl.Array1D.new(input_vec));
      var rnn_c = track(dl.Array1D.new(c));
      var rnn_h = track(dl.Array1D.new(h));
      var rnn_temp = track(dl.Scalar.new(temperature));
      var rnn_temp_sqrt = track(dl.Scalar.new(Math.sqrt(temperature)));
      var epsilon = track(dl.Array2D.randNormal([z_size, num_mixture]));

      rnn_input = rnn_input.reshape([1, z_size+3]); // 3 actions
      rnn_c = rnn_c.reshape([1, rnn_size]);
      rnn_h = rnn_h.reshape([1, rnn_size]);

      var next_state = math.basicLSTMCell(lstm_forget_bias, lstm_kernel, lstm_bias, rnn_input, rnn_c, rnn_h);

      var output = math.add(math.matMul(next_state[1], output_w), output_b);

      output = output.reshape([-1, num_mixture*3])

      var logmix = math.slice2D(output, [0, 0], [z_size, num_mixture]);
      var logmix_subtract = math.logSumExp(logmix, 1, true);
      logmix = math.subtract(logmix, logmix_subtract);
      logmix = math.arrayDividedByScalar(logmix, rnn_temp)

      var mu = math.slice2D(output, [0, num_mixture], [z_size, num_mixture]);

      var logstd = math.slice2D(output, [0, 2*num_mixture], [z_size, num_mixture]);
      var std = math.exp(logstd);
      std = math.scalarTimesArray(rnn_temp_sqrt, std);

      logmix = logmix.reshape([-1, num_mixture]);
      mu = mu.reshape([-1, num_mixture]);
      std = std.reshape([-1, num_mixture]);

      var p = math.softmax(logmix); // categorical distribution
      var idx = math.multinomial(p, 1); // sampled the index from logmix (seems smoother performance if we can use this).

      var zs = math.add(mu, math.multiply(std, epsilon)) // 5 possible z's

      var next_c = next_state[0].reshape([-1]);
      var next_h = next_state[1].reshape([-1]);
      var next_idx = idx.reshape([-1]);
      var next_p = p.reshape([-1]);
      var next_zs = zs.reshape([-1]);
      var result = math.concat1D(math.concat1D(next_c, next_h), math.concat1D(next_p, next_zs));
      return result;
    })
    var next_c, next_h, zs, k;
    var next_z = new Array(z_size);

    var result = out.dataSync();
    var pos_start = 0;
    var pos_end = rnn_size;
    var next_c = result.slice(pos_start, pos_end);
    pos_start = pos_end;
    pos_end += rnn_size;
    var next_h = result.slice(pos_start, pos_end);

    pos_start = pos_end;
    pos_end += z_size*num_mixture;
    var next_p = result.slice(pos_start, pos_end);
    
    pos_start = pos_end;
    pos_end += z_size*num_mixture;
    var zs = result.slice(pos_start, pos_end);

    var idx = -1;
    var sub_p;

    function normalize(x) {
      var sum = 0;
      var i;
      var N = x.length;
      var y = new Array(N);
      for (i=0; i<N; i++) {
        sum += x[i];
      }
      for (i=0; i<N; i++) {
        y[i] = x[i] / sum;
      }
      return y;
    }

    // var max_z = -100000, min_z = 100000;
    for (var i=0;i<z_size;i++) {

      //idx = next_idx[i];

      // Mac needs this:
      sub_p = next_p.slice(num_mixture*i, num_mixture*(i+1));
      idx = sample_softmax(normalize(sub_p));
      if (idx < 0) {// sampling error (due to bad precision in gpu mode)
        idx = randi(0, num_mixture);
      }
      // end Mac.

      k = num_mixture*i+idx;
      next_z[i] = zs[k]; // + std[k] * epsilon[i];

    }

    return [next_z, next_c, next_h];
  }

  function init_random_z() {
    //return init_mu;
    //return random_normal_vector()
    return elem_add(init_mu, elem_mul(init_std, random_normal_vector()));
  }

  function process_b64data(data, factor) {
    var result = [];
    for (var i=0;i<data.length;i++) {
      var blob = new Float32Array(string_to_array(data[i]));
      for (var j=0;j<blob.length;j++) {
        blob[j] *= factor;
      }
      result.push(blob);
    }
    return result;
  }

  carvae_data = process_b64data(carvae_data, 1);
  carrnn_data = process_b64data(carrnn_data, 1);

  // define model:
  var dec_fc_kernel;
  var dec_fc_bias;
  var dec_deconv1_kernel;
  var dec_deconv1_bias;
  var dec_deconv2_kernel;
  var dec_deconv2_bias;
  var dec_deconv3_kernel;
  var dec_deconv3_bias;
  var dec_deconv4_kernel;
  var dec_deconv4_bias;
  var lstm_kernel;
  var lstm_bias;
  var output_w;
  var output_b;
  var lstm_forget_bias;

  var math = new dl.NDArrayMathGPU();
  //var math = DoomRNN.math;

  // setup init mu, std
  init_mu = dequantize(init_mu, 10000);
  var init_std = exp(dequantize(init_logvar, 20000));
  agent_bias = dequantize(agent_bias, 100);
  agent_wheel = dequantize(agent_wheel, 100);
  agent_pedal = dequantize(agent_pedal, 100);
  agent_brake = dequantize(agent_brake, 100);

  // read params into gpu
  getVAEModelParams(carvae_data);
  getRNNModelParams(carrnn_data);

  function get_action(z, h) {
    var s = new Float32Array(z_size+1*rnn_size);
    s.set(z);
    s.set(h, z_size);
    var action_wheel = Math.tanh(sum(elem_mul(s, agent_wheel)) + agent_bias[0]);
    var action_pedal = Math.tanh(sum(elem_mul(s, agent_pedal)) + agent_bias[1]);
    var action_brake = Math.tanh(sum(elem_mul(s, agent_brake)) + agent_bias[2]);
    action_pedal = (action_pedal+1.0)/2.0;
    action_brake = Math.min(Math.max(action_brake, 0.0), 1.0);
    return [action_wheel, action_pedal, action_brake];
  }

  global.z_size = z_size;
  global.rnn_size = rnn_size;
  global.random_normal_vector = random_normal_vector;
  global.init_rnn_state = init_rnn_state;
  global.init_random_z = init_random_z;
  global.rnn_forward = rnn_forward;
  global.vae_decode = vae_decode;
  global.dequantize = dequantize;
  global.get_action = get_action;
  global.randn = randn;
  global.randi = randi;

  console.log("CarRNN Initialized.");

})(CarRNN);
(function(lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    //window.jsfeat = lib; // in ordinary browser attach library to window
  } else {
    module.exports = lib; // in nodejs
  }
})(CarRNN);