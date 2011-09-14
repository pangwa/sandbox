var surfacePoints = [];
var faces = []; 
var facePts = [];
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
    onError: function() {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {
      var gl = app.gl,
          canvas = app.canvas,
          program = app.program,
          camera = app.camera;

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
      camera.view.id();
      //console.log('view', camera.view, camera.view.toFloat32Array());
      //Draw Triangle
      camera.view.$translate(0, 0, -10);
      program.setUniform('uMVMatrix', camera.view);
      program.setUniform('uPMatrix', camera.projection);
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
                           return surfacePoints[parseInt (idx)] - 4300;
                       });
                   faces.push (pts);
               }
           });
       var arrayTemp = new Array(faces.length * 3);
       var idx = 0;
       $(faces).each (function (i){
               $.map(faces[i], function(v) {arrayTemp[idx++] = v;});
           });

       arrayTemp[0] = 0;
       arrayTemp[1] = 1;
       arrayTemp[2] = 0;
       arrayTemp[3] = -1;
       arrayTemp[4] = -1;
       arrayTemp[5] = 0;
       arrayTemp[6] = 1;
       arrayTemp[7] = -1;
       arrayTemp[8] = 0;

       facePts = new Float32Array (arrayTemp.length);
       facePts.set (arrayTemp);
       //for (i = 0; i < 9; i++)
       //    console.log (facePts[i]);

       program.setBuffer('surfaces', {
               attribute: 'aVertexPosition',
               value: facePts,
               size: 3
           });
       //camera = new PhiloGL.Camera (45, 1, 0.1, 1000, 
       //    {
       //        position: {x:4000, y: 4900, z: 75}
       //    });
      // camera.view.id();
       camera.view.$translate(4000, 3800, 0);
       program.setUniform('uMVMatrix', camera.view);
       program.setUniform('uPMatrix', camera.projection);
       program.setBuffer("surfaces");
       gl.drawArrays(gl.TRIANGLES, 0, facePts.length / 3);
       setInterval(draw, 1000/60);

       console.log ("camera.position", camera);
       function draw ()
       {
           gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
             camera.view.$translate((pos.x - e.x) / 100, (e.y - pos.y) / 100, 0);
             //console.log (camera.position.x, ", ", camera.position.y);
             pos.x = e.x;
             pos.y = e.y;
             //camera.update ();
         },

         onMouseWheel: function(e) {
             e.stop();
             var camera = this.camera;
             //camera.position.z += e.wheel;
             camera.view.$translate(0, 0, e.wheel);
             //console.log (camera.position.x, ", ", camera.position.y);
             camera.update();
         }
     }
  });  
}

