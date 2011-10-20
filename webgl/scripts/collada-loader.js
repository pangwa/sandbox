PhiloGL.IO.Collada_loader = function ()
{
    this.pointarrays = {};
    this.loadedtextures = {};

    this.parse = function (xmlDoc, callback)
    {
        var thethis = this;
        var geometries = [];
        $(xmlDoc).find ('instance_geometry').each (function ()
            {
                var geoms = thethis.parseInstanceGeom (xmlDoc, $(this));
                $(geoms).each(function()
                    {
                        if (this.material)
                            this.textures = ["~pangwa/" + this.material.source];
                        var subPart = new PhiloGL.O3D.Model(this);
                        subPart.program = "3d";
                        if (this.material)
                            thethis.loadedtextures[this.material.id] = this.material.source;
                        geometries.push (subPart);
                    });
            });
        //var modelHolder = new PhiloGL.O3D.Model ();
        //modelHolder.program = "3d";
        //modelHolder.submodles = geometries;
        //modelHolder.isproxy = true;
        //modelHolder.render = function (gl, program, camera, scene)
        //{
        //    $(this.submodles).each ( function()
        //        {
        //            scene.renderObject(this, program);
        //        });
        //};
        //modelHolder.update = function ()
        //{
        //    var thethis = this;
        //    $(this.submodles).each (function ()
        //        {
        //            this.scale = thethis.scale;
        //            this.position = thethis.position;
        //            this.colors = thethis.colors;
        //            this.update ();
        //        });
        //}
        //modelHolder.scale = new PhiloGL.Vec3(.05, .05, .05);
        //modelHolder.colors = [1, 1, 1, 1];
        //modelHolder.update();
        return  geometries; //[modelHolder]; //geometries;
    };

    this.parseInstanceGeom = function (xmlDoc, node){
        var url = node.attr("url");
        var geomNode = $(xmlDoc).find (url);
        var geometry = this.parseGemoetry (xmlDoc, $(geomNode));
        return geometry;
    };

    this.parseGemoetry = function (xmlDoc, node){
        var pointarrays = this.pointarrays;
        var thethis = this;
        var geometries = [];
        node.find("triangles").each (function()
            {
                var vertix= {offset: 0};
                var normal= {offset: 1};
                var textcoord= {offset: 2};
                var materialname = $(this).attr("material");
                var material;
                if (materialname != "")
                {
                    var materialNode = $(xmlDoc).find("#"+materialname + "ID");
                    material = thethis.parseMaterial (xmlDoc, materialNode);
                }
                $(this).find ('input').each (function(){
                        var offset = parseInt ($(this).attr('offset'), 10);
                        if (thethis.pointarrays[$(this).attr('source')] == undefined)
                        {
                            thethis.pointarrays[$(this).attr('source')] = thethis.parseInputs (xmlDoc, $(xmlDoc).find ($(this).attr('source')));
                        }
                        var semantic = $(this).attr('semantic');
                        if (semantic == "VERTEX")
                        {
                            vertix.varray = thethis.pointarrays[$(this).attr('source')];
                        }else if (semantic == "NORMAL") {
                            normal.varray = thethis.pointarrays[$(this).attr('source')];
                        }else if (semantic == "TEXCOORD")
                            textcoord.varray = thethis.pointarrays[$(this).attr('source')];
                        else
                        {
                            alert ("unhandled input");
                        }
                    });
                var indices = $.map ($(this).find("p").text().trim().split(' '), function(v) {return parseInt(v, 10);});
                var vertIndices = [];
                var normals = [];
                var textcoords = [];
                for (var i = 0; i < indices.length / 3; i++)
                {
                    vertIndices.push (indices[i*3]);
                    var normalIndex = indices [i*3 + 1];
                    var textcoordIndex = indices[i*3 + 2];
                    var thenoraml = normal.varray.slice(normalIndex * 3,(normalIndex + 1) * 3); 
                    normals = normals.concat (thenoraml);
                    textcoords = textcoords.concat (textcoord.varray.slice(textcoordIndex * 2, (textcoordIndex + 1) * 2));
                }
                geometries.push ({vertices : vertix.varray, 
                        indices : vertIndices,
                        normals : normals, 
                        texCoords : textcoords,
                        material : material
                    });
            });
        return geometries;
    };

    this.parseInputs = function (xmlDoc, node) {
        var farray;
        if (node.find ('float_array').length > 0)
            farray = node.find('float_array').text();
        else
        {
            var input = $(xmlDoc).find ($(node).find ('input').attr('source'));
            //this.parseInput (input);
            farray = input.find('float_array').text();
            if (farray == undefined)
                alert ("Can't find a float array node");
        }
        var theArray = $.map (farray.trim().split(' '), parseFloat);
        return theArray;
    };

    this.parseMaterial = function (xmlDoc, node)
    {
        var effect = node.find('instance_effect').attr("url");
        var initfrom = $(xmlDoc).find(effect).find ('init_from');
        if ( initfrom.length > 0)
        {
            var imgid = $(initfrom[0]).text ();
            var source = $(xmlDoc).find("#"+imgid).find ('init_from').text();
            return {id : imgid,
                source : source};
        }
        return;
    }
}

