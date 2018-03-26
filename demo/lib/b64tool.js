/**
 * deals with decompressing b64 models to float arrays.
 */
function string_to_uint8array(b64encoded) {
  var u8 = new Uint8Array(atob(b64encoded).split("").map(function(c) {
    return c.charCodeAt(0); }));
  return u8;
}
function uintarray_to_string(u8) {
  var s = "";
  for (var i = 0, len = u8.length; i < len; i++) {
    s += String.fromCharCode(u8[i]);
  }
  var b64encoded = btoa(s);
  return b64encoded;
};
function string_to_array(s) {
  var u = string_to_uint8array(s);
  var result = new Int16Array(u.buffer);
  return result;
};
function array_to_string(a) {
  var u = new Uint8Array(a.buffer);
  var result = uintarray_to_string(u);
  return result;
};
