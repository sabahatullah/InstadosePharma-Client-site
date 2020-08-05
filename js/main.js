window.menuOpened = false;

var Driller = function(count,start,step,elements_class) {
	this.count = count;
	this.start = new Date(start);
	this.step = step;
	this.element = $('.'+elements_class);
	this.tmr = false;
	this.tick_count = 0;

	this.tick();
};

Driller.prototype.tick = function() {
	var self = this,
		last_count = this.count,
		current = new Date(),
		diff = ( current.getTime() - this.start.getTime() ) / 1000;

	this.count += diff * this.step;
	this.start = current;

	var count = Math.round(this.count);

	if( !this.tick_count ) {
		this.element.text(window.number_format(count,0,'.',' '));
	}else{
		this.element.addClass('changing').prop('number', last_count).animate({
			number: count
		},{
			duration : 1000,
			easing : 'swing',
			step : function(now) {
				$(this).text(window.number_format(now,0,'.',' '));
			},
			complete : function(){
				self.element.removeClass('changing');
			}
		})
	}

	this.tick_count++;

	var delay = (5+Math.round(Math.random()*5));
	this.tmr = setTimeout(function(){ self.tick(); }, delay * 1000);
};



var ContentScaler = function() {
	this.container = $($('.big-wrapper')[0]);
	this.content = $($('.content-wrapper')[0]);
	this.menu_block = $($('.menu-block')[0]);

	this.zoomed_class = 'contentFixed';
	this.direction = 'left';
	this.menu_width = 400;
	this.minex_width = 640;

	this.menuOpenedAtScroll = 0;
	this.padding = 40;
	this.scale_factor = 0.9;
	this.menuOpened = false;

	this.mode = false;

	var self = this;

	$(window).resize(function(){
		if( self.menuOpened ){
			self.resize();
		}
	});

	$('.menu-trigger').click(function(){
		if ( self.menuOpened ){
			self.scale_back();
		} else {
			self.scale_down('menu');
		}
	});

	$('.map-trigger').click(function(){
		if ( self.menuOpened ){
			self.scale_back();
		} else {
			self.scale_down('map');
		}
	});

	this.make_scale_back = function(e) {
		e.preventDefault();
		e.stopPropagation();
		self.scale_back();
	};

	$('.menu-block .close').click(this.make_scale_back);
	$('.fs-map-block .close').click(this.make_scale_back);
};

ContentScaler.prototype.scale_down = function(mode) {

	this.mode = mode || false;

	$(document).bind('mousewheel', function (e) {
		e.preventDefault();
	});

	window.menuOpened = this.menuOpened = true;
	this.menuOpenedAtScroll = $(window).scrollTop();
	this.container.css({
		width : $(window).width(),
		height : $(window).height()
	}).addClass(this.zoomed_class);
	this.content.css({ top : -this.menuOpenedAtScroll });

	this.resize();

	switch(this.mode) {
		case 'minex':
			$('.minex-block').addClass('open');
			$('video.js-minex')[0].play();
			break;
		case 'menu':
			break;
		case 'map':
			$('.fs-map-block').css('visibility','visible');
			break;
	}

	var self = this;
	setTimeout(function(){
		switch(self.mode) {
			case 'menu':
				self.menu_block.addClass('open');
				break;
			case 'map':
				break;
		}
		self.container.bind('click', self.make_scale_back);
	},300);
};

ContentScaler.prototype.scale_back = function(){
	$(document).unbind('mousewheel');
	this.container.unbind('click', this.make_scale_back);

	switch(this.mode) {
		case 'menu':
			this.menu_block.removeClass('open');
			break;
		case 'map':
			break;
	}
	this.container.css({ transform: 'translate(0,0) scale(1)' });

	var self = this;
	setTimeout(function(){
		switch(self.mode) {
			case 'minex':
				$('.minex-block').removeClass('open');
				$('video.js-minex')[0].pause();
				break;
			case 'menu':
				break;
			case 'map':
				$('.fs-map-block').css('visibility','hidden');
				break;
		}
	},500);
	setTimeout(function(){

		self.container.removeClass(self.zoomed_class).css({
			width : '100%',
			height : 'auto',
			transform : ''
		});
		self.content.css({ top : 'auto' });

		$(window).scrollTop(self.menuOpenedAtScroll);

		self.menuOpenedAtScroll = 0;
		window.menuOpened = self.menuOpened = false;

	},600);
};

