// PointLightedCube.js (c) 2012 matsuda
      // Vertex shader program
      var VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Color;\n' +
        'attribute vec4 a_Normal;\n' +
        'uniform mat4 u_MvpMatrix;\n' +
        'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
        'uniform mat4 u_NormalMatrix;\n' +   // Coordinate transformation matrix of the normal
        'uniform vec3 u_LightColor;\n' +     // Light color
        'uniform vec3 u_LightPosition;\n' +  // Position of the light source
        'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
        'attribute vec2 a_TexCoord;\n' +
        'varying vec2 v_TexCoord;\n' +
        'varying vec4 v_Color;\n' +
        'void main() {\n' +
        '  gl_Position = u_MvpMatrix * a_Position;\n' +
          // Recalculate the normal based on the model matrix and make its length 1.
        '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
          // Calculate world coordinate of vertex
        '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
          // Calculate the light direction and make it 1.0 in length
        '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
          // Calculate the dot product of the normal and light direction
        '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
          // Calculate the color due to diffuse reflection
        '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
          // Calculate the color due to ambient reflection
        '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
          // Add the surface colors due to diffuse reflection and ambient reflection
        '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
        '  v_TexCoord = a_TexCoord;\n' +
        '}\n';
  
      // Fragment shader program
      var FSHADER_SOURCE =
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n' +
        'uniform sampler2D u_Sampler;\n' +
        'varying vec2 v_TexCoord;\n' +
        'varying vec4 v_Color;\n' +      
        'void main() {\n' +
        '  gl_FragColor = v_Color + texture2D(u_Sampler, v_TexCoord) ;\n' +
        '}\n';
  
      var g_near = 0.01;
      var g_far = 2.1;
      var Tx = 0;
      var Ty = 0;
      var Tz = 0;

      var Sx=1;
      var Sy=1;
      var Sz=1;

      var x_axis=1;
      var y_axis=0;
      var z_axis=0;

      var x = document.getElementById('x');
      var y = document.getElementById('y');
      var z = document.getElementById('z');

      var x_scale = document.getElementById('x_scale');
      var y_scale = document.getElementById('y_scale');
      var z_scale = document.getElementById('z_scale');
     
  
      var textNear = document.getElementById('textNear')
      var textFar = document.getElementById('textFar');
  
      function main() {
        // Retrieve <canvas> element
        var canvas = document.getElementById('webgl');
  
        // Get the rendering context for WebGL
        var gl = getWebGLContext(canvas);
        if (!gl) {
          console.log('Failed to get the rendering context for WebGL');
          return;
        }
  
        // Initialize shaders
        if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
          console.log('Failed to intialize shaders.');
          return;
        }
  
        // Set the vertex coordinates, the color and the normal
        var n = initVertexBuffers(gl);
        if (n < 0) {
          console.log('Failed to set the vertex information');
          return;
        }
  
        // Set the clear color and enable the depth test
        gl.clearColor(0.0, 0.0, 0.0, 0.5);
        gl.enable(gl.DEPTH_TEST);
  
        if (!initTextures(gl, n)) {
          console.log('Failed to intialize the texture.');
          return;
        }
  
        // Get the storage locations of uniform variables and so on
        var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
        var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
        var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
        if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
          console.log('Failed to get the storage location');
          return;
        }
  
        var vpMatrix = new Matrix4();   // View projection matrix
        vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
        vpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  
        // Set the light color (white)
        gl.uniform3f(u_LightColor, 1.0, 0.0, 0.0);
        // Set the light direction (in the world coordinate)
        // gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
        // // Set the ambient light
        // gl.uniform3f(u_AmbientLight, 0.0, 0.0, 0.0);
  
        var currentAngle = 0.0;  // Current rotation angle
        var modelMatrix = new Matrix4();  // Model matrix
        var mvpMatrix = new Matrix4();    // Model view projection matrix
        var normalMatrix = new Matrix4(); // Transformation matrix for normals
  
        // Rotate
        var btnRotateX = document.getElementById('btnRotate-x');
        btnRotateX.addEventListener('click', ()=>{
          rotate_X_AxisFunction();
        });

        var btnRotateY = document.getElementById('btnRotate-y');
        btnRotateY.addEventListener('click', ()=>{
          rotate_Y_AxisFunction();
        });

        var btnRotateZ = document.getElementById('btnRotate-z');
        btnRotateZ.addEventListener('click', ()=>{
         
          rotate_Z_AxisFunction();
        });
  
        // Tanslate
        var btnTranslate = document.getElementById('btnTranslate');
        btnTranslate.addEventListener('click', ()=>{
          translateFunction();
        });
        //Scale
        var btnScale=document.getElementById("btnScale");
        btnScale.addEventListener('click', ()=>{
          scaleFunction();
        });


        // Near-far
        document.getElementById('btnIncreaseNear')
          .addEventListener('click', ()=>{
            increaseNearFunction();
          });
        document.getElementById('btnDecreaseNear')
        .addEventListener('click', ()=>{
          decreaseNearFunction();
        });
        document.getElementById('btnIncreaseFar')
          .addEventListener('click', ()=>{
            increaseFarFunction();
          });
        document.getElementById('btnDecreaseFar')
        .addEventListener('click', ()=>{
          decreaseFarFunction();
        });
        // Light
        var checkLight = document.getElementById('checkLight')
        checkLight.addEventListener('click', (e)=> {
          if(checkLight.checked) {
            gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
            gl.uniform3f(u_AmbientLight, 0., 0., 0.);
            
          } else {
            gl.uniform3f(u_LightPosition, 0, 0, 0);
            gl.uniform3f(u_AmbientLight, 0.0, 0.0, 0.0);
          }     
        });
  
        var tick = function() {
         
          currentAngle = animate(currentAngle);  // Update the rotation angle
  
          // Calculate the model matrix
          modelMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
          modelMatrix.rotate(currentAngle, x_axis, y_axis, z_axis); // Rotate around the y-axis
          modelMatrix.translate(Tx,Ty,Tz);
          modelMatrix.scale(Sx,Sy,Sz);

          
          // Pass the model matrix to u_ModelMatrix
          gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
          // Pass the model view projection matrix to u_MvpMatrix
          mvpMatrix.set(vpMatrix).multiply(modelMatrix);
          
          gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  
          // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
          normalMatrix.setInverseOf(modelMatrix);
          normalMatrix.transpose();
          gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
          // Clear color and depth buffer
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
          textNear.innerHTML = Math.round(g_near * 100)/100;
          textFar.innerHTML = Math.round(g_far * 100)/100;
  
          // Draw the cube
          gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  
          requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
        };
        tick();
      }
  
      function initVertexBuffers(gl) {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        // Coordinates
        var vertices = new Float32Array([
          2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
          2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
          2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
          -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
          -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
          2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
        ]);
  
        // Colors
        var colors = new Float32Array([
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v1-v1-v3 front
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v3-v4-v5 right
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v5-v6-v1 u1
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v1-v7-v2 left
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
          1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
      ]);
  
        // Normal
        var normals = new Float32Array([
          0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
          1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
          0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
          -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
          0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
          0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
        ]);
  
        // Indices of the vertices
        var indices = new Uint8Array([
          0, 1, 2,   0, 2, 3,    // front
          4, 5, 6,   4, 6, 7,    // right
          8, 9,10,   8,10,11,    // up
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // down
          20,21,22,  20,22,23     // back
        ]);
  
        var texCoords = new Float32Array([   // Texture coordinates
            1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
            0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
            1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
            1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
            0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
            0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
        ]);
  
        // Write the vertex property to buffers (coordinates, colors and normals)
        if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
        if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
        if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
        if (!initArrayBuffer(gl, 'a_TexCoord',texCoords, 2, gl.FLOAT )) return -1;// Texture coordinates
  
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
        // Write the indices to the buffer object
        var indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
          console.log('Failed to create the buffer object');
          return false;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
        return indices.length;
      }
  
      function initArrayBuffer(gl, attribute, data, num, type) {
        // Create a buffer object
        var buffer = gl.createBuffer();
        if (!buffer) {
          console.log('Failed to create the buffer object');
          return false;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        // Assign the buffer object to the attribute variable
        var a_attribute = gl.getAttribLocation(gl.program, attribute);
        if (a_attribute < 0) {
          console.log('Failed to get the storage location of ' + attribute);
          return false;
        }
        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);
  
        return true;
      }
  
      function initTextures(gl, n) {
        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
          console.log('Failed to create the texture object');
          return false;
        }
  
        // Get the storage location of u_Sampler
        var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
        if (!u_Sampler) {
          console.log('Failed to get the storage location of u_Sampler');
          return false;
        }
        var image = new Image();  // Create the image object
        if (!image) {
          console.log('Failed to create the image object');
          return false;
        }
        // Register the event handler to be called on loading an image
        image.onload = function(){ loadTexture(gl, n, texture, u_Sampler, image); };
        // Tell the browser to load an image
        image.src = 'images/chelsea1.png';
  
        return true;
      }
  
      function loadTexture(gl, n, texture, u_Sampler, image) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, texture);
  
        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        
        // Set the texture unit 0 to the sampler
        gl.uniform1i(u_Sampler, 0);
        
        gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); // Draw the rectangle
      }
  
      // Rotation angle (degrees/second)
      var ANGLE_STEP = 0.0;
      // Last time that this function was called
      var g_last = Date.now();
      function animate(angle) {
        // Calculate the elapsed time
        var now = Date.now();
        var elapsed = now - g_last;
        g_last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
        return newAngle %= 360;
      }
  
      function rotate_X_AxisFunction(){
      
        x_axis==1 ? handleAngle() : ANGLE_STEP =30
        x_axis=1;
        y_axis=0;
        z_axis=0;
      }
      function rotate_Y_AxisFunction(){
        
        // handleAngle()
        y_axis==1 ? handleAngle() : ANGLE_STEP =30
        x_axis=0;
        y_axis=1;
        z_axis=0;

       
      }
      function rotate_Z_AxisFunction(){
       
        z_axis==1 ? handleAngle() : ANGLE_STEP =30
        x_axis=0;
        y_axis=0;
        z_axis=1;
      }
      function handleAngle(){
        if(ANGLE_STEP == 30.0){
          ANGLE_STEP = 0.0;
        }else {
          ANGLE_STEP = 30.0;
        }
      }
      
      function translateFunction() {
        Tx = x.value;
        Ty = y.value;
        Tz = z.value;
      }
      
      function increaseNearFunction() {
        g_near += 0.02;
      }
      function decreaseNearFunction() {
        g_near -= 0.02;
      }
      function increaseFarFunction() {
        g_far += 0.1;
      } 
      function decreaseFarFunction() {
        g_far -= 0.1;
      }

      function scaleFunction(){
        Sx=x_scale.value.length ==0 ? 1:x_scale.value;
        Sy=y_scale.value.length ==0 ? 1:y_scale.value;
        Sz=z_scale.value.length ==0 ? 1:z_scale.value;
      }