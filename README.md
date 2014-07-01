# kami-fbo

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

A 2D render-texture (frame buffer object) for use with [kami](http://github.com/mattdesl/kami).

## Usage

[![NPM](https://nodei.co/npm/kami-fbo.png)](https://nodei.co/npm/kami-fbo/)

```js
var fbo = require('kami-fbo')(gl, {
	width: 256,
	height: 256,
	format: gl.RGB
});

//binds the frame buffer for your render-to-texture ops
//this also sets the viewport to the FBO size
fbo.begin();

// ... draw to it ...

//unbinds the framebuffer (binds null fbo)
//this resets the viewport to the context size
fbo.end();
```
Options:
- `width` the width of the texture, must be >= 1
- `height` the height of the texture, must be >= 1
- `format` the format of the texture, default gl.RGBA
- `texture` optional; a [kami-texture](http://github.com/mattdesl/kami-texture) to use instead of creating a new one

### Gotchas

Calling `end()` resets the viewport to the context size, by querying the width and height of the passed `gl` context. If you've passed a simple WebGLRenderingContext, it will use the canvas width and height. This may cause problems if your canvas width and height is scaled for retina displays.

If you passed a `kami-context`, the `width` and `height` of the context do not represent the retina-scaled sizes, so it should be all good.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/kami-fbo/blob/master/LICENSE.md) for details.
