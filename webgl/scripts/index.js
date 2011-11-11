// in code
var surfacePoints = [];
var faces = []; 
var facePts = [];
var theCamera;
var phObj;
var samplePoints = [];
var corridor;
var minX, maxX, minY, maxY;
var treeModel;
var cube;
var defaultElevOffset = 3.0;
var glContext;
var database;

PhiloGL.unproject = function (pt, camera)
{
    return  camera.view.invert().mulMat4 (camera.projection.invert ()).mulVec3 (pt);
};

PhiloGL.Ray = function (ptOrig, direction)
{
    this.origin= ptOrig; 
    this.direction = direction;
};

PhiloGL.MakeRay = function (camera, ndcx, ndcy)
{
    var origin = PhiloGL.unproject ([ndcx, ndcy, -1.0], camera);
    var target = PhiloGL.unproject ([ndcx, ndcy, 1.0], camera);
    var direction = PhiloGL.Vec3.sub(target, origin).unit ();
    return new PhiloGL.Ray (origin, direction);
};

PhiloGL.Ray.prototype.intersectObject = function ( model ) {
    //// Checking boundingSphere
    //var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );
    //if ( distance == null || distance > object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) ) ) {
    //    return [];
    //}
    // Checking faces
    var f, fl, face,
    a, b, c, d, normal,
    vector, dot, scalar,
    origin, direction,
    vertices = model.vertices,
    objMatrix = model.matrix,
    intersect, intersects = [],
    intersectPoint;
    normals = model.normals;

    origin = this.origin;
    direction = this.direction;
    for ( f = 0, fl = model.indices.length / 3; f < fl; f ++ ) {

        face = [].slice.call(model.indices, f*3, f*3 + 3);
        //// check if face.centroid is behind the origin
        //vector = objMatrix.multiplyVector3( face.centroid.clone() ).subSelf( origin );
        //dot = vector.dot( direction );
        //if ( dot <= 0 ) continue;
        //
        a = objMatrix.mulVec3 ([].slice.call (vertices, face[0] * 3, face[0]*3 + 3));
        b = objMatrix.mulVec3([].slice.call (vertices, face[1] * 3, face[1]*3 + 3));
        c = objMatrix.mulVec3([].slice.call (vertices, face[2] * 3, face[2]*3 + 3));

        normal = [].slice.call (normals, f*3, f*3 + 3);//object.matrixRotationWorld.multiplyVector3( face.normal.clone() );
        dot = PhiloGL.Vec3.dot(direction, normal );

        //if (dot > 0){
            scalar = PhiloGL.Vec3.dot (normal, PhiloGL.Vec3.sub (a, origin) ) / dot;
            intersectPoint = PhiloGL.Vec3.add (origin, [direction[0] * scalar, direction[1] * scalar, direction[2] * scalar]);

            if ( pointInFace3( intersectPoint, a, b, c ) ) {
                intersect = {
                    distance: PhiloGL.Vec3.distTo(origin, intersectPoint ),
                    point: intersectPoint,
                    face: face,
                    object: model
                };
                intersects.push( intersect );
            }
        //}
    }

    intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

    return intersects;

    function distanceFromIntersection( origin, direction, position ) {

        var vector, dot, intersect, distance;

        vector = position.clone().subSelf( origin );
        dot = vector.dot( direction );

        if ( dot <= 0 ) return null; // check if position behind origin.

        intersect = origin.clone().addSelf( direction.clone().multiplyScalar( dot ) );
        distance = position.distanceTo( intersect );

        return distance;

    }

    // http://www.blackpawn.com/texts/pointinpoly/default.html
    function pointInFace3( p, a, b, c ) {

        var v0 = PhiloGL.Vec3.sub (c, a ), v1 = PhiloGL.Vec3.sub(b, a ), v2 = PhiloGL.Vec3.sub(p, a ),
        dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

        invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
        u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
        v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

        return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

    }
};

function ObjListEditCell (thethis, cl)
{
    $(thethis).toggleClass ("displayoff");
    var rowData = $("#objcontainer").getRowData(cl);
    var ent = database.findEntityByName (rowData.Name);
    if (ent)
    {
        ent.visible = ! $(thethis).hasClass ('displayoff');
        ent.update ();
    }

};

 AecEntity = function (subModels, type, db)
{
    this.subModels = subModels || [];
    this.type = type || "none";
    this.properties = [];
    this.db = db;
    this.scale = new PhiloGL.Vec3(1.0, 1.0, 1.0);
    this.position = new PhiloGL.Vec3(.0, .0, .0);
    this.lod = false;
    this.name = "";
    this.cachedExtent = [];
    this.visible = true;
    this.update ();

    if (db)
        this.addToDb (db);
};

AecEntity.prototype.addToDb = function (db)
{
    if (this.db == db)
        return;

    this.db = db;
    db.initEntity (this);
};

AecEntity.prototype.update = function ()
{
    var thethis = this;
    $(this.subModels).each (function (){
            this.scale = thethis.scale;
            this.position = thethis.position;
            this.lod = thethis.lod;
            this.parentEnt = thethis;
            this.pickable = thethis.pickable;
            this.display = thethis.visible;
            this.update ();
        });
};

AecEntity.prototype.clone = function (){
    var subModels = $.map (this.subModels, function (v) { return v.clone ();});
    var newEntity = new AecEntity (subModels, this.type);
    newEntity.properties = this.properties;
    newEntity.lod = this.lod;
    newEntity.scale = this.scale;
    newEntity.pickable = this.pickable;
    return newEntity;
};

AecEntity.prototype.facesCount = function ()
{
    return this.subModels.reduce (function (v, c)
        {
            return v + c.indices.length / 3;
        }, 0);
}

function MergeExtent (first, sec)
{
    if (!first)
        return sec;
    if (! sec)
        return first;
    var l1 = first[0];
    var l2 = sec[0];
    var low = $.map (l1, function (v, i){
            if (isNaN(v))
                return l2[i];
            if (isNaN(l2[i])) 
                return v;
            return Math.min (v, l2[i]);
        });
    var h1 = first[1];
    var h2 = sec[1];
    var high = $.map (h1, function (v, i){
            if (v == NaN)
                return h2[i];
            if (h2[i] == NaN)
                return v;
            return Math.max (v, h2[i]);
        });
    return [low, high];
};

