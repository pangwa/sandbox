var surfacePoints = [];
var faces = []; 
var facePts = [];
var theCamera;
var phObj;
var samplePoints = [];
var surface;
var minX, maxX, minY, maxY;
function drawWorld (app)
{
    var gl = app.gl;
    var program = app.program;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    program.setBuffer("aVertexPosition").setBuffer("aTextureCoord").setBuffer('indices');
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //program.setBuffer("surfaces");
    //program.setTexture ('surface.png');
    //y += 5;
    //surface.position.set(0, y, 0);
    //surface.rotation.set (rCube, rCube, rCube);
    //surface.update ();
    //view.mulMat42 (theCamera.view, surface.matrix);
    view = theCamera.view;
    program.setUniform('uMVMatrix', view);
    program.setUniform('uPMatrix', theCamera.projection);
    program.setUniform('uSampler', 0);
    gl.drawElements(gl.TRIANGLES, surface.indices.length, gl.UNSIGNED_SHORT, 0);

};

function webGLStart() {
    surface = new PhiloGL.O3D.Model({
            texture: "surface.png",

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
                  if (pt.length != 3)
                      console.log ('error');
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
                   //
                   // swap x, y
                   vertices[i * 3] = surfacePoints[i][1];
                   vertices[i * 3 + 1] = surfacePoints[i][0];
                   vertices[i * 3 + 2] = surfacePoints[i][2];
                   minX = minX != undefined ? Math.min(minX, vertices[i*3]) : vertices[i * 3];
                   minY = minY != undefined ? Math.min(minY, vertices[i*3 + 1]) : vertices[i * 3 + 1];
                   maxX = maxX != undefined ? Math.max(maxX, vertices[i*3]) : vertices[i * 3];
                   maxY = maxY != undefined ? Math.max(maxY, vertices[i*3 + 1]) : vertices[i * 3 + 1];
               }
               else
               {
                   vertices[i * 3] = 0;
                   vertices[i * 3+ 1] = 0;
                   vertices[i * 3+ 2] = 0;
               }
           });

       var uvMatrix = [];
       $(surfacePoints).each(function (i)
           {
               var u = (vertices[i*3] - minX) / (maxX - minX);
               var v = (vertices[i*3 + 1] - minY) / (maxY - minY);
               uvMatrix[i] = [u, v];
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

       function myMin (x, x2)
       {
           if (x == undefined)
               return x2;
           return Math.min (x, x2);
       }
       function myMax(x, x2)
       {
           if (x == undefined)
               return x2;
           return Math.max(x, x2);
       }

       function getUv (theface)
       {
           var MinX, MinY, MaxX, MaxY;
           var pts = [];
           var ptStart;
           for (var i = 0; i < 3; i++)
           {
               ptStart = theface[i] * 3; 
               pts.push ([vertices[ptStart], vertices[ptStart + 1], vertices[ptStart + 2]]);
           }
           for (var i = 0; i < 3; i++)
           {
               MinX = myMin (MinX, pts[i][0]);
               MaxX = myMax (MaxX, pts[i][0]);
               MinY = myMin(MinY, pts[i][1]);
               MaxY = myMax(MinY, pts[i][1]);
           }
           
           var theuv = [];
           function compUv (index)
           {
               var u = (pts[index][0] - MinX) / (MaxX - MinX);
               var v = (pts[index][1] - MinY) / (MaxY - MinY);
               theuv.push (u);
               theuv.push (v);
           };
           compUv (0);
           compUv (1);
           compUv (2);
           return theuv;
           //return uvMatrix[index];
       };
       var textCoords = new Float32Array(faces.length * 6);
       var iTexCoords = [0.0, 0.0, 0.0, 1., 1, 1];
       for ( i = 0; i < faces.length; i++)
       {
           for (j = 0; j < 6; j++)
               textCoords [i*6 + j] = iTexCoords[j];
           
           var uv = getUv(faces[i]);
           textCoords[i*6] = uv[0]
           textCoords[i*6 + 1] = uv[1];
           //uv = getUv(faces[i][1]);
           textCoords[i*6 + 2] = uv[2];
           textCoords[i*6 + 3] = uv[3];
           //uv = getUv(faces[i][2]);
           textCoords[i*6 + 4] = uv[4];
           textCoords[i*6 + 5] = uv[5];
       }

       surface.texCoords = textCoords;

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

     surface.update ();
     // camera.view.$translate(-4000, -4200, -6000);
     // theCamera.view.$rotateXYZ(90, 0, 0);
     // theCamera.view.$rotateXYZ(0, 0, 180);
     // rCube = 0;
       //draw ();
       //setInterval(draw, 1000/60);

       console.log ("camera.position", camera);
       y = 0;
       p = [5588, 3900, 82];
       c = [5650, 3870, 72];
       u = [0, 0, 1];

       $(xmlDoc).find('Alignment').each (function(){
               //samplePoints.push (handleAlignment ($(this)));
               //var value = $(this);
               var name = $(this).attr("name");
               $("#alignmentlist").append($('<option></option>').val(name).html(name));
              });

       $("#drive").click (function (e){
               var align = $(xmlDoc).find ('Alignment[name="' + $("#alignmentlist").val() +'"]');
               if (!align)
                   alert ("can't find alignment with name: " +$("#alignmentlist").val()); 
               var align = handleAlignment (align);
               if (align["samplePoints"])
               {
                   driveWithSamplePoints (align["samplePoints"]);
               }
           });
       camera.view.lookAt (p, c, u);
       var curIndex = 0;
       drawWorld (app);
       function draw()
       {
           drawWorld(app);
       };

       setInterval(draw, 1000/60);

       function driveWithSamplePoints(smpPts)
       {
           var curIndex = 0;
           //create a Fx instance
           var fx = new PhiloGL.Fx({
                   duration: smpPts.length /60 * 1000,
                   transition: PhiloGL.Fx.Transition.Back.easeOut,
                   onCompute: function(delta) {
                       if (curIndex < (smpPts.length - 1))
                       {
                           var nextPt = smpPts[curIndex + 1];
                           var c = pointFromToDist (smpPts[curIndex], nextPt, 100);
                           c.z = 75;
                           smpPts[curIndex].z = 82 ;
                           theCamera.view.lookAt (smpPts[curIndex], c, u);
                           drawWorld (app);
                           curIndex ++;
                       }
                   },
                   onComplete: function() {
                       // do the annomation
                   }
               });

           //start the animation with custom `from` and `to` properties.
           fx.start({
                   from: 0,
                   to: smpPts.length - 2 
               });

           setInterval(function() {
                   fx.step();
               }, 1000 / 60);
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
             //console.log (e.x - pos.x, " , ", e.y - pos.y);
             pos.x = e.x;
             pos.y = e.y;
             drawWorld (this);
             //camera.update ();
         },

         onMouseWheel: function(e) {
             e.stop();
             var camera = this.camera;
             //camera.position.z += e.wheel;
             camera.view.$translate(0, 0, e.wheel * 50);
             //console.log (camera.position.x, ", ", camera.position.y);
             //camera.update();
         }
     }
  });  
}

