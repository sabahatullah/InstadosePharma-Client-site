function InfoBubble(pin,map,mode,no_pan)
{
	this.extend(InfoBubble, window.google.maps.OverlayView);

	this.refMap = map;
	this.mode = mode;

	this.no_pan = no_pan || false;

	this.element = false;
	this.arrow = false;
	this.content = false;
	this.closeBtn = false;

	this.cancelDraggingOnOpen = false;
	this.hidePinOnOpen = false;

	this.cluster = false;

	this.opened = false;

	switch( this.mode ) {
		case 'cluster':
			this.cluster = pin;
			this.pos = pin.getCenter();
			this.cancelDraggingOnOpen = true;
			break;
		case 'contact':
			this.pin = pin;
			this.pos = pin.getPosition();
			this.hidePinOnOpen = true;
			break;
		case 'project':
		default:
			this.pin = pin;
			this.pos = new window.google.maps.LatLng(pin.lat,pin.lng);
			this.cancelDraggingOnOpen = true;
			break;
	}
};

InfoBubble.prototype.extend = function(obj1, obj2) {
	return (function(object) {
		for (var property in object.prototype)
			this.prototype[property] = object.prototype[property];
		return this;
	}).apply(obj1, [obj2]);
};

InfoBubble.prototype.onRemove = function() {
	this.element.remove();
	this.element = false;
};

InfoBubble.prototype.onAdd = function() {
	if(!this.element) {
		var self = this;
		var element = $('<div>').addClass('InfoBubble ' + this.mode);
		this.arrow = $('<div>').addClass('infoBubbleArrow').appendTo(element);
		this.content = $('<div>').addClass('infoBubbleCnt').appendTo(element);
		this.wndScroll = false;

		this.wnd = $('<div>').addClass('infoBubbleWnd').appendTo(this.content);

		var with_scroll = false, with_close = false;
		var html = '<div class="content">';

		switch( this.mode ) {
			case 'cluster':
				var markers = this.cluster.getMarkers();
				for(var i=0;i<markers.length;i++) {
					html += '<div class="item"><div class="info"><h3>'+markers[i].title+'</h3><p>РћРїРёСЃР°РЅРёРµ РїСЂРѕРµРєС‚Р°<p><div class="line"></div></div></div>';
				}
				with_scroll = true;
				break;
			case 'contact':
				html += this.pin.address;
				with_close = true;
				break;
			default:
				html += '<div class="item"><div class="info"><div class="ttl">'+i18n_coords+'</div><div class="txt hover">'+this.pin.description+'<p><div class="info"><div class="ttl">'+i18n_customer+'</div><div class="txt small">'+this.pin.client+'</div><div class="line"></div></div></div>';
				break;
		}

		html += '</div>';

		if( with_scroll ) {
			html += '<div class="scroller"></div>';
		}

		this.wnd.html(html);

		if( with_scroll ) {
			this.wndScroll = new infoBubbleScroll(this.wnd);
		}

		switch( this.mode ) {
			case 'project':
				element.click(function(e){
					e.preventDefault();
					e.stopPropagation();

					if( typeof window.projects_list !== 'undefined' ) {
						window.projects_list.focus_project(self.pin.alias);
					}
				});
				break;
			case 'contact':
				element.bind('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					self.close();
				});
				break;
		}

		if( with_close ) {
			this.closeBtn = $('<div>').addClass('infoBubbleClose').appendTo(this.content);
			this.closeBtn.bind('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				self.close();
			});
		}

		this.element = element;

		var panes = this.getPanes();
		panes.floatPane.appendChild(this.element[0]);
	}

	var new_map_center = this.pos;
	if( typeof this.pin !== 'undefined' && typeof this.pin.map_center === 'function' ) {
		new_map_center = this.pin.map_center();
	}

	if( !this.no_pan ) {
		this.map.panTo(new_map_center);
	}
};

InfoBubble.prototype.draw = function() {
	this.repos();
};