AecEntity.prototype.getExtent = function ()
{

    function ExtentAcceptPoint (extent, pt)
    {
        if (isNaN(pt[2]))
            console.log ('getting NaN elevation...');
        return MergeExtent (extent, [pt, pt]);
    };

    function getExtentForSubModel (model)
    {
        if (!model.indices || model.indices.length <= 0)
            return;
        var firstIndex = model.indices [0];
        var ptStart = firstIndex * 3;
         var low = high = [model.vertices[ptStart], model.vertices[ptStart + 1], model.vertices [ptStart + 2]];
        var extent = [low, high];
        for (var i = 1, l = model.indices.length; i < l; i++)
        {
            var ptStart = model.indices[i] * 3;
            var curPt = [model.vertices[ptStart], model.vertices[ptStart + 1], model.vertices [ptStart + 2]];
            extent = ExtentAcceptPoint (extent, curPt);
            if (isNaN( extent[0][2]) || isNaN(extent[1][2]))
                console.log ("NaN... " + i);
        }
        return extent;
    };
    var extent;
    if (!this.cachedExtent || this.cachedExtent.length <= 0)
    {
        for (var i = 0, l = this.subModels.length; i < l; i++)
        {
            extent = MergeExtent (extent, getExtentForSubModel (this.subModels[i]));
        }
    }
    this.cachedExtent = extent;
    return extent;
};

AecDatabase = function (app)
{
    this.app = app;
    this.scene = app.scene;
    this.entities = [];
};

AecDatabase.prototype.clear = function ()
{
    for (var i = 0; i < this.entities.length; i++)
    {
        for (var j = 0; j < this.entities[i].subModels.length; j++)
        {
            this.scene.remove (this.entities[i].subModels[j]);
        }
    }
    this.entities = []; //reset to empty
    this.cachedExtent = [];
    //var gl = this.app.gl;
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //this.scene.render ();
}

AecDatabase.prototype.findEntityByName = function (name)
{
    for (var i = 0; i < this.entities.length; i++)
    {
        if (this.entities[i].name == name)
            return this.entities[i];
    }
    return false;
}

AecDatabase.prototype.initEntity = function (entity)
{
    this.entities.push (entity);
    for (var i = 0; i < entity.subModels.length; i++)
    {
        this.scene.add (entity.subModels[i]);
    }
};

PhiloGL.O3D.Model.prototype.clone = function ()
{
    var newModel = new PhiloGL.O3D.Model ({
            vertices: this.vertices,
            indices: this.indices,
            normals : this.normals,
            texCoords: this.texCoords,
            material: this.material,
            textures : this.textures,
            program: this.program
        });
    newModel.isproxy = this.isproxy;
    newModel.scale = this.scale;
    newModel.colors = this.colors;
    newModel.lod = this.lod;
    if (this.submodles)
        newModel.submodles = $.map (this.submodles, function (v){ return v.clone();});
    if (this.update)
        newModel.update = this.update;
    newModel.render = this.render;
    return newModel;
};

AecDatabase.prototype.getExtent = function (entity)
{
    var extent;
    for (var i = 0,  l = this.entities.length; i < l; i++)
    {
        extent = MergeExtent (extent, this.entities[i].getExtent ());
    }
    return extent;
};


//PhiloGL.O3D.Model.prototype.worldDraw = function (app)
//{
//    var gl = app.gl;
//    var program = app.program;
//    program.setBuffers({
//            'aVertexPosition': {
//                value: this.vertices,
//                size: 3
//            },
//            'aTextureCoord': {
//                value: this.texCoords,
//                size: 2
//            },
//            "indices": {
//                value:this.indices,
//                bufferType: gl.ELEMENT_ARRAY_BUFFER,
//                size: 1
//            }
//        });
//    program.setBuffer("aVertexPosition").setBuffer("aTextureCoord").setBuffer('indices');
//    program.setTexture (this.textures[0]);
//    // set to repeating mode
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
//    view = theCamera.view;
//    program.setUniform('uMVMatrix', view);
//    program.setUniform('uPMatrix', theCamera.projection);
//    program.setUniform('uSampler', 0);
//    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
//};

function updateProperties (model)
{
    jQuery("#proplist").clearGridData (); //clear the property data
    if (!model)
    {
        return;
    }
    var mydata = [
   {propname : "Name" , value : model.name},
   {propname : "Type" , value : model.type},
   {propname : "Triangles", value : model.facesCount ()}
   ];
   mydata = mydata.concat (model.properties);
   for (var i = 0; i < mydata.length; i++)
   {
       jQuery("#proplist").jqGrid('addRowData', i+1 ,mydata[i]);
   }
}

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

var loadingDialog;

function setupEvents ()
{
    $("#drivepan").click (function () {
            var pos = $(this).offset ();
            var driveDialog = $('#drivecontrol')
            .dialog({
                    autoOpen: true,
                    modal: true,
                    position: [pos.left, pos.top + 30],
                    title: 'Select Alignment to Drive'
                });
        });

    $("#turnon").click(function(){
            $("#objlist").toggle("fast");
            return false;
        });
    //$("#drive").button ({
    //        icons: {
    //            primary: "ui-icon-car"
    //        },
    //        text: false
    //    });
    //$("#stop").button ({
    //        icons: {
    //            primary: "ui-icon-stop"
    //        },
    //        text: false
    //    });

    //Get all the LI from the #tabMenu UL
    $('#tabMenu li').click(function(){

//            //perform the actions when it's not selected
//            if (!$(this).hasClass('selected')) {   
//
//                //remove the selected class from all LI   
//                $('#tabMenu li').removeClass('selected');
//
//                //Reassign the LI
//                $(this).addClass('selected');
//
//                //Hide all the DIV in .boxBody
//                $('.boxBody div.parent').slideUp('1500');
//
//                //Look for the right DIV in boxBody according to the Navigation UL index, therefore, the arrangement is very important.
//                $('.boxBody div.parent:eq(' + $('#tabMenu > li').index(this) + ')').slideDown('1500');

//            }
        }).mouseover(function() {

                //Add and remove class, Personally I dont think this is the right way to do it,
                //if you have better ideas to toggle it, please comment   
                $(this).addClass('mouseover');
                //$(this).removeClass('mouseout');  

            }).mouseout(function() {

                    //Add and remove class
                    //$(this).addClass('mouseout');
                    $(this).removeClass('mouseover');   

                });
            $("#drive").qtip({
                    content: {
                        text: 'Click this button to simulate driving on a road',
                        title: {
                            text: "Drive along a road"
                        }
                    },
                    style: {
                        name: "dark",
                        border : {
                            border : 1,
                            radius : 2
                        }
                    },
                    position: { target: "mouse",
                        adjust: { x: 10, y: 2 }
                    },
                    show: 'mouseover',
                    hide: 'mouseout'
                });
            $("#stop").qtip({
                    content: {
                        text: "Stop the driving",
                        title: {
                            text: "Stop"
                        }
                    },
                    style: {
                        name: "dark",
                        border : {
                            border : 1,
                            radius : 2
                        }
                    },
                    position: { target: "mouse", 
                        adjust: { x: 10, y: 2 }
                    },
                    show: 'mouseover',
                    hide: 'mouseout'
                });
            $("#loadfile").qtip({
                    content: {
                        text: "Select a file from your file store and simulate in the viewer",
                        title: {
                            text: "Load file"
                        }
                    },
                    style: {
                        name: "dark",
                        border : {
                            border : 1,
                            radius : 2
                        }
                    },
                    position: { target: "mouse",
                        adjust: { x: 10, y: 2 }
                    },
                    show: 'mouseover',
                    hide: 'mouseout'
                });

            $("#props").qtip({
                    content: {
                        text: "Show the properties of the selected object",
                        title: {
                            text: "Show properties"
                        }
                    },
                    style: {
                        name: "dark",
                        border : {
                            border : 1,
                            radius : 2
                        }
                    },
                    position: { target: "mouse",
                        adjust: { x: 10, y: 2 }
                    },
                    show: 'mouseover',
                    hide: 'mouseout'
                });
};

