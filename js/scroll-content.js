function ScrollContent(element,delegate,autoMouse) {
	this.delegate = delegate;
	this.element = element;

	this.maxHeight = 450;
	this.scrolling = false;
	this.scrollerHeight = 0;

	this.height = 0;
	this.contentHeight = 0;

	this.ypos = 0;
	this.maxScroll = 0;

	this.sy = 0;
	this.mouseTop = 0;
	this.mouse = false;
	this.mouseHeight = 0;
	this.autoMouse = autoMouse;
	this.mouseParentHeight = false;

	this.busy = false;

	this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints;

	var self = this;
	this.on_mouse_wheel = function (e) {
		self.mouse_wheel(e);
	};

	this.init();
};

ScrollContent.prototype.init = function () {
	this.scroll_box = this.element.find('.js-scroll-box');
	this.content = this.element.find('.js-scroll-text');
	this.scroller = this.element.find('.js-scroller');
	this.mouse = this.element.find('.js-mouse');

	if (this.scroller.length) {
		this.scroller = false;
	}

	this.resize();

	var self = this;

	this.scroll_box.mousewheel(this.on_mouse_wheel);

	if( this.isTouch ) {
		setTouchEvent({
			prevent: true,
			touchSurface: this.scroll_box,
			onStart: function (options) {
				options.ypos = self.ypos;
			},
			onMove: function (options) {
				self.ypos = options.ypos + options.distanceY;
				self.update_positions();
			},
			onEnd: function (options) {
				self.ypos = options.ypos + options.distanceY;
				self.update_positions();
			}
		});
	}

	if( this.mouse && this.autoMouse ) {
		this.on_mouse_mouse_handler = function(e){ self.on_mouse_mouse(e); }
		this.mouse.bind('mousedown',this.on_mouse_mouse_handler);

		if( this.isTouch ) {
			setTouchEvent({
				prevent : true,
				touchSurface : this.mouse,
				onStart : function(options) {
					options.sy = self.ypos;
				},
				onMove : function(options){
					var top = Math.min((self.mouseParentHeight - self.mouseHeight),Math.max(0,self.mouseTop + ( options.distanceY ))),
						prc = top / (self.mouseParentHeight - self.mouseHeight);
					self.mouse.css({ top : top });
					self.set_prc(prc);
				},
				onEnd : function(options){
					var top = Math.min((self.mouseParentHeight - self.mouseHeight),Math.max(0,self.mouseTop + ( options.distanceY ))),
						prc = top / (self.mouseParentHeight - self.mouseHeight);
					self.mouse.css({ top : top });
					self.set_prc(prc);
					self.mouseTop = top;
				}
			});
		}
	}
};

ScrollContent.prototype.on_mouse_mouse = function(e) {
	var self = this;
	e.preventDefault();
	e.stopPropagation();
	switch(e.type) {
		case 'mousedown':
			this.sy = e.pageY;
			$(window).bind('mousemove mouseup',this.on_mouse_mouse_handler);
			break;
		case 'mousemove':
		case 'mouseup':
			var top = Math.min((this.mouseParentHeight - this.mouseHeight),Math.max(0,this.mouseTop + ( e.pageY - this.sy ))),
				prc = top / (this.mouseParentHeight - this.mouseHeight);
				this.mouse.css({ top : top });
				this.set_prc(prc);
			if( e.type == 'mouseup' ) {
				this.mouseTop = top;
				$(window).unbind('mousemove mouseup',this.on_mouse_mouse_handler);
			}
			break;
	}
};

ScrollContent.prototype.resize = function () {
	this.maxHeight = this.scroll_box.height();
	this.contentHeight = this.content.outerHeight(true);
	this.scrolling = this.contentHeight > this.maxHeight;

	this.ypos = 0;
	this.content.css({top: this.ypos});
	this.height = this.maxHeight;

	if (this.scrolling) {
		this.element.addClass('scrolling');
		this.maxScroll = -(this.contentHeight - this.height);

		if( this.scroller ) {
			this.scrollerHeight = Math.round(this.height / this.contentHeight * 100);
			this.scroller.css({height: this.scrollerHeight + '%'});
		}
	}else{
		this.element.removeClass('scrolling');
		this.maxScroll = 0;
	}

	if( this.autoMouse ) {
		this.mouse.css({top:0});
		this.mouseTop = 0;
		this.mouseHeight = this.mouse.height();
		this.mouseParentHeight = this.mouse.parent().height();
	}
};

ScrollContent.prototype.scroll_to = function(elm) {
	if( !this.scrolling ) {
		return;
	}
	var self = this, pos = elm.position().top;
	this.ypos = Math.min(0,Math.max(Math.round(( this.height - elm.outerHeight(true) ) / 2) - pos,this.maxScroll));
	this.busy = true;
	this.content.animate({ top : this.ypos },{
		duration : 700,
		easing : 'swing',
		step : function( currentTop ) {
			var prc = Math.abs(currentTop / self.maxScroll);
			if( self.delegate ) {
				self.delegate.set_scroll_prc(prc);
			}
		},
		complete : function(){
			self.busy = false;
		}
	});
};

ScrollContent.prototype.set_prc = function(prc) {
	this.ypos = Math.round(this.maxScroll * prc);
	this.content.stop().css({ top : this.ypos });
};

ScrollContent.prototype.mouse_wheel = function (e) {
	if (!this.scrolling || this.busy) {
		return;
	}

	e.preventDefault();
	e.stopPropagation();

	this.ypos += e.deltaY * 30;

	this.update_positions();
};

ScrollContent.prototype.update_positions = function(){
	this.ypos = Math.max(Math.min(0, this.ypos), this.maxScroll);

	var prc = Math.abs( this.ypos / this.maxScroll );
	if( this.delegate ) {
		this.delegate.set_scroll_prc(prc);
	}

	if( this.mouse && this.autoMouse ) {
		var mouseTop = Math.round(prc * ( this.mouseParentHeight - this.mouseHeight ));
		this.mouse.css({ top : mouseTop });
		this.mouseTop = mouseTop;
	}

	this.content.css({top: this.ypos});

	if( this.scroller ) {
		var scrollerTop = ( ( this.ypos / this.maxScroll ) * ( ( 100 - this.scrollerHeight ) / 100 ) ) * 100;
		this.scroller.css({top: scrollerTop + '%'});
	}
};