InfoBubble.prototype.repos = function() {
	var overlayProjection = this.getProjection(),
		position = overlayProjection.fromLatLngToDivPixel(this.pos);

	// var containerPosition = overlayProjection.fromLatLngToContainerPixel(this.pos);

	switch( this.mode ) {
		case 'contact':
			this.element.css({
				left : Math.round(position.x),
				top : Math.round(position.y - 14),
				zIndex : 1000
			});
			break;
		default:
			this.element.css({
				left : Math.round(position.x + ( ( this.mode === 'cluster' ) ? 10 : 20 )),
				top : Math.round(position.y + ( ( this.mode === 'cluster' ) ? -10 : 8 )),
				zIndex : 1000
			});
			break;
	}

	if( this.wndScroll ) {
		this.wndScroll.resize();
	}

	switch( this.mode ) {
		case 'contact':
			this.content.css({
				top : -Math.round(this.content.height()),
				left : -Math.round(this.content.width() / 2)
			});
			break;
		default:
			this.content.css({ top : -Math.round(this.content.outerHeight(true) / 2) - 8 });
			break;
	}

}

InfoBubble.prototype.open = function(cb) {
	this.setMap(this.refMap);

	if( this.hidePinOnOpen ) {
		if( this.pin ) { this.pin.setMap(null); }
		else if( this.cluster ) { this.cluster.clusterIcon_.hide(); }
	}

	this.open_(cb);
	return true;
};

InfoBubble.prototype.open_ = function(cb) {
	var self = this,
		interval = setInterval(function(){
			if( self.element ){
				clearInterval(interval);
				interval = null;

				self.element.css({ display : 'block' });
				self.wnd.css({ position: 'absolute' });
				self.content.css({ width : Math.min(350,self.wnd.outerWidth(true)) });
				self.wnd.css({ position: 'relative' });

				if( self.cancelDraggingOnOpen ) {
					self.refMap.setOptions({ draggable : false });
				}

				self.opened = true;

				if( typeof cb === 'function' ) {
					cb();
				}
			}
		},50);
};

InfoBubble.prototype.close = function(cb) {
	var self = this,
		interval = setInterval(function(){
			if( self.element ){
				clearInterval(interval);

				self.element.css({ display : 'none' });

				if( self.hidePinOnOpen ) {
					if( self.pin ) { self.pin.setMap(self.refMap); }
					else if( self.cluster ) { self.cluster.clusterIcon_.show(); }
				}

				if( self.cancelDraggingOnOpen ) {
					self.refMap.setOptions({draggable: true});
				}

				self.opened = false;

				self.close_(cb);
			}
		},50);

	return true;
};

InfoBubble.prototype.getPosition = function() {
	return this.pos;
};


InfoBubble.prototype.close_ = function(cb) {
	this.setMap(null);

	if( typeof cb === 'function' ) {
		cb();
	}

	return true;
};



function infoBubbleScroll(element) {
	this.element = element;

	this.maxHeight = 450;
	this.scrolling = false;
	this.scrollerHeight = 0;

	this.height = 0;
	this.contentHeight = 0;

	this.ypos = 0;
	this.maxScroll = 0;

	this.init();
}

infoBubbleScroll.prototype.init = function() {
	this.scroller = this.element.find('.scroller');
	this.content = this.element.find('.content');

	// this.resize();
}

infoBubbleScroll.prototype.resize = function(){
	this.element.css({ height : 'auto' });
	this.contentHeight = this.content.outerHeight(true);
	if( this.contentHeight > this.maxHeight ) {
		this.element.addClass('scrolling');
		this.element.css({ height : this.maxHeight });
		this.height = this.maxHeight;
		this.maxScroll = -(this.contentHeight - this.height);

		if( !this.scrolling ) {
			this.scrolling = true;
			this.scrollerHeight = Math.round(this.height / this.contentHeight * 100)
			this.scroller.css({ height : this.scrollerHeight + '%' });

			var self = this;
			this.element.mousewheel(function(e){
				e.preventDefault();
				e.stopPropagation();

				self.ypos += e.deltaY * 30;
				self.ypos = Math.max(Math.min(0,self.ypos), self.maxScroll);

				self.content.css({ top : self.ypos });

				var scrollerTop = ( ( self.ypos / self.maxScroll ) * ( ( 100 - self.scrollerHeight ) / 100 ) ) * 100;
				self.scroller.css({ top : scrollerTop + '%' });

			});
		}
	}
}