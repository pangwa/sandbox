PhiloGL.IO.Collada_loader = function ()
{
    this.pointarrays = {};

    this.parse = function (xmlDoc, callback)
    {
        var thethis = this;
        var geometries = [];
        $(xmlDoc).find ('instance_geometry').each (function ()
            {
                var geoms = thethis.parseInstanceGeom (xmlDoc, $(this));
                $(geoms).each(function()
                    {
                        var subPart = new PhiloGL.O3D.Model(this);
                        subPart.program = "3d";
                        subPart.scale = new PhiloGL.Vec3(.05, .05, .05);
                        subPart.colors = [1, 1, 1, 1];
                        subPart.update();
                        geometries.push (subPart);
                    });
            });
        return geometries;
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
                        texCoords : textcoords
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
}

