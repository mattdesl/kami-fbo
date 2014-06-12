var Class = require('klasse');
var Texture = require('kami-texture');
var wrapContext = require('kami-util').wrapContext;

var FrameBuffer = new Class({

	/**
	 * Creates a new Frame Buffer Object with the given width and height.
	 *
	 * It's advised to use FrameBuffer.getMaxSize(gl) as a utility to ensure
	 * your texture is under the hardware limits. If it exceeds this size in
	 * either dimension, this constructor will throw an error.
	 *
	 * If `texture` is provided to the options, we will use that as the 
	 * color buffer texture and grab its width/height.
	 * 
	 * @class  FrameBuffer
	 * @param {WebGLRenderingContext|kami-context} context the gl/kami context
	 * @param {Number} options.width the width of the texture, must be >= 1
	 * @param {Number} options.height the height of the texture, must be >= 1
	 * @param {kami-texture} options.texture optional texture
	 * @constructor
	 */
	initialize: function FrameBuffer(context, options) { //TODO: depth component
		if (!(this instanceof FrameBuffer))
			return new FrameBuffer(context, options);
		if (!context || typeof context !== "object")
			throw "valid GL context not specified to FrameBuffer";
		options = options||{};

		/**
		 * The underlying ID of the GL frame buffer object.
		 *
		 * @property {WebGLFramebuffer} id
		 */		
		this.id = null;

		/**
		 * The WebGLContext backed by this frame buffer.
		 *
		 * @property {WebGLContext} context
		 */
		this.context = wrapContext(context);

		//If a texture is passed, use that instead of creating a new one...
		if (options.texture) {
			options.width = options.texture.width;
			options.height = options.texture.height;	
		}

		if (typeof options.width !== "number" || typeof options.height !== "number")
			throw new Error("must specify width and height to frame buffer");

		var width = Math.max(1, options.width||0);
		var height = Math.max(1, options.height||0);
		var maxSize = FrameBuffer.getMaxSize(this.context.gl);
		if (width > maxSize || height > maxSize) {
			throw new Error("FrameBuffer is above available renderbuffer size ("+maxSize+")");
		}

		/**
		 * The Texture backed by this frame buffer.
		 *
		 * @property {Texture} Texture
		 */
		//this Texture is now managed.
		this.texture = options.texture || new Texture(context, {
			width: width,
			height: height,
			format: options.format
		});

		//This is maanged by WebGLContext
		this.context.addManagedObject(this);
		this.create();
	},

	/**
	 * A read-only property which returns the width of the backing texture. 
	 * 
	 * @readOnly
	 * @property width
	 * @type {Number}
	 */
	width: {
		get: function() {
			return this.texture.width;
		}
	},

	/**
	 * A read-only property which returns the height of the backing texture. 
	 * 
	 * @readOnly
	 * @property height
	 * @type {Number}
	 */
	height: {
		get: function() {
			return this.texture.height;
		}
	},


	/**
	 * Called during initialization to setup the frame buffer; also called on
	 * context restore. Users will not need to call this directly.
	 * 
	 * @method create
	 */
	create: function() {
		this.gl = this.context.gl; 
		var gl = this.gl;

		var tex = this.texture;

		//we assume the texture has already had create() called on it
		//since it was added as a managed object prior to this FrameBuffer
		tex.bind();
 
		this.id = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex.target, tex.id, 0);

		var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (result != gl.FRAMEBUFFER_COMPLETE) {
			this.destroy(); //destroy our resources before leaving this function..

			var err = "Framebuffer not complete";
			switch (result) {
				case gl.FRAMEBUFFER_UNSUPPORTED:
					throw new Error(err + ": unsupported");
				case gl.INCOMPLETE_DIMENSIONS:
					throw new Error(err + ": incomplete dimensions");
				case gl.INCOMPLETE_ATTACHMENT:
					throw new Error(err + ": incomplete attachment");
				case gl.INCOMPLETE_MISSING_ATTACHMENT:
					throw new Error(err + ": missing attachment");
				default:
					throw new Error(err);
			}
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	},


	/**
	 * Destroys this frame buffer. Using this object after destroying it will have
	 * undefined results. 
	 * @method destroy
	 */
	destroy: function() {
		var gl = this.gl;

		if (this.texture)
			this.texture.destroy();
		if (this.id && this.gl)
			this.gl.deleteFramebuffer(this.id);
		if (this.context)
			this.context.removeManagedObject(this);

		this.id = null;
		this.gl = null;
		this.texture = null;
		this.context = null;
	},

	/**
	 * Binds this framebuffer and sets the viewport to the expected size.
	 * @method begin
	 */
	begin: function() {
		var gl = this.gl;
		gl.viewport(0, 0, this.texture.width, this.texture.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
	},

	/**
	 * Binds the default frame buffer (the screen) and sets the viewport back
	 * to the size of the WebGLContext.
	 * 
	 * @method end
	 */
	end: function() {
		var gl = this.gl;
		gl.viewport(0, 0, this.context.width, this.context.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
});

FrameBuffer.getMaxSize = function(gl) {
	if (!gl)
		throw "no gl specified to FrameBuffer.getMaxSize";
	return gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
};

module.exports = FrameBuffer;