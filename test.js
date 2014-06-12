var test = require('tape').test;
var FBO = require('./');

var gl = require('webgl-context')();
if (!gl)
    throw "WebGL context not supported";

test('testing FBO', function(t) {
    var f = new FBO(gl, {height:256});
    t.ok(f.width > 0 && f.height === 256, 'creates a FrameBuffer > 0x0');

    t.throws(function() {
        var f2 = new FBO(gl, { width: Number.MAX_VALUE })
    }, 'fails on too-large sizes');

    //"render to texture"
    f.begin();
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    var data = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    f.end();

    t.ok(data[0]===255 && data[1]===255 && data[2]===0, 'stored color in FBO');


    t.end();    
});