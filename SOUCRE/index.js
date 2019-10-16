// // VS
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'attribute vec4 a_Normal;\n' +
'attribute vec2 a_Texture;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'uniform mat4 u_ModelMatrix;\n' +
'uniform mat4 u_NormalMatrix;\n' +
'varying vec4 v_Color;\n' +
'varying vec3 v_Normal;\n' +
'varying vec3 v_Position;\n' +
'varying vec2 v_Texture;\n'+
'void main() {\n' +
    'gl_Position = u_MvpMatrix * a_Position;\n' +
    'v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    'v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    'v_Color = a_Color;\n' + 
    'v_Texture = a_Texture;\n' + 
'}\n';

// FS
var FSHADER_SOURCE = 
'precision mediump float;\n' +
'uniform vec3 u_LightColor;\n' +
'uniform vec3 u_LightPosition;\n' +
'uniform vec3 u_AmbientLight;\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec3 v_Normal;\n' +
'varying vec3 v_Position;\n' +
'varying vec4 v_Color;\n' +
'varying vec2 v_Texture;\n' +
'uniform int u_Type;\n' +
'void main() {\n' +
    'vec3 normal = normalize(v_Normal);\n' +
    'vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    'float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    'vec4 FragColor = v_Color;\n' +
    'if(u_Type == 2)FragColor = texture2D(u_Sampler, v_Texture);\n' +
    'else if(u_Type == 3)FragColor = v_Color + texture2D(u_Sampler, v_Texture);\n' +
    'vec3 diffuse = u_LightColor * FragColor.rgb * nDotL;\n' +
    'vec3 ambient = u_AmbientLight * FragColor.rgb;\n' +    
    'gl_FragColor = vec4(diffuse + ambient, FragColor.a);\n' +
'}\n';

    var g_near = 5;
    var g_far = 25;
    var Tx = 0;
    var Ty = 0;
    var Tz = 0;
    var tick;
    var Sx=1;
    var Sy=1;
    var Sz=1;

    var u_Type;

    var x_axis=1;
    var y_axis=0;
    var z_axis=0;
    var gl;
    var canvas;
    var x = document.getElementById('x');
    var y = document.getElementById('y');
    var z = document.getElementById('z');

    var x_scale = document.getElementById('x_scale');
    var y_scale = document.getElementById('y_scale');
    var z_scale = document.getElementById('z_scale');
   

    var textNear = document.getElementById('textNear')
    var textFar = document.getElementById('textFar');

    var x_rote=document.getElementById('x_rotate');
    var y_rote=document.getElementById('y_rotate');
    var z_rote=document.getElementById('z_rotate');

    var inputAngleStep=document.getElementById('Angle');

    var isAutoRotate = false;
    var projMatrix = new Matrix4();
    var typeProjection="Perspective";
  
    function main() {
      // Retrieve <canvas> element
      canvas = document.getElementById('webgl');

      // Get the rendering context for WebGL
       gl = getWebGLContext(canvas);
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
      u_Type = gl.getUniformLocation(gl.program, 'u_Type');
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

      gl.uniform1i(u_Type, 1);
      var viewMatrix = new Matrix4();   // View projection matrix
      viewMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);

      // Set the light color (white)
      gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

      // khai báo vị trí nguồn sáng
      gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
      gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

      var currentAngle = 0.0;  // Current rotation angle
      var modelMatrix = new Matrix4();  // Model matrix
      var mvpMatrix = new Matrix4();    // Model view projection matrix
      var normalMatrix = new Matrix4(); // Transformation matrix for normals

      // Rotate
      var btnRotateX = document.getElementById('btnRotate');
      btnRotateX.addEventListener('click', ()=>{
        rotate_X_AxisFunction();
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

       tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle
        typeProjection == "Ortho" 
        ? projMatrix.setOrtho(-4.0, 4.0, -4.0, 4.0, g_near, g_far) 
        : projMatrix.setPerspective(30, canvas.width/canvas.height, g_near, g_far); 

        modelMatrix.setRotate(currentAngle, x_axis, y_axis, z_axis); // Rotate around the y-axis
        modelMatrix.translate(Tx,Ty,Tz);
        modelMatrix.scale(Sx,Sy,Sz);

        x_axis=x_rote.value;
        y_axis=y_rote.value;
        z_axis=z_rote.value;

        // Pass the model matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Pass the model view projection matrix to u_MvpMatrix
        mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
        
        // truyền giá trị vào u_MvpMatrix
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

      var texTure = new Float32Array([   // Texture coordinates
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
      if (!initArrayBuffer(gl, 'a_Texture',texTure, 2, gl.FLOAT )) return -1;// Texture coordinates

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

    // khởi tạo texture
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
      image.src = 'images/image.png';
      return true;
    }

    function loadTexture(gl, n, texture, u_Sampler, image) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0);// Kích hoạt đơn vị kết cấu 0
      gl.bindTexture(gl.TEXTURE_2D, texture); // Gắn đối tượng texture với target
  
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // Thiết lập tham số Format = RBGA cho ảnh png, Type = Byte cho 1 thành phần color
  
      // Kiểm tra ảnh có phải kiểu Mipmap -> Ngoài giáo trình
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
      } else {
          // Thiết lập tham số
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Phủ kín vùng trái phải, wrapping theo cạnh
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Phủ kín vùng trên dưới, wrapping theo cạnh
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Thu nhỏ kết cấu cho vừa vùng vẽ
      }
  
      gl.uniform1i(u_Sampler, 0); // Truyền đơn vị kết cấu đến FS chỉ định 0
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }
  
  function isPowerOf2(value) {
      return (value & (value - 1)) == 0;
  }

    // Rotation angle (degrees/second)
    var ANGLE_STEP ;
    // Last time that this function was called
    var g_last = Date.now();

    function animate(angle) {
      ANGLE_STEP = isAutoRotate ? inputAngleStep.value :0;
      // Calculate the elapsed time
      var now = Date.now();
      var elapsed = now - g_last;
      g_last = now;
      // Update the current rotation angle (adjusted by the elapsed time)
      var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
      return newAngle %= 360;
    }

    // auto rotate
    function rotate_X_AxisFunction(){
      isAutoRotate=!isAutoRotate
      y_axis=y_rote.value;
      z_axis=z_rote.value;
    }
    
    // translate
    function translateFunction() {
      Tx = x.value;
      Ty = y.value;
      Tz = z.value;
    }
    
    // near - far
    function increaseNearFunction() {
      g_near += 1;
    }
    function decreaseNearFunction() {
      g_near -= 1;
    }
    function increaseFarFunction() {
      g_far += 1;
    } 
    function decreaseFarFunction() {
      g_far -= 1;
    }

    // scaled
    function scaleFunction(){
      Sx=x_scale.value.length ==0 ? 1:x_scale.value;
      Sy=y_scale.value.length ==0 ? 1:y_scale.value;
      Sz=z_scale.value.length ==0 ? 1:z_scale.value;
    }

    // handle check ortho || perspective
    function handleCheck(myRadio){
       typeProjection = myRadio.value;
    }

    // handle check Light - Texture
    function checkLightTure(e){
      gl.uniform1i(u_Type, e.value);
    }