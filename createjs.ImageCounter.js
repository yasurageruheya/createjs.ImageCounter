"use strict";
/** @type {createjs} */
if(typeof createjs === "undefined") window.createjs = {};
const init=()=>
{
	if(typeof createjs.Container === "undefined")
	{
		setTimeout(init, 10);
		return;
	}
	
	/**
	 * @exports ImageCounter as createjs.ImageCounter
	 * @name createjs.ImageCounter
	 */
	class ImageCounter extends createjs.Container
	{
		/**
		 *
		 * @param [sprites] {Object.<createjs.DisplayObject>}
		 */
		constructor(sprites)
		{
			super();
			/** @type {Object.<createjs.DisplayObject>|{}} */
			this.sprites = sprites || {};
			
			/** @type {*} */
			this.text = "";
			
			/** @type {"left"|"center"|"right"} */
			this.textAlign = "left";
			
			/** @type {"bottom"|"middle"|"top"} */
			this.verticalAlign = "bottom";
			
			/** @type {number} */
			this.kerning = 0;
			
			/**
			 * @private
			 * @type {Object.<Array.<createjs.DisplayObject>>|{}}
			 **/
			this._pool = {};
			
			/** @type {createjs.DisplayObject[]} */
			const displays = [];
			
			let prevText = "";
			
			/**
			 *
			 * @param event {createjs.Event}
			 */
			const addedHandler=(event)=>
			{
				this.stage.addEventListener("drawstart", drawStartHandler);
				this.removeEventListener(event.type, addedHandler);
				this.addEventListener("removed", removedHandler);
			};
			
			/**
			 *
			 * @param event {createjs.Event}
			 */
			const drawStartHandler=(event)=>
			{
				/** @type {string} */
				const text = this.text;
				/** @type {string} */
				const prev = prevText;
				
				if(prev !== text)
				{
					/** @type {number} */
					let totalWidth = 0;
					/** @type {number} */
					let maxHeight = 0;
					/** @type {number} */
					let width;
					/** @type {number} */
					const len = text.length;
					/** @type {number[]} */
					const widths = [];
					/** @type {number[]} */
					const heights = [];
					/** @type {Object<Array<createjs.DisplayObject>>|{}} */
					const pool = this._pool;
					
					displays.reverse();
					for(let i=prev.length;i>0;)
					{
						/** @type {string} */
						const charAt = prev[--i];
						/** @type {createjs.DisplayObject} */
						const displayObject = displays.pop();
						this.removeChild(displayObject);
						pool[charAt].push(displayObject);
					}
					
					prevText = text;
					
					for(let i=len;i>0;)
					{
						/** @type {string} */
						const charAt = text[--i];
						/** @type {createjs.DisplayObject} */
						let displayObject;
						
						if(pool[charAt][0]) displayObject = pool[charAt].pop();
						else displayObject = this.sprites[charAt].clone();
						
						displays.push(displayObject);
						/** @type {createjs.Rectangle} */
						const bounds = displayObject.getBounds();
						totalWidth += bounds.width;
						widths.push(bounds.width + this.kerning);
						heights.push(bounds.height);
						if(maxHeight < bounds.height) maxHeight = bounds.height;
						
						this.addChild(displayObject);
					}
					
					switch(this.textAlign)
					{
						case "center":
							width = totalWidth * .5;
							break;
						case "right":
							width = -totalWidth;
							break;
						default :
							width = 0;
					}
					
					switch(this.verticalAlign)
					{
						case "middle":
							for(let i=len;i>0;)
							{
								/** @type {createjs.DisplayObject} */
								const displayObject = displays[--i];
								displayObject.x = width;
								width += widths[i];
								displayObject.y = (maxHeight - heights[i]) * .5;
							}
							break;
						case "top":
							for(let i=len;i>0;)
							{
								/** @type {createjs.DisplayObject} */
								const displayObject = displays[--i];
								displayObject.x = width;
								width += widths[i];
								displayObject.y = 0;
							}
							break;
						default :
							for(let i=len;i>0;)
							{
								const displayObject = displays[--i];
								displayObject.x = width;
								width += widths[i];
								displayObject.y = maxHeight - heights[i];
							}
					}
				}
			};
			
			/**
			 *
			 * @param event {createjs.Event}
			 */
			const removedHandler=(event)=>
			{
				this.removeEventListener(event.type, removedHandler);
				this.addEventListener("added", addedHandler);
				this.stage.removeEventListener("drawstart", drawStartHandler);
			};
			this.addEventListener("added", addedHandler);
		}
		
		/**
		 *
		 * @param str {string}
		 * @param image {createjs.DisplayObject}
		 * @return {createjs.ImageCounter}
		 */
		register(str, image)
		{
			this.sprites[str] = image;
			this._pool[str] = [];
			return this;
		}
		
		/**
		 *
		 * @param str {string}
		 * @return {createjs.ImageCounter}
		 */
		unregister(str)
		{
			delete this.sprites[str];
			delete this._pool[str];
			return this;
		}
	}
	
	createjs.ImageCounter = ImageCounter;
};
init();
