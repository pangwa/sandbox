var surfacePoints = [];
var faces = []; 
var facePts = [];
var theCamera;
var phObj;
var samplePoints = [];
var surface;
var corridor;
var minX, maxX, minY, maxY;

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

function drawWorld (app)
{
    var gl = app.gl;
    var program = app.program;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    program.setBuffer("aVertexPosition").setBuffer("aTextureCoord").setBuffer('indices');
    program.setTexture ('surface.png');
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR)
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // set to repeating mode
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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

    if (corridor)
    {
        program.setBuffers({
                'aVertexPosition': {
                    value: corridor.vertices,
                    size: 3
                },
                'aTextureCoord': {
                    value: corridor.texCoords,
                    size: 2
                },
                "indices": {
                    value: corridor.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                }
            });
    program.setTexture ('road.png');
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    program.setUniform('uSampler', 0);
    //gl.enable(gl.CULL_FACE);
    //gl.cullFace (gl.FRONT_AND_BACK);
    gl.drawElements(gl.TRIANGLES, corridor.indices.length, gl.UNSIGNED_SHORT, 0);
    //gl.flush();
    //gl.disable(gl.CULL_FACE);
    }
};

function webGLStart() {
    surface = new PhiloGL.O3D.Model({
            texture: "surface.png",

    vertices: [-1, -1, 1,
                1, -1, 1,
                1, 1, 1,
               -1, 1, 1,

               -1, -1, -1,
               -1, 1, -1,
                1, 1, -1,
                1, -1, -1,

               -1, 1, -1,
               -1, 1, 1,
                1, 1, 1,
                1, 1, -1,

               -1, -1, -1,
                1, -1, -1,
                1, -1, 1,
               -1, -1, 1,

                1, -1, -1,
                1, 1, -1,
                1, 1, 1,
                1, -1, 1,

               -1, -1, -1,
               -1, -1, 1,
               -1, 1, 1,
               -1, 1, -1],
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
        src: ["surface.png",
        "road.png"]
    },
    onError: function() {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {
      var gl = app.gl,
          canvas = app.canvas,
          program = app.program;
          app.camera = new PhiloGL.Camera (45, 1, 0.01, 1000 );
          view = new PhiloGL.Mat4;
          camera = app.camera;
          theCamera = app.camera;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      //gl.enable(gl.DEPTH_TEST);
      //gl.depthFunc(gl.ALWAYS);

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
                  // vertices[i * 3] = 0;
                  // vertices[i * 3+ 1] = 0;
                  // vertices[i * 3+ 2] = 0;
               }
           });

       var uvMatrix = [];

       var maxDist = Math.max (Math.abs(maxX - minX), Math.abs(maxY - minY));
       $(surfacePoints).each(function (i)
           {
               var u = Math.abs ((vertices[i*3] - minX) / maxDist);
               var v = Math.abs ((vertices[i*3 + 1] - minY) / maxDist);
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


       var textCoords = new Float32Array(surfacePoints.length * 2);
       var iTexCoords = [0.0, 0.0, 0.0, 1., 1, 1];
       var factor = 1.0;
       if (maxDist > 256)
           factor = (maxDist / 256* 64);

       for (var i = 0; i < surfacePoints.length; i++)
       {
           textCoords[i*2] = uvMatrix [i][0] * factor;
           textCoords[i*2 + 1] = uvMatrix [i][1] * factor;
       }
       //for ( i = 0; i < faces.length; i++)
       //{
       //    for (j = 0; j < 6; j++)
       //        textCoords [i*6 + j] = iTexCoords[j];
       //    
       //    var uv = getUv(faces[i]);
       //    textCoords[i*6] = uv[0]
       //    textCoords[i*6 + 1] = uv[1];
       //    //uv = getUv(faces[i][1]);
       //    textCoords[i*6 + 2] = uv[2];
       //    textCoords[i*6 + 3] = uv[3];
       //    //uv = getUv(faces[i][2]);
       //    textCoords[i*6 + 4] = uv[4];
       //    textCoords[i*6 + 5] = uv[5];
       //}

       surface.texCoords = textCoords;

       //set buffers with cube data
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

       function isXyInFace (face)
       {
       };

       function findElevAtXY(x, y)
       {
       };
       $("#drive").click (function (e){
               var align = $(xmlDoc).find ('Alignment[name="' + $("#alignmentlist").val() +'"]');
               if (!align)
                   alert ("can't find alignment with name: " +$("#alignmentlist").val()); 
               var align = handleAlignment (align);
               if (align["samplePoints"])
               {
                   //$.map (align["samplePoints"], function (v)
                   //    {
                   //    });
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

       //setInterval(draw, 1000/60);

       var it;
       var dimFx;
       $("#stop").click (function (e){
               if ($('#stop').val() != 'resume')
               {
                   clearInterval (it);
                   $("#stop").val ('resume');
                   $("#stop").text ('resume');
               }
               else
               {
                   it = setInterval(function() {
                           dimFx.step();
                       }, 1000 / 60);

                   $("#stop").val('pause');
                   $("#stop").text ('pause');
               }
           });

       //setInterval(function() {drawWorld(app);}, 1000/60);

       function driveWithSamplePoints(smpPts)
       {
           var curIndex = 0;
           //create a Fx instance
           dimFx = new PhiloGL.Fx({
                   duration: smpPts.length /60 * 1000,
                   transition: PhiloGL.Fx.Transition.linear,
                   onCompute: function(delta) {
                       if (curIndex < (smpPts.length - 1))
                       {
                           var nextPt = smpPts[curIndex + 1];
                           var c = pointFromToDist (smpPts[curIndex], nextPt, 20);
                           var p = smpPts[curIndex].clone();
                           c.z = nextPt.z + 10;
                           p.z += 15;
                           theCamera.view.lookAt (p, c, u);
                           drawWorld (app);
                           curIndex ++;
                       }
                   },
                   onComplete: function() {
                       // do the annomation
                       clearInterval (it);
                   }
               });

           //start the animation with custom `from` and `to` properties.
           dimFx.start({
                   from: 0,
                   to: smpPts.length - 2 
               });

           $("#stop").val('pause');
           $("#stop").text ('pause');
           it = setInterval(function() {
                   dimFx.step();
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

function pointFromDirDist (ptStart, dir, dist)
{
    dir = dir.unit ();
    var move = $.map(dir, function (x) {return x * dist;});
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
        return getSamplePointsLine (ptStart, ptEnd, 1);
    },
    Curve : function (node)
    {
        var ptStart = PointFromStr($(node.find ("Start")[0]).text ());
        var ptEnd = PointFromStr($(node.find ("End")[0]).text ());
        var ptCenter= PointFromStr($(node.find ("Center")[0]).text ());
        var radius = parseFloat (node.attr("radius"));
        var length = parseFloat (node.attr("length"));
        var bClockwise = node.attr("rot") == "cw";
        return getSamplePointsCurve (ptStart, ptEnd, ptCenter, radius, length, bClockwise, 1);
    }
    };

    function TheLine (node, startStn)
    {
        this.node = node;
        this.startStn = startStn;
        this.endStn = startStn + parseFloat(node.attr('length'));
        this.ptStart = PointFromStr($(node.find ("Start")[0]).text ());
        this.ptEnd = PointFromStr($(node.find ("End")[0]).text ());
        this.findXYAtOffset = function (pt, offset)
        {
            var dir = this.ptEnd.sub(this.ptStart);
            var nDir = new PhiloGL.Vec3 (dir.y, - dir.x);
            return pointFromDirDist (pt, nDir, offset);
        };
        this.findPtAtStn = function (stn)
        {
            if (stn < this.startStn || stn > this.endStn)
                alert (false);
            return pointFromToDist (this.ptStart, this.ptEnd, stn - this.startStn);
        };
    };

    function TheCurve (node, startStn)
    {
        this.node = node;
        this.startStn = startStn;
        this.endStn = startStn + parseFloat(node.attr('length'));
        this.ptCenter= PointFromStr($(node.find ("Center")[0]).text ());
        this.ptStart = PointFromStr($(node.find ("Start")[0]).text ());
        this.ptEnd = PointFromStr($(node.find ("End")[0]).text ());
        this.radius = parseFloat (node.attr("radius"));
        this.bClockwise = node.attr("rot") == "cw";

        this.findXYAtOffset = function (pt, offset)
        {
            var nDir = this.ptCenter.sub(pt);
            if (!this.bClockWise)
                nDir = nDir.neg ();
            return pointFromDirDist (pt, nDir, offset);
        };
        this.findPtAtStn = function (stn)
        {
            if (stn < this.startStn || stn > this.endStn)
                alert (false);
            var interval = stn - this.startStn;
            var angle = interval / this.radius;
            if (!this.bClockWise)
                angle = -angle;

            var ptStartNoOffset = this.ptStart.sub(this.ptCenter);
            var ptCenter = this.ptCenter;

            function ptByRotate (angle)
            {
                var cosp = Math.cos (angle);
                var sinp = Math.sin (angle);
                var newPt = ptStartNoOffset.clone();
                newPt.x = ptStartNoOffset.x * cosp +  ptStartNoOffset.y * sinp;
                newPt.y = ptStartNoOffset.y * cosp - ptStartNoOffset.x * sinp ;
                return newPt.$add (ptCenter);
            };

            return ptByRotate(angle);
        };
    };

    var segCreator = {
        Line: function (node, startStn)
        {
            return new TheLine (node, startStn);
        },
        Curve: function (node, startStn)
        {
            return new TheCurve (node, startStn);
        }
    };

    function Alignment (alignNode)
    {
        this.node = alignNode;
        var stnElvList = $.map (this.node.find ('ProfSurf').find ('PntList2D').text().split(' '), parseFloat);
        if (stnElvList.length % 2 != 0) //station - elevation map
            stnElvList = stnElvList.slice(0, startStn.length - 1);

        this.stnElvList = stnElvList;
        var geomotries = [];

        var startStn = 0.0;
        $(this.node.find ("CoordGeom")[0]).children().each (function ()
            {
                if(! segCreator[this.tagName])
                    alert ("unsupported CoordGeom type" + this.tagName);
                else
                {
                    geomotries.push (segCreator[this.tagName] ($(this), startStn));
                    startStn = geomotries[geomotries.length -1].endStn;
                }
            });
        this.geomotries = geomotries;

        this.findGeomAtStation = function(stn)
        {
            // should implment binary search here
            var geo;
            $(this.geomotries).each (function()
                {
                    if (this.startStn <= stn && this.endStn >= stn)
                    {
                        geo = this;
                        return false;
                    }
                });
            return geo;
        }
        this.findZAtstation = function (stn)
        {
            var stnElvList = this.stnElvList;
            var low = 0;
            var high = stnElvList.length / 2;
            var mid;
            while (low < high)
            {
                mid = parseInt ((low + high) / 2);
                if (stnElvList[mid * 2] < stn)
                    low = mid + 1;
                else if (stnElvList[mid * 2] > stn)
                high = mid - 1;
                else 
                    return stnElvList[mid * 2 + 1];
            }
            var nextIndex= mid + 1;
            var prevIndex= mid;
            if (stn < stnElvList[mid * 2])
            {
                if (mid > 0)
                    prevIndex = mid - 1;
                nextIndex = mid;
            }

            var elev = stnElvList[mid * 2 + 1];
            if (prevIndex != nextIndex)
            {
                var totallength = stnElvList[nextIndex*2] - stnElvList[prevIndex * 2];
                var prevElev = stnElvList[prevIndex*2 + 1];
                var nextElev = stnElvList[nextIndex*2 + 1];
                elev = (stn - stnElvList[prevIndex*2]) * nextElev / totallength + (stnElvList[nextIndex*2] - stn) * prevElev / totallength;
            }
            return elev;
        };
    };

function buildCorridorFromAlign(alignEnt)
{
    var sections = [];
    var minX, minY, maxX, maxY;
    $(alignEnt.node.find ("CrossSects")).children().each (function ()
    {
        var station = parseFloat($(this).attr('sta'));
        var ptZCenter = alignEnt.findZAtstation (station);
        var seg = alignEnt.findGeomAtStation(station);
        var pt = seg.findPtAtStn (station);
        var secPoints = {}; //offset- elev
        $(this).find("CrossSectPnt").each (function ()
            {
                var offsetAndElev = $.map($(this).text().split (' '), parseFloat);
                if (secPoints[offsetAndElev[0]] == undefined)
                    secPoints[offsetAndElev[0]] = offsetAndElev[1];
                else
                    secPoints[offsetAndElev[0]] = Math.max (secPoints[offsetAndElev[0]], offsetAndElev[1]);
            });
        var secPointsArray = [];
        $.each(secPoints, function(v) {secPointsArray.push ({offset: parseFloat(v), 
                        elev : secPoints[v]})
            });
        secPointsArray.sort (function(a, b) {
                return  a.offset - b.offset;
            });
        $(secPointsArray).each (function (i) {
                var ptOffset = seg.findXYAtOffset (pt, secPointsArray[i].offset);
                ptOffset.z = secPointsArray[i].elev + ptZCenter;
                secPointsArray[i].point = ptOffset;
                minX = myMin (minX, ptOffset.x);
                minY = myMin (minY, ptOffset.y);
                maxX = myMax (maxX, ptOffset.x);
                maxY = myMax (maxY, ptOffset.y);
            });
        sections.push (secPointsArray);
    });

    return buildCorridorModeFromSections({
        minX : minX,
        maxX : maxX,
        minY : minY,
        maxY : maxY,
        sections: sections
    });
};

function buildCorridorModeFromSections (info)
{
    var sections = info.sections;
    var s1;
    var s2;
    var vertices = [];
    var indices = [];
    var texCoord = [];
    var uvMatrix = [];

    var minX = info.minX;
    var maxX = info.maxX;
    var minY = info.minY;
    var maxY = info.maxY;
    var maxDist = Math.max (Math.abs(maxX - minX), Math.abs(maxY - minY));
    var factor = 1.0;
    if (maxDist > 256)
        factor = maxDist / 256 * 64;

    for (var i = 0; i < sections.length - 1; i++)
    {
        s1 = sections[i];
        s2 = sections[i + 1];
        if (s1.length != s2.length)
            alert ('false');
        for (var j = 0; j < s1.length - 1; j++)
        {
            var p1 = s1[j].point;
            var p2 = s1[j + 1].point;
            var p3 = s2[j].point;
            var p4 = s2[j + 1].point;
            //
            //  s2[j]     s2[j+1]
            //  
            //  s1[j]     s1[j+1]
            //
            var vts = [p1.x, p1.y,  p1.z, 
                       p2.x, p2.y,  p2.z,
                       p3.x, p3.y,  p3.z,
                       p4.x, p4.y,  p4.z];
            var  tc = [];
            for (var n = 0; n < 4; n++)
            {
                var u = Math.abs ((vertices[n*3] - minX) / maxDist) * factor;
                var v = Math.abs ((vertices[n*3 + 1] - minY) / maxDist) * factor;
                tc[n*2] = u;
                tc[n*2 + 1] = v;
            }
            texCoord = texCoord.concat (tc);
            vertices = vertices.concat (vts);
            var i1 = vertices.length / 3 - 4;
            var i2 = i1 + 1;
            var i3 = i1 + 2;
            var i4 = i1 + 3;
            indices = indices.concat ([i1, i2, i3, i2, i3, i4])
        }
    }

corridor = new PhiloGL.O3D.Model({
            texture: "road.png",
            vertices: vertices,
            texCoords: texCoord,
            indices: indices });
}

function handleAlignment (align)
{
    var alignEnt = new Alignment (align);
    if (corridor == undefined)
        buildCorridorFromAlign (alignEnt);
    var ret = { name: align.attr("name") };
    var lSamplePoints = [];
    var startStn = 0.0;
    var endStn = 0.0;
    var stnElvList = $.map (align.find ('ProfSurf').find ('PntList2D').text().split(' '), parseFloat);
    if (stnElvList.length % 2 != 0) //station - elevation map
        stnElvList = stnElvList.slice(0, startStn.length - 1);

    function findZAtstation (stn)
    {
        var low = 0;
        var high = stnElvList.length / 2;
        var mid;
        while (low < high)
        {
            mid = parseInt ((low + high) / 2);
            if (stnElvList[mid * 2] < stn)
                low = mid + 1;
            else if (stnElvList[mid * 2] > stn)
                high = mid - 1;
                else 
                    return stnElvList[mid * 2 + 1];
        }
        var nextIndex= mid + 1;
        var prevIndex= mid;
        if (stn < stnElvList[mid * 2])
        {
            if (mid > 0)
                prevIndex = mid - 1;
            nextIndex = mid;
        }

        var elev = stnElvList[mid * 2 + 1];
        if (prevIndex != nextIndex)
        {
            var totallength = stnElvList[nextIndex*2] - stnElvList[prevIndex * 2];
            var prevElev = stnElvList[prevIndex*2 + 1];
            var nextElev = stnElvList[nextIndex*2 + 1];
            elev = (stn - stnElvList[prevIndex*2]) * nextElev / totallength + (stnElvList[nextIndex*2] - stn) * prevElev / totallength;
        }
        return elev;
    };

    $(align.find ("CoordGeom")[0]).children().each (function ()
        {
            if(! tagHandler[this.tagName])
                alert ("unsupported CoordGeom type" + this.tagName);
            else
            {
                var length = parseFloat($(this).attr('length'));
                endStn = startStn + length;
                var smpPt = tagHandler[this.tagName]($(this));
                if (lSamplePoints.length > 0 && smpPt.length > 0)
                {
                    smpPt[0].z = lSamplePoints[lSamplePoints.length - 1].z;
                    if (lSamplePoints[lSamplePoints.length - 1].distTo(smpPt[0]) == 0)
                    {
                        smpPt = smpPt.slice (1);
                    }
                }
                for (var i = 0; i < smpPt.length; i++, startStn += 1)
                {
                    if (startStn > endStn)
                        startStn = endStn;
                    smpPt[i].z = findZAtstation (startStn);
                }
                lSamplePoints = lSamplePoints.concat (smpPt);
                startStn = endStn;
            }
        });
    ret ["samplePoints"] = lSamplePoints;
    return ret;
}

function isPointInTriangle (p, p1, p2, p3)
{
    var p = new PhiloGL.Vec3 (p[0], p[1], p[2]);
    var a = new PhiloGL.Vec3 (p1[0], p1[1], p1[2]);
    var b = new PhiloGL.Vec3 (p2[0], p2[1], p2[2]);
    var c = new PhiloGL.Vec3 (p3[0], p3[1], p3[2]);
    var v0 = c.sub(a);
    var v1 = b.sub(a);
    var v2 = p.sub(a);
    var dot00 = v0.dot(v0);
    var dot01 = v0.dot(v1);
    var dot02 = v0.dot(v2);
    var dot11 = v1.dot(v1);
    var dot12 = v1.dot(v2);
    var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);
    u = (dot11 * dot02 - dot01 * dot12) * invDenom
    v = (dot00 * dot12 - dot01 * dot02) * invDenom

    // Check if point is in triangle
    if (((u > 0) && (v > 0) && (u + v < 1)) == false)
    {
        function multiply(p1, p2, p0)
        {
            var x = ((p1.x-p0.x)*(p2.y-p0.y)-(p2.x-p0.x)*(p1.y-p0.y));
            return x;
        };
        function online (a, b, p)
        {
            var r = ((multiply (b, p, a) == 0) && ( ((p.x-a.x)*(p.x-b.x) <0   )||((p.y-a.y)*(p.y-b.y) <0   ))); 
            return r;
        };
        return p.distTo(a) == 0|| p.distTo(b) == 0|| p.distTo(c) == 0 || online (a, b, p) || online (a, c, p) || online(b, c, p);
    }
    return true;
}

function buildCorridor (align)
{
    align.find ("CrossSects").children().each (function()
        {
            if (this.tagName != "CrossSect")
            {

            }
        });
}
