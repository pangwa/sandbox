var surfacePoints = [];
var faces = []; 
var facePts = [];
var theCamera;

function webGLStart() {
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
        src: ["surface.png"]
    },
    onError: function() {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {
      var gl = app.gl,
          canvas = app.canvas,
          program = app.program;
          app.camera = new PhiloGL.Camera (45, 1, 0.0001, 5000 );
          camera = app.camera;
          theCamera = app.camera;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      program.setBuffers({
        'triangle': {
          attribute: 'aVertexPosition',
          value: new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]),
          size: 3
        }
      });
      
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

       var textCoords = [];
       $(xmlDoc).find('F').each (function(){
               if ($(this).attr('i') != "1")
               {
                   var pts = $.map($(this).text().split(' '), function(idx)
                       {
                           return surfacePoints[parseInt (idx)];
                       });
                   faces.push (pts);
               }
           });
       var arrayTemp = new Array(faces.length * 3);
       var idx = 0;
       $(faces).each (function (i){
               $.map(faces[i], function(v) {
                       arrayTemp[idx++] = v;
                   });
           });

       //i = 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++]= 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 4000;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 0;
       //arrayTemp[i++] = 4000;
       //arrayTemp[i++] = 4000;
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

       facePts = new Float32Array (arrayTemp.length);
       facePts.set (arrayTemp);
       //for (i = 0; i < 9; i++)
       //    console.log (facePts[i]);

      // var surface = new PhiloGL.O3D.Model({
      //         texture: "surface.png",
      //         vertices: surfacePoints,
      //         indices: 
      //     });
       program.setBuffer('surfaces', {
               attribute: 'aVertexPosition',
               value: facePts,
               size: 3
           });
       //camera = new PhiloGL.Camera (45, 1, 0.1, 5000 );
       //    {
       //        position: {x:4000, y: 4900, z: 75}
       //    });
      camera.view.id();
      //camera.view.$translate(4000, 3800, 0);
      camera.view.$translate(-4000, -4200, -6000);
       program.setBuffer("surfaces");
       program.setTexture ('surface.png', {
               textureType: gl.TEXTURE_2D,
               TEXTURE_MAG_FILTER: "LINEAR"
           });
       program.setUniform('uMVMatrix', camera.view);
       program.setUniform('uPMatrix', camera.projection);
       gl.drawArrays(gl.TRIANGLES, 0, facePts.length / 3);
       setInterval(draw, 1000/60);

       console.log ("camera.position", camera);
       function draw ()
       {
           //camera.view.$translate(-0, -2, 0);
           gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           program.setTexture ('surface.png');
           program.setUniform('uMVMatrix', camera.view);
           program.setUniform('uPMatrix', camera.projection);
           program.setBuffer("surfaces");
           gl.drawArrays(gl.TRIANGLES, 0, facePts.length / 3);
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