function webGLStart() {

    setupEvents ();
    $(".props").click(function(){
            //$(this).addClass('selected');
            $("#objprops").toggle("fast");
            return false;
        });

    loadingDialog = $('<div></div>')
    .html('Please be patient while the LandXML file loads. This may take a moment depending on the size of the LandXML file and the speed of your network connection.')
    .dialog({
            autoOpen: true,
            modal: true,
            title: 'Loading LandXML File...'
        });

    jQuery("#proplist").jqGrid({ datatype: "local",
            height : 300,
            width: 260,
            colNames: ["Property", "Value"],
            colModel : [{name : 'propname', index : 'propname', width: 120, sorttype: 'string'},
            {name : "value", index : "value", width: 140, sorttype: "string"}
        ],
        multiselect: false,
        caption : "Object Properties"
    });

var lastSel;
     $("#objcontainer").jqGrid({ datatype: "local",
        height : 300,
        width: 300,
        colNames: ["Name", "Type", "Visible"], //, "Actions"],
        colModel : [{name : 'Name', index : 'Name', width: 120, sorttype: 'string'},
        {name : "Type", index : "Type", width: 100, sorttype: "string"},
        {name : "Visible", index : "Visible", width: 80, sorttype: "string", align: "center"}
        //{name : "Actions", index : "Actions", width: 75, sortable: false}
        ],
        multiselect: false,
        caption : "Object Lists"
    });


      //Get Model
  new PhiloGL.IO.XHR({
    url: 'Teapot.json',
    onSuccess: function(text) {
      var json = JSON.parse(text);
      json.colors = [0, 0, 1, 1];
      json.textures = 'teapot.jpg';
      var teapot = new PhiloGL.O3D.Model(json);
      teapot.program = "3d";
      animateObject(teapot);
    }
  }).send();

function animateObject(teapot) {
   PhiloGL('lesson01-canvas', {
        camera: {
        position: {
            x: 0, y: 0, z: -7
        }
    },
    //cachePosition: false,

    textures:{
        src: ['teapot.jpg', "7.jpg",
        "road.png", "road5.jpg", "road2.png", "images/sky.png"],
        parameters: [{
          name: 'TEXTURE_MAG_FILTER',
          value: "LINEAR"
        }, {
          name: 'TEXTURE_MIN_FILTER',
          value: 'LINEAR_MIPMAP_NEAREST',
          generateMipmap: true
        }]
    },
    onError: function(e) {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {

      var gl = app.gl,
          canvas = app.canvas,
          program = app.program;
          app.camera = new PhiloGL.Camera (60, 1, 0.5, 100000);
          view = new PhiloGL.Mat4;
          camera = app.camera;
          theCamera = app.camera;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      glContext = gl;

      database = new AecDatabase (app);

      $("#loadtree").click (function (e){
              new PhiloGL.IO.XHR({
                      url: 'data/palmtree.dae',
                      onSuccess: function(text) {
                          var xmlDoc = $.parseXML(text);
                          var parser = new PhiloGL.IO.Collada_loader();
                          var geometries = parser.parse (xmlDoc);
                          //app.scene.add (geometries);

                          var textures = $.map (parser.loadedtextures, function(m){return "" + m;});

                          PhiloGL.IO.Textures({
                                  src: textures,
                                  parameters: [{
                                      name: 'TEXTURE_MAG_FILTER',
                                      value: 'LINEAR'
                                  }, {
                                      name: 'TEXTURE_MIN_FILTER',
                                      value: 'LINEAR_MIPMAP_NEAREST',
                                      generateMipmap: true
                                  }],
                                  onComplete: function() {

                                      treeModel = new AecEntity (geometries, "tree");
                                      treeModel.lod = true;
                                      treeModel.pickable = true;
                                      treeModel.scale = new PhiloGL.Vec3(.05, .05, .05);
                                      treeModel.update ();
                                      treeModel.addToDb (database);                                      
                                      //$(geometries).each (function(){
                                      //        treeModel = this;
                                      //        //app.scene.add (this);
                                      //    });
                                      //alert("All images and textures loaded!");
                                      //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                                      //app.scene.render ();
                                  }
                              });
                          //new 
                      }
                  }).send();
          });

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
      
      cube = new PhiloGL.O3D.Cube({
              vertices: [-10, -10, 10,
              10, -10, 10,
              10, 10, 10,
              -10, 10, 10,

              -10, -10, -10,
              -10, 10, -10,
              10, 10, -10,
              10, -10, -10,

              -10, 10, -10,
              -10, 10, 10,
              10, 10, 10,
              10, 10, -10,

              -10, -10, -10,
              10, -10, -10,
              10, -10, 10,
              -10, -10, 10,

              10, -10, -10,
              10, 10, -10,
              10, 10, 10,
              10, -10, 10,

              -10, -10, -10,
              -10, -10, 10,
              -10, 10, 10,
              -10, 10, -10],

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
              20, 21, 22, 20, 22, 23],
              textures: ["images/sky.png"],
          });

      cube.scale = new PhiloGL.Vec3(1000, 1000, 1000);
      cube.update ();
      cube.pickable = false;
      app.scene.add (cube);

       y = 0;
       p = [5588, 3900, 82];
       c = [5650, 3870, 72];
       u = [0, 0, 1];

              $("#planttree").click (function (e){
               if (treeModel && corridor)
               {
                   $(corridor.treepos).each (function ()
                       {
                           $(this).each (function ()
                               {
                                   var newModel = treeModel.clone ();
                                   newModel.position = this;
                                   newModel.update ();
                                   newModel.addToDb (database);
                               });
                           //app.scene.add (newModel);
                       });
                   //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                   //app.scene.render ();
               }
           });

       $("#cleardb").click (function (e){
               database.clear ();
           });

       $("#stat").click (function (e){
              // var log = "";
              // log += "Total Entities: " + database.entities.length + "</br>";
              // log += "Total O3D Models: " + database.scene.models.length + "</br>";
              // $("#logs").html (log);
           });


       var loadDatabaseFromXmlDoc = function (xmlDoc)
       {
           database = new AecDatabase (app);
           var surfacePoints = [];

           $(xmlDoc).find("Surface").each (function ()
               {
                   var surface = {};
                   $(this).find('P').each (function()
                       {
                           var id = parseInt($(this).attr("id"), 10);
                           var pt = $.map($(this).text().split(" "), parseFloat);
                           if (pt.length != 3)
                               console.log ('error');
                           surfacePoints[id] = pt;
                       }
                   );
           var faces = [];
                   $(this).find('F').each (function(){
                           if ($(this).attr('i') != "1")
                           {
                               var pts = $.map($(this).text().split(' '), function(idx)
                                   {
                                       return parseInt (idx, 10);
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

                   var oldRender = app.scene.render;
                   //app.scene.render = function ()
                   //{
                   //}
                   var maxDist = Math.max (Math.abs(maxX - minX), Math.abs(maxY - minY));
                   var uvMatrix = [];
                   $(surfacePoints).each(function (i)
                       {
                           var u = Math.abs ((vertices[i*3] - minX) / maxDist);
                           var v = Math.abs ((vertices[i*3 + 1] - minY) / maxDist);
                           uvMatrix[i] = [u, v];
                       });
                   surface.vertices = vertices;
                   var arrayTemp = new Array(faces.length * 3);
                   var idx = 0;
                   var normals = [];
                   $(faces).each (function (i){
                           if (faces[i].length != 3)
                               console.log ("wrong faces!!!");
                           var face = faces[i];
                           var a = [].slice.call(vertices, face[0] * 3, face[0] * 3 + 3);
                           var b = [].slice.call(vertices, face[1] * 3, face[1] * 3 + 3);
                           var c = [].slice.call(vertices, face[2] * 3, face[2] * 3 + 3);
                           var u = PhiloGL.Vec3.sub (b, a);
                           var v = PhiloGL.Vec3.sub (c, a);
                           var normal = [];
                           normal[0] = (u.y * v.z) - (u.z * v.y);
                           normal[1] = (u.z * v.x) - (u.x * v.z);
                           normal[2] = (u.x * v.y) - (u.y * v.x);
                           normals.push (normal[0]);
                           normals.push (normal[1]);
                           normals.push (normal[2]);

                           $.map(faces[i], function(v) {
                                   arrayTemp[idx++] = v;
                               });
                      });
                   surface.indices = arrayTemp;
                   surface.normals = normals;

                   var textCoords = new Float32Array(surfacePoints.length * 2);
                   var iTexCoords = [0.0, 0.0, 0.0, 1., 1, 1];
                   var factor = 1.0;
                   factor = (maxDist / 64.0 );

                   for (var i = 0; i < surfacePoints.length; i++)
                   {
                       textCoords[i*2] = uvMatrix [i][0] * factor;
                       textCoords[i*2 + 1] = uvMatrix [i][1] * factor;
                   }
                   surface.texCoords = textCoords;
                   surface.textures = ["7.jpg"];
                   //surface.computeNormals =  true;
                   //surface.computeCentroids = true;
                   var surfaceModel = new PhiloGL.O3D.Model(surface);

                   //set buffers with cube data
                   var surfaceEnt = new AecEntity ([surfaceModel], "surface");
                   surfaceEnt.name = $(this).attr ('name');
                   //should be only one definition node
                   $(this).find ('Definition').each (function (){
                           $.each (this.attributes, function (i, attrib){
                                   surfaceEnt.properties.push ( {propname: attrib.name, value : attrib.value});
                               });
                       });
                   surfaceEnt.pickable = true;
                   surfaceEnt.update ();
                   surfaceEnt.addToDb (database);
               });
           $("#alignmentlist").empty ();
           $(xmlDoc).find('Alignment').each (function(){
                   //samplePoints.push (handleAlignment ($(this)));
                   //var value = $(this);
                   var name = $(this).attr("name");
                   $("#alignmentlist").append($('<option></option>').val(name).html(name));
                   var align = handleAlignment ($(this), true);
                   if (align["corridor"])
                   {
                       var corridorEnttity = new AecEntity([align["corridor"] ], "corridor");
                       var corridorNode = $(xmlDoc).find ("Roadway[alignmentRefs='" + name + "']")[0];
                       if (corridorNode)
                       {
                           corridorEnttity.name = $(corridorNode).attr ('name'); 
                           $.each (corridorNode.attributes, function (i, attrib){
                                   if (attrib.name != 'name')
                                       corridorEnttity.properties.push ( {propname: attrib.name, value : attrib.value});
                               });
                       }
                       corridorEnttity.pickable = true;
                       corridorEnttity.update ();
                       corridorEnttity.addToDb (database);
                   }
               });

           $("#drive").unbind ('click');
           $("#drive").click (function (e){
                   $('#drivecontrol').dialog ('close');
                   var align = $(xmlDoc).find ('Alignment[name="' + $("#alignmentlist").val() +'"]');
                   if (!align)
                       alert ("can't find alignment with name: " +$("#alignmentlist").val()); 
                   var align = handleAlignment (align, false);
                   if (align["samplePoints"])
                   {
                       driveWithSamplePoints (align["samplePoints"]);
                   }
           });

       $("#objcontainer").clearGridData (); //clear the property data
       for (var x =0, l =  database.entities.length; x < l; x ++)
       {
           var model = database.entities[x];
           var mydata = {Name: model.name, 
               Type: model.type, 
               Visible: model.visible};
           jQuery("#objcontainer").jqGrid('addRowData', x + 1 ,mydata);
       }
       var ids = $("#objcontainer").jqGrid ("getDataIDs");
       for(var i=0;i < ids.length;i++){ 
           var cl = ids[i]; 
           var rowData = $("#objcontainer").getRowData(cl);
           sclass = "objdisplay";
           if (rowData.Visible != "true")
               sclass += " displayoff";
           be = "<button class='" + sclass + "' type='button' onclick='ObjListEditCell(this, " + cl +")'>";
           $("#objcontainer").jqGrid('setRowData',ids[i],{Visible:be}); 
       }


       return database;
       }

       function adjustCameraByExtent (extent)
       {
           var low = extent[0];
           var high = extent[1];
           var midPoint = $.map (low, function (v, i){
                   return (v + high[i]) / 2.0;
               });
           var low2 = [].concat (low);
           low2[2] = high[2]; 
           var length = PhiloGL.Vec3.distTo (low2, high);
           var z = high[2] + (1.732 * length / 2);
           z = (high[2] + z) / 2;
           theCamera.target = new PhiloGL.Vec3 (midPoint[0], midPoint[1], midPoint[2]);;
           var curIndex = 0;
           var endPos = [midPoint[0], midPoint[1], z];
           var diffs = $.map (low, function (v, i){
                   return (endPos[i] - v) / 100;
               });
           var curPt = low;
           theCamera.up = [0, 1, 0];
           cube.position = new PhiloGL.Vec3(midPoint[0], midPoint[1], midPoint[2]);
           cube.update ();
           var it = setInterval (function ()
               {
                   curIndex++;
                   if (curIndex > 100)
                       clearInterval (it);
                   curPt = $.map (curPt, function (v, i){
                           return v + diffs[i];
                       });
                   theCamera.position = new PhiloGL.Vec3 (curPt[0], curPt[1], curPt[2]);
                   theCamera.update ();
               }, 1000/30);

       };

       $("#loadfile").click (function (e)
           {
               $.ajax ("/landfiles.json",
                   {
                       datatype : "json"
                   }
               ).done (function (data) {
                       $("#dialogdiv").html (""); //clear
                       var listTable = $("<table>");
                       $("#dialogdiv").append (listTable);
                       listTable.append ("<thead><tr><th>Name</th><th>File</th><th> </th></tr></thead>");
                       $(data).each (function (i,v){
                               var theTr = $("<tr>");
                               theTr.append ("<td>" + v.name + "</td>");
                               theTr.append ("<td>" + v.landfilename + "</td>");
                               theTr.append ("<td></td>");
                               var tdFile = $("<button>View</button>");
                               tdFile.click (function ()
                                   {
                                       $("#dialogdiv").html ("loading..."); 
                                       $.ajax (v.landfileurl,
                                           {
                                               dataType : "xml"
                                           }).done (function (data)
                                               {
                                                   $("#dialogdiv").html ("Processing..."); 
                                                   database.clear ();
                                                   database = loadDatabaseFromXmlDoc (data);
                                                   chooseFileDialog.dialog ('close');
                                                   var extent = database.getExtent ();
                                                   adjustCameraByExtent (extent);
                                               })
                                           .fail (function (e, textStatus, errorThrown)
                                               {
                                                   $("#dialogdiv").html ("Error while loading file as xml..."); 
                                               });
                                   });
                               theTr.append (tdFile);
                               listTable.append (theTr);
                           });

                       chooseFileDialog = $('#dialogdiv')
                       .dialog({
                               autoOpen: true,
                               modal: true,
                               title: 'Files List',
                               width: 400,
                               height: 400
                           });
                   })
               .fail (function (e, textStatus, errorThrown) {
                       alert ('fail');
                   });
           });

       camera.view.lookAt (p, c, u);
       var curIndex = 0;
       //drawWorld (app);
       app.scene.camera = theCamera;
       teapot.scale = new PhiloGL.Vec3(.05, .05, .05);
       teapot.rotation= new PhiloGL.Vec3(90, 0, 45);
       teapot.position = theCamera.target;
       teapot.update ();
       app.scene.camera.position = new PhiloGL.Vec3(0, 0, 30);
       app.scene.camera.target = new PhiloGL.Vec3(0, 0, 20);
       app.scene.camera.update ();
       app.scene.render ();

       updateLogs();
       //setInterval(draw, 1000/60);
       var totalFrames = 0;
       var lastTotalFrames = 0;
       function animate() {
           PhiloGL.Fx.requestAnimationFrame( animate );
           gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           app.scene.render ();
           totalFrames ++;
       };

       animate ();
       setInterval (updateLogs, 1000/3);
       var it;
       var itStat;
       var dimFx;
       function doneAnmiation ()
       {
           app.events.picking = true; //enable picking after driving
           clearInterval (it);
           clearInterval (itStat);
           it = undefined;
           itStat = undefined;
       };
       $("#stop").click (function (e){
              // if ($('#stop').val() != 'resume')
              doneAnmiation ();
              // else
              // {
              //     jjit = setInterval(function() {
              //             dimFx.step();
              //         }, 1000 / 60);

              //     $("#stop").val('stop');
              //     $("#stop").text ('stop');
              // }
           });

       var handleDaeData = function (data)
       {
           console.log (data);
       }


       //setInterval(function() {drawWorld(app);}, 1000/60);
       function updateLogs ()
       {
          // function ptToStr(pt)
          // {
          //     return "x="+ pt.x.toFixed(2) + " y=" + pt.y.toFixed(2) + " z=" + pt.z.toFixed(2);
          // }
          // var logs = "Camera pos: "  + ptToStr(theCamera.position) + "<p/>";
          // logs += "Camera target: "  + ptToStr(theCamera.target) + "<p/>";
          // $("#logs").html(logs);
       } 

       function driveWithSamplePoints(smpPts)
       {
           doneAnmiation (); 
           app.events.picking = false;
           var curIndex = 0;
           //create a Fx instance
           //dimFx = new PhiloGL.Fx({
           //        duration: smpPts.length /60 * 1000,
           //        transition: PhiloGL.Fx.Transition.linear,
           //        onCompute: function(delta) {
           //            if (curIndex < (smpPts.length - 1))
           //            {
           //                var nextPt = smpPts[curIndex + 1];
           //                var c = pointFromToDist (smpPts[curIndex], nextPt, 20);
           //                var p = smpPts[curIndex].clone();
           //                c.z = nextPt.z + 10;
           //                p.z += 15;
           //                theCamera.position = p;
           //                theCamera.up = u;
           //                theCamera.target = c;
           //                theCamera.update ();
           //                //teapot.position = theCamera.target.clone ();
           //               // if (treeModel)
           //               // {
           //               //     treeModel.position = theCamera.target.clone ();
           //               //     treeModel.position.z += 2.5;
           //               //     //treeModel.update ();
           //               // }
           //                //teapot.position.z += 2.0;
           //                //teapot.scale = [10.1, 10.1, 20.1];
           //                //teapot.scale = [0.01, 0.01, 0.01];
           //                //teapot.update();
           //                //theCamera.view.lookAt (p, c, u);
           //                //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
           //                //app.scene.render ();
           //                totalFrames ++;
           //                //drawWorld (app);
           //                curIndex ++;
           //            }
           //        },
           //        onComplete: function() {
           //            // do the annomation
           //            clearInterval (it);
           //            clearInterval (itStat);
           //        }
           //    });

           function updateCamera ()
           {
               if (!it)
                   return;
               if (curIndex < (smpPts.length - 1))
                   var nextPt = smpPts[curIndex + 1];
               else
               {
                   doneAnmiation ();
                   return;
               }
               var c = pointFromToDist (smpPts[curIndex], nextPt, 20);
               var p = smpPts[curIndex].clone();
               c.z = nextPt.z + 10;
               p.z += 15;
               theCamera.position = p;
               theCamera.up = [0, 0, 1];
               theCamera.target = c;
               theCamera.update ();
               curIndex ++;
           };

           //start the animation with custom `from` and `to` properties.
           //dimFx.start({
           //        from: 0,
           //        to: smpPts.length - 2 
           //    });

           $("#stop").val('stop');

           totalFrames = 0;
           lastTotalFrames = 0;
           itStat = setInterval (function (){
                   var frames = totalFrames - lastTotalFrames;
                   lastTotalFrames = totalFrames;
                   $('#logs').html ("frames: " + frames + " fps");
               }, 1000);
           //PhiloGL.Fx.requestAnimationFrame (function callback(){
           //        dimFx.step ();
           //        PhiloGL.Fx.requestAnimationFrame (callback);
           //    });
           
           it = setInterval (updateCamera, 1000.0/60.0);
           //it = setInterval(function() {
           //        dimFx.step();
           //    }, 1000 );
           //PhiloGL.Fx.requestAnimationFrame( animate );
       }
    },
     events: {
         picking : true,
         //lazyPicking: true,
         onClick: function (e, model)
         {
             //surface.uniforms.colorUfm = [1, 1, 1, 1];
             //this.app.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
             //this.scene.render ();
             //var model = this.scene.pick (e.x, e.y);
             if (model)
             {
                 //console.log (e.x + ", " +  e.y);
                 var p = model.parentEnt;
                 var ndcx = e.x * 2 / this.canvas.width;
                 var ndcy = e.y * 2 / this.canvas.height;
                 var ray = PhiloGL.MakeRay (camera, ndcx, ndcy);
                 ray.intersectObject (model);
                 //model.uniforms.colorUfm = [1, 1, 1, 1];
                 //var points = [];
                 //var faces = [];
                 //for (var i = 0, indices = model.indices, l = model.indices.length / 3; i < l; i++)
                 //{
                 //    function checkAndComputePoint (ind)
                 //    {
                 //        if(points[ind])
                 //            return points[ind];
                 //        points[ind] = [model.vertices[ind * 3], model.vertices[ind * 3 + 1], model.vertices[ind * 3 + 2] ];
                 //        return points[ind];
                 //    };
                 //    var pt1 = checkAndComputePoint (indices[i * 3]);
                 //    var pt2 = checkAndComputePoint (indices[i * 3 + 1]);
                 //    var pt3 = checkAndComputePoint (indices[i * 3 + 2]);
                 //    faces.push ([pt1, pt2, pt3]);
                 //}

                 //var camera = this.camera;
                 //var mWorld = camera.view.mulMat4 (cube.matrix);
                 //var mPv1 = camera.projection.mulMat4 (mWorld);
                 //var dist1 = PhiloGL.Vec3.distTo (camera.position, camera.target);
                 //var width =  2 * Math.tan ((Math.PI * camera.fov / 360)) * dist1;
                 //var scaleDim = this.canvas.width / width;
                 ////scaleDim = scaleDim * 2 / camera.projection[0];
                 ////mPv = mPv1.scale (this.canvas.width / width, this.canvas.height / width, 1);
                 //faces2 = faces.map (function (v){
                 //        return v.map (function (pt){
                 //                var pt2 = mPv1.mulVec3 (pt);
                 //                pt2[0] *= scaleDim;
                 //                pt2[1] *= scaleDim;
                 //                return pt2;
                 //            });
                 //    });
                 ////
                 //// need to work on...
                 ////
                 //var thex =  e.x;
                 //var they =  e.y;
                 //for (i = 0, l = faces2.length; i < l; i++)
                 //{
                 //    var pts = faces2[i];
                 //    //console.log (' p (' + pts[0][0] + ", " + pts[0][1] + ")");
                 //    if (isPointInTriangle ([thex, they, 0], pts[0], pts[1], pts[2]))
                 //        {
                 //            console.log ("point is in triangle...", pts);
                 //        }
                 //}
                 //console.log (p.type + " was picked");
             }
             updateProperties (p);
         },
         onMouseEnter: function(e, model) {
             model.uniforms.colorUfm = [1, 1, 1, 1];
         },
         onMouseLeave: function(e, model) {
             model.uniforms.colorUfm = [0.5, 0.5, 0.5, 1];
         },
         onMouseMove : function (e)
         {
             $("#logs").html("" + e.x +", " + e.y);
         },
         onDragStart: function(e) {
             pos = {
                 x: e.x,
                 y: e.y
             };
         }//,
         //onDragMove: function(e) {
         //    camera = this.camera;
         //    //camera.position.x = pos.x - e.x;
         //    //camera.position.y = pos.y - e.y;
         //    //camera.target.x += e.x - pos.x;
         //    //camera.target.y += e.y - pos.y;
         //    //camera.update ();
         //    //camera.position.y += pos.y - e.y;
         //    camera.view.$translate((e.x - pos.x), e.y - pos.y, 0);
         //    //console.log (camera.position.x, ", ", camera.position.y);
         //    //console.log (e.x - pos.x, " , ", e.y - pos.y);
         //    pos.x = e.x;
         //    pos.y = e.y;
         //    //app.scene.render ();
         //    //drawWorld (this);
         //    //camera.update ();
         //},

         //onMouseWheel: function(e) {
         //    //e.stop();
         //    //var camera = app.scene.camera;
         //    ////camera.position.z += e.wheel;
         //    //camera.view.$translate(0, 0, wheel * 50);
         //    //app.scene.render ();
         //    ////console.log (camera.position.x, ", ", camera.position.y);
         //    ////camera.update();
         //}
     }
  });  
   loadingDialog.dialog ('close');
}
}

function pointFromToDist (ptStart, ptEnd, dist)
{
    var length = ptStart.distTo(ptEnd);
    if (length == 0)
    {
        console.log ('error, dist is 0');
        alert (false);
    }

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
var dblTol = 1e-6;

function fuzzyZero (dblValue)
{
    return (dblValue < -dblTol  ||  dblValue > dblTol) ? false : true;
};

function fuzzyEq (dFirst, dSec)
{
    return fuzzyZero (dFirst - dSec);
};

function fuzzyGreaterEqThan (dFirst, dSec)
{
    var d = dFirst - dSec;
    return d > dblTol || fuzzyEq (dFirst, dSec); ;
};

function fuzzyGreaterThan (dFirst, dSec)
{
    var d = dFirst - dSec;
    return d > dblTol
};

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
            if (fuzzyGreaterEqThan(stn, this.startStn) || fuzzyGreaterEqThan (this.endStn, stn))
                return pointFromToDist (this.ptStart, this.ptEnd, stn - this.startStn);
            else
                console.log ('wrong station passed');
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
            if (!this.bClockwise)
                nDir = nDir.neg ();
            return pointFromDirDist (pt, nDir, offset);
        };
        this.findPtAtStn = function (stn)
        {
            if (fuzzyGreaterEqThan(stn, this.startStn) || fuzzyGreaterEqThan (this.endStn, stn))
            {
                var interval = stn - this.startStn;
                var angle = interval / this.radius;
                if (!this.bClockwise)
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
            }
            else
            {
                console.log ('wrong station passed');
            }
        };
    };

    //
    // construct the object with all arguments passed
    //
    function construct(constructor) {
        function F(args) {
            return constructor.apply(this, args);
        }
        F.prototype = constructor.prototype;
        return new F([].slice.call(arguments, 1));
    }

   var segCreator = {
       Line: construct.bind(null, TheLine),
       Curve: construct.bind (null, TheCurve)
   };

    function Alignment (alignNode)
    {
        this.node = alignNode;
        var stnElvList = [];
        if (this.node.find ('ProfSurf').length > 0)
        {
            stnElvList = $.map (this.node.find ('ProfSurf').find ('PntList2D').text().split(' '), parseFloat);
            if (stnElvList.length % 2 != 0) //station - elevation map
                stnElvList = stnElvList.slice(0, startStn.length - 1);
        }

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
                    if (fuzzyGreaterEqThan (stn , this.startStn)  && fuzzyGreaterEqThan(this.endStn, stn))
                    {
                        geo = this;
                        return false;
                    }
                });
            return geo;
        }
        this.findZAtstation = function (stn)
        {
            //if (stn > 3474)
            //    console.log ("here");
            var stnElvList = this.stnElvList;
            if (this.stnElvList.length <= 0)
                return 0.0;

            var low = 0;
            var high = stnElvList.length / 2;
            var mid;
            while (low <= high)
            {
                mid = parseInt ((low + high) / 2, 10);
                if (fuzzyGreaterThan (stn, stnElvList[mid * 2] ))
                    low = mid + 1;
                else if (fuzzyGreaterThan (stnElvList[mid * 2],  stn))
                high = mid - 1;
                else 
                    return stnElvList[mid * 2 + 1];
            }
            var nextIndex= mid + 1;
            var prevIndex= mid;
            if (fuzzyGreaterThan(stnElvList[mid * 2], stn))
            {
                if (mid > 0)
                    prevIndex = mid - 1;
                nextIndex = mid;
            }

            var elev = stnElvList[mid * 2 + 1];
            if (prevIndex != nextIndex && nextIndex < stnElvList.length)
            {
                var totallength = stnElvList[nextIndex*2] - stnElvList[prevIndex * 2];
                if (totallength != 0)
                {
                    var prevElev = stnElvList[prevIndex*2 + 1];
                    var nextElev = stnElvList[nextIndex*2 + 1];
                    elev = (stn - stnElvList[prevIndex*2]) * nextElev / totallength + (stnElvList[nextIndex*2] - stn) * prevElev / totallength;
                }
            }
            if (isNaN(elev))
                console.log ('getting NaN Elevation value...' + stn);
            return elev;
        };
    };

function buildCorridorFromAlign(alignEnt)
{
    var sections = [];
    var minX, minY, maxX, maxY;
    var isFirst = true;
    var removedIndices = [];
    var sectionPtArrayNew = [];
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
                if (isNaN(offsetAndElev[1]) )
                    console.log ("getting NaN elevation...");
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
        if (isFirst)
        {
            sectionPtArrayNew.push (secPointsArray[0]);
            removedIndices .push (false);
            for (i = 1; i < secPointsArray.length; i++)
            {
                removedIndices.push (secPointsArray[i].offset == secPointsArray[i-1].offset);
                if (secPointsArray[i].offset != secPointsArray[i-1].offset)
                    sectionPtArrayNew.push (secPointsArray[i]);
            }
        }
        else
        {
            sectionPtArrayNew = [];
            for (i = 0; i < secPointsArray.length; i++)
            {
                if (!removedIndices[i])
                    sectionPtArrayNew.push (secPointsArray[i]);
            }
        }
        secPointsArray = sectionPtArrayNew;
        $(secPointsArray).each (function (i) {
                var ptOffset = seg.findXYAtOffset (pt, secPointsArray[i].offset);
                ptOffset.z = secPointsArray[i].elev + ptZCenter + defaultElevOffset;
                secPointsArray[i].point = ptOffset;
                minX = myMin (minX, ptOffset.x);
                minY = myMin (minY, ptOffset.y);
                maxX = myMax (maxX, ptOffset.x);
                maxY = myMax (maxY, ptOffset.y);
            });
        sections.push (secPointsArray);
        isFirst = false;
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

    var treespos = [];

    var dYLast = 0;

    //
    // build the vertex array
    //
    var dYLast = 0.0;
    for (var i = 0; i < sections.length; i++)
    {
        var s =  sections[i];
        if (!s[0])
            continue;
        if (i > 0)
            dYLast += PhiloGL.Vec3.distTo (s[0].point, sections[i - 1][0].point) / 64.0;
        for (var j = 0; j < s.length; j++)
            vertices = vertices.concat ([s[j].point.x, s[j].point.y, s[j].point.z])
        var dS = PhiloGL.Vec3.distTo (s[0].point, s[s.length - 1].point);
        for (var j = 0; j < s.length; j++)
        {
            var u1 = PhiloGL.Vec3.distTo (s[j].point, s[0].point) / dS;
            var v1 = dYLast;
            texCoord.push (u1);
            texCoord.push (v1);
        };
    }

    
    for (var i = 0, lastSectionStart = 0; i < sections.length - 1; i++, lastSectionStart+= s1.length)
    {
        s1 = sections[i];
        s2 = sections[i + 1];
        s2Start = lastSectionStart + s1.length;

        if (s1.length != s2.length)
        {
            alert ('false');
            continue;
        }

        var leftPos = s1[0].point;
        var rightPos = s1[s1.length - 1].point;
        //
        // Make sure the tree are not too crowd
        //
        if (treespos.length == 0 || (PhiloGL.Vec3.distTo (leftPos, treespos[treespos.length - 1][0]) > 50 && PhiloGL.Vec3.distTo (rightPos, treespos[treespos.length - 1][1]) > 50))
            treespos.push ([leftPos, rightPos]);

        var lS1 = s1[0].point;
        var rS1 = s1[s1.length - 1].point;
        var dS1 = PhiloGL.Vec3.distTo (lS1, rS1);
        var lS2 = s2[0].point;
        var rS2 = s2[s2.length - 1].point;
        var dS2 = PhiloGL.Vec3.distTo (lS2, rS2);
        var dBetween = PhiloGL.Vec3.distTo (lS1, lS2);
        dNext = dBetween / 64.0 + dYLast;

        //vertices = vertices.concat ([s1[0].point.x, s1[0].point.y, s1[0].point.z, 
            //s2[0].point.x, s2[0].point.y, s2[0].point.z]);
        //texCoord = texCoord.concat ([0.0, dYLast, 0.0, dNext]);
        for (var j = 0; j < s1.length - 1; j++)
        {
            var p1 = s1[j].point;
            var p2 = s1[j + 1].point;
            var p3 = s2[j].point;
            var p4 = s2[j + 1].point;
            vts = [p2.x, p2.y, p2.z, p4.x, p4.y, p4.z];
            //
            //  p2     p4
            //  
            //  p1     p3
            //
            var  tc = [];

            var u1 = PhiloGL.Vec3.distTo (p2, lS1) / dS1;
            var v1 = dYLast;
            var u2 = PhiloGL.Vec3.distTo (p4, lS2) / dS2;
            var v2 = dNext;
            tc = [u1, v1, u2, v2];
            //for (var n = 2; n < 4; n++)
            //{
            //    dMax = dS1;
            //    var leftPos = lS1;
            //    if (n > 1)
            //    {
            //        dMax = dS2;
            //        leftPos = lS2;
            //    }
            //    var u = PhiloGL.Vec3.distTo (vArray[n], leftPos) / dMax;
            //    var v = dYLast;
            //    if (n > 1)
            //        v = dNext;
            //    //var u = Math.abs ((vertices[n*3] - minX) / maxDist) * factor;
            //    //var v = Math.abs ((vertices[n*3 + 1] - minY) / maxDist) * factor;
            //    tc[n*2] = u;
            //    tc[n*2 + 1] = v;
            //}
            //texCoord = texCoord.concat (tc);
            //vertices = vertices.concat (vts);
            var i1 = lastSectionStart + j; //vertices.length / 3 - 4;
            var i2 = s2Start + j;
            var i3 = lastSectionStart + j + 1;
            var i4 = s2Start + j + 1;
            indices = indices.concat ([i1, i2, i3, i2, i3, i4])
            dYLast = dNext;
        }
    }


corridor = new PhiloGL.O3D.Model({
            textures: ["road2.png"],
            vertices: vertices,
            texCoords: texCoord,
            indices: indices,
            program: "3d"
});
    corridor.treepos = treespos;
    //corridor.onBeforeRender = function (program){
    //glContext.clear(glContext.DEPTH_BUFFER_BIT);
    //    glContext.disable (glContext.DEPTH_TEST);
//  //      program.setUniform('alwaysOnTop', true);
    //};
    //corridor.onAfterRender= function (){
    //    glContext.enable(glContext.DEPTH_TEST);
//        program.setUniform('alwaysOnTop', false);
    //};
    return corridor;
}

function handleAlignment (align, buildCorridor)
{
    var alignEnt = new Alignment (align);
    var theCorridor;
    if (buildCorridor)
    {
        theCorridor = buildCorridorFromAlign (alignEnt);
    }
    var ret = { name: align.attr("name") };
    var lSamplePoints = [];
    var startStn = 0.0;
    var endStn = 0.0;
    var stnElvList = $.map (align.find ('ProfSurf').find ('PntList2D').text().split(' '), parseFloat);
    if (stnElvList.length % 2 != 0) //station - elevation map
        stnElvList = stnElvList.slice(0, startStn.length - 1);

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
                    smpPt[i].z = alignEnt.findZAtstation (startStn);
                }
                lSamplePoints = lSamplePoints.concat (smpPt);
                startStn = endStn;
            }
        });
    //
    //
    //
    for (var j = 0; j < 4; j++)
    {
        for (var i = 0, l = lSamplePoints.length - 1; i < l; i++)
        {
            var tiny = 0.25;
            lSamplePoints[i + 1].z = tiny * lSamplePoints[i + 1].z + (1.0 - tiny) * lSamplePoints[i].z;
        }
    }
    ret ["samplePoints"] = lSamplePoints;
    ret ["corridor"] = theCorridor;
    return ret;
}

function isPointInTriangle (p, p1, p2, p3)
{
    var p = new PhiloGL.Vec3 (p[0], p[1], 0);
    var a = new PhiloGL.Vec3 (p1[0], p1[1], 0);
    var b = new PhiloGL.Vec3 (p2[0], p2[1], 0);
    var c = new PhiloGL.Vec3 (p3[0], p3[1], 0);
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
};
