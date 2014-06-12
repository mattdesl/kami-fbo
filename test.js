var test = require('tape').test;
var FBO = require('./');

var gl = require('webgl-context')();
if (!gl)
    throw "WebGL context not supported";

test('making FBO with texture', function(t) {
    var tex = require('kami-white-texture')(gl);
    var f = new FBO(gl, {
        texture: tex
    });

    t.ok(f.width === 1 && f.height === 1, 'creates a FrameBuffer with texture');

    f.begin();

    var data = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    f.end();

    t.ok(data[0]===255 && data[1]===255 && data[2]===255, 'readPixels from texture via FBO works');
    t.end();
})

test('making FBO without texture', function(t) {
    var f = new FBO(gl, {width: 1, height:256});
    t.ok(f.width === 1 && f.height === 256, 'creates a FrameBuffer with size');

    t.throws(function() {
        var f2 = new FBO(gl, { width: Number.MAX_VALUE , height: Number.MAX_VALUE })
    }, 'fails on too-large sizes');

    //"render to texture"
    f.begin();
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var data = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    f.end();

    t.ok(data[0]===255 && data[1]===255 && data[2]===0, 'render-to-texture works');
    t.end();    
});