ContentScaler.prototype.resize = function() {

	this.scale_factor = Math.round( $(window).width() * 0.9 ) / $(window).width();

	var offset = 0;
	switch( this.mode ) {
		case 'minex':
			offset = this.minex_width;
			break;
		case 'map':
			offset = -Math.round( $(window).width() / 2 );
			if( typeof window.content_scaler_map !== 'undefined' && typeof window.content_scaler_maker !== 'undefined' ) {
				window.content_scaler_map.setCenter(window.content_scaler_maker.map_center());
			}
			break;
		default:
			offset = -this.menu_width;
			break;
	}

	this.container.css({
		// height : scaledWindowHeight,
		width : $(window).width(),
		height : $(window).height(),
		transform: 'translate('+ offset +'px,'+0+'px) scale('+this.scale_factor+')'
	});
};



var AgreementOverlay = Overlay.extend({
	create: function(){
		this._super();

		var self = this;
		$('.js-agreement-trigger').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			self.open();
		});
	}
});

function is_touch_device() {
	return 'ontouchstart' in window || navigator.maxTouchPoints;
};

function map_offset_coords(map, latlng, offsetx, offsety) {
	var point1 = map.getProjection().fromLatLngToPoint(
		(latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	);
	var point2 = new google.maps.Point(
		( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
		( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	);

	return map.getProjection().fromPointToLatLng(new google.maps.Point(
		point1.x - point2.x,
		point1.y + point2.y
	));
};


$(document).ready(function(){
	if( is_touch_device() ) { $(document.body).addClass('is-touch-device'); }

	window.content_scaler = new ContentScaler();

	$('.lang-switch .no-active').hover(function(){
		if ($(this).hasClass('rus')){
			$('.lang-brick').removeClass('active-eng').addClass('rus-hover');
			$('.eng').addClass('no-hover');
		} else {
			$('.lang-brick').removeClass('active-rus').addClass('eng-hover');
			$('.rus').addClass('no-hover');
		}
	},function(){
		if ($(this).hasClass('rus')){
			$('.lang-brick').removeClass('rus-hover').addClass('active-eng');
			$('.eng').removeClass('no-hover');
		} else {
			$('.lang-brick').removeClass('eng-hover').addClass('active-rus');
			$('.rus').removeClass('no-hover');
		}
	});

	$('.js-video-trigger-block').each(function(i,elm){ new VideoTrigger({ element: elm }); });

	new Driller(4000000,'01/10/2018 00:00:00',0.05,'m-drill');
	new Driller(71000000,'01/10/2018 00:00:00',1.19,'m-tnt');

	var agreement_overlay_element = $('.js-agreement-overlay');
	if( agreement_overlay_element.length ) { window.agreement_overlay = new AgreementOverlay({ element: agreement_overlay_element }); }

	function on_resize() {
		$('.menu-block').height($(window).height());
		$('#screen').css({ width: $(window).width() });
		$('.footer').css({ margin : 0 });
		var diff = $(window).height() - $(document.body).outerHeight(true);
		if( diff > 0 ) {
			$('.footer').css({ marginTop : diff });
		}
	}

	$('.js-scroll-down').each(function(i,elm){
		var scroll_down = $(elm),
			text = [ scroll_down.find('.js-text1'), scroll_down.find('.js-text2') ],
			active_text = 0,
			active_string = 0,
			wheel = scroll_down.find('.js-wheel');

		text[0].html(scroll_down_strings[0]);

		scroll_down.click(function(){
			$('html, body').animate({scrollTop: ($('.main-block').height() - $('.header').height())}, 'slow');
		});

		// function switch_text() {
		// 	var cur = text[active_text],
		// 		nxt = text[active_text ? 0 : 1];
		//
		// 	if( ++active_string >= scroll_down_strings.length ) {
		// 		active_string = 0;
		// 	}
		//
		// 	nxt.html(scroll_down_strings[active_string]).css({ display: 'block' })
		// 	cur.removeClass('rollIn').addClass('rollOut');
		// 	setTimeout(function(){
		// 		cur.removeClass('rollOut').css({ display: 'none' });
		// 	},400);
		//
		// 	setTimeout(function() {
		// 		nxt.addClass('rollIn');
		// 	},400);
		//
		// 	active_text = active_text ? 0 : 1;
		// }

		$(window).bind('onQueryLoaderLoaded',function(){
			scroll_down.addClass('active');
			// setInterval(switch_text,6000);
		});
	});

	$(window).resize(on_resize);
	on_resize();

	$('.header .numbers div').hover(function() {
		var thisEl = $(this);
		$('.header .bubble' + thisEl.data('bubble')).addClass('hovered');
		if (is_touch_device()){
			setTimeout(function() {
				$('.header .bubble' + thisEl.data('bubble')).removeClass('hovered');
			},3000);
		}
	},function() {
		$('.header .bubble' + $(this).data('bubble')).removeClass('hovered');
	});
});