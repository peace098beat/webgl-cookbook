var canvas;
var gl;

var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var lastCubeUpdateTime = 0;

var cubeImage;
var cubeTexture;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var perspectiveMatrix;


//
// start
//
function start() {
	canvas = document.getElementById("glcanvas");

	initWebGL(canvas); // Initialize the GL context

	// Only continue if WebGL is available and working

	if (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
		gl.clearDepth(1.0); // Clear everything
		gl.enable(gl.DEPTH_TEST); // Enable depth testing
		gl.depthFunc(gl.LEQUAL); // Near things obscure far things

		// Initialize the shaders; this is where all the lighting for the
		// vertices and so forth is established.

		initShaders();

		// Here's where we call the routine that builds all the objects
		// we'll be drawing.

		initBuffers();

		// Next, load and set up the textures we'll be using.

		initTextures();

		// Set up to draw the scene periodically.

		setInterval(drawScene, 15);
	}
}


//
// initWebGL
//
function initWebGL() {
	gl = null;

	try {
		gl = canvas.getContext("experimental-webgl");
	} catch (e) {}

	// If we don't have a GL context, give up now

	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
}

//
// initShaders
//
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	// Create the shader program

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader));
	}

	gl.useProgram(shaderProgram);

	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);

	textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(textureCoordAttribute);

}
// getShader (sub)
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	// Didn't find an element with the specified ID; abort.

	if (!shaderScript) {
		return null;
	}

	// Walk through the source element's children, building the
	// shader source string.

	var theSource = "";
	var currentChild = shaderScript.firstChild;

	while (currentChild) {
		if (currentChild.nodeType == 3) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	// Now figure out what type of shader script we have,
	// based on its MIME type.

	var shader;

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null; // Unknown shader type
	}

	// Send the source to the shader object

	gl.shaderSource(shader, theSource);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

//
// initBuffers
//
function initBuffers() {

	cubeVerticesBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);

	var vertices = [
		// 前面
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

		// 背面
		-1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// 上面
		-1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// 底面
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

		// 右側面
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// 左側面
		-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
	];


	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);



	// Now set up the colors for the vertices.

	cubeVerticesTextureCoordBuffer = gl.createBuffer();
	// init
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);

	var textureCoordinates = [
		// Front
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Top
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Bottom
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Right
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Left
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);


	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	// Create a buffer for the square's vertices.

	cubeVerticesIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

	var cubeVertexIndices = [
		// 前面
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7, // 背面
		8, 9, 10, 8, 10, 11, // 上面
		12, 13, 14, 12, 14, 15, // 底面
		16, 17, 18, 16, 18, 19, // 右側面
		20, 21, 22, 20, 22, 23 // 左側面
	];

	// エレメントの配列をGLに渡す
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}



// 
// initTextures
// 

function initTextures() {
	cubeTexture = gl.createTexture();
	cubeImage = new Image();
	cubeImage.onload = function() {
		handleTextureLoaded(cubeImage, cubeTexture);
	}
	cubeImage.src = "resource/cubetexture.png";
}
// handleTextureLoaded (sub)
function handleTextureLoaded(image, texture) {
	console.log("handleTextureLoaded, image = " + image);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

//
// drawScene
//
function drawScene() {
	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// gl.viewport(0,0,canvas.width, canvas.height);

	// Establish the perspective with which we want to view the
	// scene. Our field of view is 45 degrees, with a width/height
	// ratio of 640:480, and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	perspectiveMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.

	loadIdentity();

	// Now move the drawing position a bit to where we want to start
	// drawing the square.

	mvTranslate([-0.0, 0.0, -6.0]);

	// Save the current matrix, then rotate before we draw.

	mvPushMatrix();

	mvRotate(cubeRotation, [1, 0, 1]);

	// Draw the square by binding the array buffer to the square's vertices
	// array, setting attributes, and pushing it to GL.

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer); // update
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	// Set the texture coordinate attribute for the vertices.

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
	gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	// Specify the texture to map onto the faces.

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

	// Draw the cube

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

	// Restore the oriinal matrix

	mvPopMatrix();

	// Update the ratation for the next draw, if it's tie to do so.

	var currentTime = (new Date).getTime();
	if (lastCubeUpdateTime) {
		var delta = currentTime - lastCubeUpdateTime;

		cubeRotation += (30 * delta) / 1000.0;

	}
	lastCubeUpdateTime = currentTime;

}



// ********************************************** //
//
// Matrix utility functions
//
// ********************************************** //
var mvMatrix;

function loadIdentity() {
	mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
	mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
	if (m) {
		mvMatrixStack.push(m.dup());
		mvMatrix = m.dup();
	} else {
		mvMatrixStack.push(mvMatrix.dup());
	}
}

function mvPopMatrix() {
	if (!mvMatrixStack.length) {
		throw ("空の行列スタックからポップすることはできません。");
	}

	mvMatrix = mvMatrixStack.pop();
	return mvMatrix;
}

function mvRotate(angle, v) {
	var inRadians = angle * Math.PI / 180.0;

	var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}