var surfacePoints = [];
var faces = []; 
var facePts = [];
var theCamera;

function webGLStart() {
    var surface = new PhiloGL.O3D.Model({
            texture: "surface.gif",

    vertices: [-1+4000, 4000-1, 1,
                1+4000, 4000-1, 1,
                1+4000, 40001, 1,
               -1+4000, 40001, 1,

               -1+4000, 4000-1, -1,
               -1+4000, 40001, -1,
                1+4000, 40001, -1,
                1+4000, 4000-1, -1,

               -1+4000, 40001, -1,
               -1+4000, 40001, 1,
                1+4000, 40001, 1,
                1+4000, 40001, -1,

               -1+4000, 4000-1, -1,
                1+4000, 4000-1, -1,
                1+4000, 4000-1, 1,
               -1+4000, 4000-1, 1,

                1+4000, 4000-1, -1,
                1+4000, 40001, -1,
                1+4000, 40001, 1,
                1+4000, 4000-1, 1,

               -1+4000, 4000-1, -1,
               -1+4000, 4000-1, 1,
               -1+4000, 40001, 1,
               -1+4000, 40001, -1],
//            vertices: [0, 0, 0,
//                       0, 1, 0,
//                       1, 1, 0],
//            indices: [0, 1, 2]

 texCoords: [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
    ],

 indices: [0, 1, 2, 0, 2, 3,
              4, 5, 6, 4, 6, 7,
              8, 9, 10, 8, 10, 11,
              12, 13, 14, 12, 14, 15,
              16, 17, 18, 16, 18, 19,
              20, 21, 22, 20, 22, 23]

        });
  PhiloGL('lesson01-canvas', {
    program: {
      from: 'ids',
      vs: 'shader-vs',
      fs: 'shader-fs'
    },
    camera: {
        position: {
            x: 0, y: 0, z: -7
        }
    },
    textures:{
        src: ["surface.gif"]
    },
    onError: function() {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {
      var gl = app.gl,
          canvas = app.canvas,
          program = app.program;
          app.camera = new PhiloGL.Camera (45, 1, 0.0001, 5000 );
          view = new PhiloGL.Mat4;
          camera = app.camera;
          theCamera = app.camera;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      //program.setBuffers({
      //  'triangle': {
      //    attribute: 'aVertexPosition',
      //    value: new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]),
      //    size: 3
      //  }
      //});
      
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      //camera.near = 0.0001;
      camera.view.id();
      //camera.update ();
      //console.log('view', camera.view, camera.view.toFloat32Array());
      //Draw Triangle
      //camera.view.$translate(0, 0, -10);
      //program.setUniform('uMVMatrix', camera.view);
      //program.setUniform('uPMatrix', camera.projection);
      //program.setBuffer('triangle');
      //gl.drawArrays(gl.TRIANGLES, 0, 3);
      
      var xmlDoc = $.parseXML($("#surface").html());
      $(xmlDoc).find('P').each (function()
              {
                  var id = parseInt($(this).attr("id"));
                  var pt = $.map($(this).text().split(" "), parseFloat);
                  surfacePoints[id] = pt;
              }
          ); 

       $(xmlDoc).find('F').each (function(){
               if ($(this).attr('i') != "1")
               {
                   var pts = $.map($(this).text().split(' '), function(idx)
                       {
                           return parseInt (idx);
                       });
                   faces.push (pts);
               }
           });
       var vertices = new Float32Array(surfacePoints.length * 3);
       $(surfacePoints).each(function (i)
           {
               if (surfacePoints[i])
               {
                   vertices[i * 3] = surfacePoints[i][0];
                   vertices[i * 3+ 1] = surfacePoints[i][1];
                   vertices[i * 3+ 2] = surfacePoints[i][2];
                   }
                   else
                   {
                       vertices[i * 3] = 0;
                       vertices[i * 3+ 1] = 0;
                       vertices[i * 3+ 2] = 0;
                   }
           });
       surface.vertices = vertices;
       var arrayTemp = new Array(faces.length * 3);
       var idx = 0;
       $(faces).each (function (i){
               $.map(faces[i], function(v) {
                       arrayTemp[idx++] = v;
                   });
           });

       surface.indices = arrayTemp;

       var textCoords = new Float32Array(surface.indices.length / 3 * 4);
       var iTexCoords = [0.0, 0.0, 1.0, 0.0];
       for ( i = 0; i < surface.indices.length; i++)
       {
           for (j = 0; j < 4; j++)
               textCoords [i*4 + j] = iTexCoords[j];
       }

       surface.texCoords = textCoords;

       i = 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++]= 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 10;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 10;
       //arrayTemp[i++] = 10;
       //arrayTemp[i++] = 0;

      // arrayTemp[i++] = 4;
      // arrayTemp[i++] = 4;
      // arrayTemp[i++] = 0;
      // arrayTemp[i++] = 8;
      // arrayTemp[i++] = 8;
      // arrayTemp[i++] = 0;
      // arrayTemp[i++] = 10;
      // arrayTemp[i++] = 6;
      // arrayTemp[i++] = 0;

       //facePts = new Float32Array (arrayTemp.length);
       //facePts.set (arrayTemp);
       //for (i = 0; i < 9; i++)
       //    console.log (facePts[i]);

      // var surface = new PhiloGL.O3D.Model({
      //         texture: "surface.png",
      //         vertices: surfacePoints,
      //         indices: 
      //     });
     //set buffers with cube data
     program.setBuffers({
             'aVertexPosition': {
                 value: surface.vertices,
                 size: 3
             },
             'aTextureCoord': {
                value: surface.texCoords,
                size: 2
             },
             "indices": {
                 value:surface.indices,
                 bufferType: gl.ELEMENT_ARRAY_BUFFER,
                 size: 1
             }
         });

       //program.setBuffers({
       //        attribute: 'aVertexPosition',
       //        value: facePts,
       //        size: 3
       //    });
       //program.setBuffer('surfacesColors', {
       //        attribute: 'aVertexColor',
       //        value: new Float32Array([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1]),
       //        size: 4
       //    });
       //program.setBuffer('surfaceTextureCoord', {
       //        attribute: 'aTextureCoord',
       //        value: [0.0, 1.0, 0.0, 0.0],
       //        size: 2
       //    });

       //camera = new PhiloGL.Camera (45, 1, 0.1, 5000 );
       //    {
       //        position: {x:4000, y: 4900, z: 75}
       //    });
      camera.view.id();
      //camera.view.$translate(4000, 3800, 0);
      //camera.view.$translate(0, 0, -30);
      //surface.position.set(4000, 4000, -8);
      surface.update ();
      //camera.view.$translate(-4000, -4000, -10);
      camera.view.$translate(-4000, -4200, -6000);
      program.setBuffer("aVertexPosition").setBuffer("aTextureCoord").setBuffer('indices');
      program.setTexture ("surface.gif");//, {
       //        textureType: gl.TEXTURE_2D,
       //        TEXTURE_MAG_FILTER: "LINEAR"
       //    });
       program.setUniform('uMVMatrix', camera.view);
       program.setUniform('uPMatrix', camera.projection);
       program.setUniform('uSampler', 0);
       gl.drawElements(gl.TRIANGLES, surface.indices.length, gl.UNSIGNED_SHORT, 0);
       //gl.drawArrays(gl.TRIANGLES, 0, 3);
       setInterval(draw, 1000/60);

       console.log ("camera.position", camera);
       rCube = 0;
       y = 0;
       function draw ()
       {
           //camera.view.$translate(-0, -2, 0);
           gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           program.setBuffer("aVertexPosition").setBuffer("aTextureCoord").setBuffer('indices');
           //program.setBuffer("surfaces");
           program.setTexture ('surface.gif');
           rCube+= 0.01;
           //y += 5;
           //surface.position.set(0, y, 0);
           surface.rotation.set (rCube, rCube, rCube);
           surface.update ();
           view.mulMat42 (camera.view, surface.matrix);
           program.setUniform('uMVMatrix', view);
           program.setUniform('uPMatrix', camera.projection);
           program.setUniform('uSampler', 0);
           gl.drawElements(gl.TRIANGLES, surface.indices.length, gl.UNSIGNED_SHORT, 0);
       }
    },
     events: {
         onDragStart: function(e) {
             pos = {
                 x: e.x,
                 y: e.y
             };
         },
         onDragMove: function(e) {
             camera = this.camera;
             //camera.position.x = pos.x - e.x;
             //camera.position.y = pos.y - e.y;
             //camera.target.x = camera.position.x;
             //camera.target.y = camera.position.y;
             //camera.position.y += pos.y - e.y;
             camera.view.$translate((e.x - pos.x), e.y - pos.y, 0);
             //console.log (camera.position.x, ", ", camera.position.y);
             pos.x = e.x;
             pos.y = e.y;
             theCamera = camera;
             //camera.update ();
         },

         onMouseWheel: function(e) {
             e.stop();
             var camera = this.camera;
             //camera.position.z += e.wheel;
             camera.view.$translate(0, 0, e.wheel);
             //console.log (camera.position.x, ", ", camera.position.y);
             //camera.update();
         }
     }
  });  
}

