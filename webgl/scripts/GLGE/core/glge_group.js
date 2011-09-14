/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_quicknote.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @constant 
* @description Enumeration for node group type
*/
GLGE.G_NODE=1;
/**
* @constant 
* @description Enumeration for root group type
*/
GLGE.G_ROOT=2;
/**
* @class Group class to allow object transform hierarchies 
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Group=function(uid){
	GLGE.Assets.registerAsset(this,uid);
	this.children=[];
}
GLGE.augment(GLGE.Placeable,GLGE.Group);
GLGE.augment(GLGE.Animatable,GLGE.Group);
GLGE.augment(GLGE.QuickNotation,GLGE.Group);
GLGE.augment(GLGE.JSONLoader,GLGE.Group);
GLGE.Group.prototype.children=null;
GLGE.Group.prototype.className="Group";
GLGE.Group.prototype.type=GLGE.G_NODE;
/**
* Sets the action for this Group
* @param {GLGE.Action} action the action to apply
*/
GLGE.Group.prototype.setAction=function(action,blendTime,loop){
	action.start(blendTime,loop,this.getNames());
	return this;
}
/**
* Gets the name of the object and names of any sub objects
* @returns an object of name
*/
GLGE.Group.prototype.getNames=function(names){
	if(!names) names={};
	var thisname=this.getName();
	if(thisname!="") names[thisname]=this;
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].getNames){
			this.children[i].getNames(names);
		}
	}
	return names;
}
/**
* Gets the bounding volume for this group
* @returns {GLGE.BoundingVolume} 
*/
GLGE.Group.prototype.getBoundingVolume=function(local){
	this.boundingVolume=null;
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].getBoundingVolume){
			if(!this.boundingVolume) {
				this.boundingVolume=this.children[i].getBoundingVolume(true).clone();
			}else{
				this.boundingVolume.addBoundingVolume(this.children[i].getBoundingVolume(true));
			}
		}
	}
	if(!this.boundingVolume) this.boundingVolume=new GLGE.BoundingVolume(0,0,0,0,0,0);
	if(local){
		this.boundingVolume.applyMatrix(this.getLocalMatrix());
	}else{
		this.boundingVolume.applyMatrix(this.getModelMatrix());
	}
	
	return this.boundingVolume;
}
/**
* Gets a list of all objects in this group
* @param {array} pointer to an array [optional]
* @returns {GLGE.Object[]} an array of GLGE.Objects
*/
GLGE.Group.prototype.getObjects=function(objects){
	if(this.lookAt) this.Lookat(this.lookAt);
	if(this.animation) this.animate();

	if(!objects) objects=[];
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].className=="Object" || this.children[i].className=="Text" || this.children[i].toRender){
		if(this.children[i].renderFirst) objects.unshift(this.children[i]);
			else	objects.push(this.children[i]);
		}else if(this.children[i].getObjects){
			this.children[i].getObjects(objects);
		}
	}
	return objects;
}
/**
* Gets a list of all lights in this group
* @param {array} pointer to an array [optional]
* @returns {GLGE.Lights[]} an array of GLGE.Lights
*/
GLGE.Group.prototype.getLights=function(lights){
	if(!lights) lights=[];
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].className=="Light"){
			lights.push(this.children[i]);
		}else if(this.children[i].getLights){
			this.children[i].getLights(lights);
		}
	}
	return lights;
}


/**
* Adds a new object to this group
* @param {object} object the object to add to this group
*/
GLGE.Group.prototype.addChild=function(object){
	if(object.parent) object.parent.removeChild(object);
	object.matrix=null; //clear any cache
	object.parent=this;
	this.children.push(object);
	//if the child added contains lights or is a light then we'll need to update shader programs
	if((object.getLights && object.getLights().length>0) || object.className=="Light"){
		var root=object;
		while(root.parent) root=root.parent;
		var objects=root.getObjects();
		for(var i=0;i<objects.length;i++){
			if(objects[i].updateProgram) objects[i].updateProgram();
		}
	}	
	return this;
}
GLGE.Group.prototype.addObject=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addObjectInstance=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addGroup=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addLight=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addText=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addSkeleton=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addCamera=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addWavefront=GLGE.Group.prototype.addChild;


/**
* Removes an object or sub group from this group
* @param {object} object the item to remove
*/
GLGE.Group.prototype.removeChild=function(object){
	for(var i=0;i<this.children.length;i++){
		if(this.children[i]==object){
			this.children.splice(i, 1);
			if(this.scene && this.scene["remove"+object.className]){
				this.scene["remove"+object.className](object);
			}
			break;
		}
	}
}



/**
* Gets an array of all children in this group
*/
GLGE.Group.prototype.getChildren=function(){
	return this.children;
}
/**
* Initiallize all the GL stuff needed to render to screen
* @private
*/
GLGE.Group.prototype.GLInit=function(gl){
	this.gl=gl;
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].GLInit){
			this.children[i].GLInit(gl);
		}
	}
}
/**
* Gets the pickable flag for the object
*/
GLGE.Group.prototype.getPickable=function(){
	return this.pickable;
}
/**
* Sets the pickable flag for the object
* @param {boolean} value the picking flag
*/
GLGE.Group.prototype.setPickable=function(pickable){
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].setPickable){
			this.children[i].setPickable(pickable);
		}
	}
	this.pickable=pickable;
	return this;
}
 

})(GLGE);