function pointFromToDist (ptStart, ptEnd, dist)
{
    var length = ptStart.distTo(ptEnd);
    if (length == 0)
        alert (false);

    var edge = ptEnd.sub(ptStart).unit ();
    var move = $.map(edge, function (x) {return x * dist;});
    return ptStart.add (move);
}

function getSamplePointsLine (pStart, pEnd, interval)
{
    var pStart = new PhiloGL.Vec3(pStart[0], pStart[1]);
    var pEnd = new PhiloGL.Vec3(pEnd[0], pEnd[1]);
    if (interval <= 0)
        return [];

    var length = pStart.distTo(pEnd);
    if (length < interval)
        return [pStart.clone(), pEnd.clone()];

    var retArray = [];
    var edge = pEnd.sub(pStart).unit ();
    var move = $.map(edge, function (x) {return x * interval;});
    for (i = 0, lastPt = pStart; i < length / interval; i++, lastPt.$add(move))
    {
        retArray.push (lastPt.clone ());
    }
    if (pEnd.distTo(lastPt) > 0.00001)
        retArray.push (pEnd);
    return retArray;
}


function getSamplePointsCurve(pStart, pEnd, ptCenter, radius, length, bClockWise, interval)
{
    var ptStart = new PhiloGL.Vec3 (pStart[0], pStart[1]);
    var ptEnd = new PhiloGL.Vec3 (pEnd[0], pEnd[1]);
    var ptCenter = new PhiloGL.Vec3 (ptCenter[0], ptCenter[1]);
    if (interval <= 0)
        return [];
    if (length < interval)
        return [pStart.clone(), pEnd.clone ()];
    var angle = interval / (radius );
    if (!bClockWise)
        angle = -angle;

    var ptStartNoOffset = ptStart.sub(ptCenter);
    
    function ptByRotate (angle)
    {
        var cosp = Math.cos (angle);
        var sinp = Math.sin (angle);
        var newPt = ptStartNoOffset.clone();
        newPt.x = ptStartNoOffset.x * cosp +  ptStartNoOffset.y * sinp;
        newPt.y = ptStartNoOffset.y * cosp - ptStartNoOffset.x * sinp ;
        return newPt.$add (ptCenter);
    };

    retArray = [];
    lastPt = ptStart;
    for (i = 0, lastPt = ptStart; i < length / interval; i++, lastPt = ptByRotate(angle * i))
    {
        retArray.push (lastPt.clone ());
    }

    if (ptEnd.distTo(lastPt) > 0.00001)
        retArray.push (pEnd);

    return retArray;
}

function PointFromStr (str)
{
    var pts = $.map(str.trim().split(" "), parseFloat);
    return new PhiloGL.Vec3(pts[1], pts[0], pts[2]);
};

var tagHandler =  {Line: function(node)
    {
        var ptStart = PointFromStr($(node.find ("Start")[0]).text ());
        var ptEnd = PointFromStr($(node.find ("End")[0]).text ());
        return getSamplePointsLine (ptStart, ptEnd, 2);
    },
    Curve : function (node)
    {
        var ptStart = PointFromStr($(node.find ("Start")[0]).text ());
        var ptEnd = PointFromStr($(node.find ("End")[0]).text ());
        var ptCenter= PointFromStr($(node.find ("Center")[0]).text ());
        var radius = parseFloat (node.attr("radius"));
        var length = parseFloat (node.attr("length"));
        var bClockwise = node.attr("rot") == "cw";
        return getSamplePointsCurve (ptStart, ptEnd, ptCenter, radius, length, bClockwise, 1.5);
    }
    };

function handleAlignment (align)
{
    var ret = { name: align.attr("name") };
    var lSamplePoints = [];
        $(align.find ("CoordGeom")[0]).children().each (function ()
        {
            if(! tagHandler[this.tagName])
                alert ("unsupported CoordGeom type" + this.tagName);
            else
            {
                var smpPt = tagHandler[this.tagName]($(this));
                if (lSamplePoints.length > 0 && smpPt.length > 0)
                {
                    if (lSamplePoints[lSamplePoints.length - 1].distTo(smpPt[0]) == 0)
                    {
                        smpPt = smpPt.slice (1);
                    }
                }
                lSamplePoints = lSamplePoints.concat (smpPt);
            }
        });
    ret ["samplePoints"] = lSamplePoints;
    return ret;
}
