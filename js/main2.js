(function(){
	var screen = $('#screen'),
		content = $('#content');

	window.contentFixed = false;
	window.contentFixedAt = 0;
	window.setFixedContent = function(dir) {
		if( window.contentFixed === dir ) { return false; }
		if(dir){

			this.contentFixedAt = $(window).scrollTop();

			screen.css({
				position: 'fixed',
				width: $(window).width(),
				height: $(window).height()
			});

			screen.addClass('contentFixed');
			content.css({ top: -window.contentFixedAt });
			window.contentFixed = true;
			window.scrollTo(0,0);
		}else{
			screen.removeClass('contentFixed').css({ position: '', height: '' });
			content.css({ top: '' });
			window.scrollTo(0,window.contentFixedAt);
			window.contentFixed = false;
			window.contentFixedAt = 0;
		}
		return true;
	};
})();

window.setTouchEvent = function(touchOptions) {
	var touchSurface = touchOptions.touchSurface;

	$(touchSurface).bind('touchstart', function(e){
		var touchEvent = e.originalEvent;

		touchOptions.distanceX = 0;
		touchOptions.distanceY = 0;

		touchOptions.locked = false;

		if (touchEvent.touches.length != 1) return false;

		if(touchOptions.prevent || touchOptions.preventStart || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
			touchEvent.preventDefault();
			touchEvent.stopPropagation();
		}

		var windowWidthHalf = Math.round( $(window).width() / 2 );

		var currentTouchPosition, startTouchPosition,
			startTime = (new Date()).getTime();

		currentTouchPosition = startTouchPosition = { top: touchEvent.touches[0].clientY, left: touchEvent.touches[0].clientX };

		if( typeof touchOptions.onStart == 'function' ) {
			touchOptions.onStart(touchOptions);
		}

		$(touchSurface).bind('touchmove',function(e){
			touchEvent = e.originalEvent;
			if (touchEvent.touches.length != 1) return false;

			if(touchOptions.prevent || touchOptions.preventMove || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
				touchEvent.preventDefault();
				touchEvent.stopPropagation();
			}

			currentTouchPosition = { top: touchEvent.touches[0].clientY, left: touchEvent.touches[0].clientX };

			touchOptions.prevDistanceX = touchOptions.distanceX;
			touchOptions.prevDistanceY = touchOptions.distanceY;
			touchOptions.distanceX = currentTouchPosition.left - startTouchPosition.left;
			touchOptions.distanceY = currentTouchPosition.top - startTouchPosition.top;
			touchOptions.movedX = touchOptions.distanceX - touchOptions.prevDistanceX;
			touchOptions.movedY = touchOptions.distanceY - touchOptions.prevDistanceY;

			if(touchOptions.onMove)
				touchOptions.onMove(touchOptions);
		});


		$(touchSurface).bind('touchend',function(e){
			touchEvent = e.originalEvent;

			if(touchOptions.prevent || touchOptions.preventEnd || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
				touchEvent.preventDefault();
				touchEvent.stopPropagation();
			}

			var newTime = (new Date()).getTime();
			if(touchOptions.onEnd)
			{
				touchOptions.dTime = newTime - startTime;
				touchOptions.prevDistanceX = touchOptions.distanceX || 0;
				touchOptions.prevDistanceY = touchOptions.distanceY || 0;
				touchOptions.distanceX = currentTouchPosition.left - startTouchPosition.left;
				touchOptions.distanceY = currentTouchPosition.top - startTouchPosition.top;
				touchOptions.movedX = touchOptions.distanceX - touchOptions.prevDistanceX;
				touchOptions.movedY = touchOptions.distanceY - touchOptions.prevDistanceY;

				touchOptions.maxDTime = touchOptions.maxDTime || 1200;
				touchOptions.minDistanceX = touchOptions.minDistanceX || 100;
				touchOptions.minDistanceY = touchOptions.minDistanceY || 100;

				touchOptions.moved = false;
				touchOptions.click = false;
				touchOptions.clickWH = false;

				if(touchOptions.dTime<touchOptions.maxDTime){
					if(touchOptions.distanceX<-touchOptions.minDistanceX){
						touchOptions.moved = 'left';
					}else if(touchOptions.distanceX>touchOptions.minDistanceX){
						touchOptions.moved = 'right';
					}else if(touchOptions.distanceY<-touchOptions.minDistanceY){
						touchOptions.moved = 'up';
					}else if(touchOptions.distanceY>touchOptions.minDistanceY){
						touchOptions.moved = 'down';
					}else if(Math.abs(touchOptions.distanceY)<touchOptions.minDistanceY && Math.abs(touchOptions.distanceX)<touchOptions.minDistanceX){
						touchOptions.clickWH = (startTouchPosition.left > windowWidthHalf ) ? 1 : -1;
					}
				}

				touchOptions.onEnd(touchOptions);
			}

			$(touchSurface).unbind('touchmove');
			$(touchSurface).unbind('touchend');

			touchOptions.distanceX = 0;
			touchOptions.distanceY = 0;
		});

	});
};

window.number_format = function( number, decimals, dec_point, thousands_sep ) {
	var i, j, kw, kd, km;
	if( isNaN(decimals = Math.abs(decimals)) ){ decimals = 2; }
	if( dec_point === undefined ){ dec_point = ","; }
	if( thousands_sep === undefined ){ thousands_sep = "."; }
	i = parseInt(number = (+number || 0).toFixed(decimals)) + "";
	if( (j = i.length) > 3 ){ j = j % 3; } else{ j = 0; }
	km = (j ? i.substr(0, j) + thousands_sep : "");
	kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
	kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");
	return km + kw + kd;
};

var Overlay = MinimalClass.extend({
	pre: function(){
		this.popup = false;
		this.content = false;
	},
	create: function(){
		var self = this;

		this.opened = false;
		this.contentFixedByThisOverlay = false;

		if(!this.popup) {
			this.popup = this.element.find('.js-popup');
		}

		if(!this.content) {
			this.content = this.element.find('.js-content');
		}

		if( typeof ScrollContent !== 'undefined' ) {
			this.scrolling_text = this.popup.find('.scrolling-text');
			this.scroll = new ScrollContent(this.scrolling_text,null,true);
		}

		this.element.find('.js-close').click(function(e){
			self.close();
		});

		this.element.click(function(e){
			if(!self.opened) { return; }
			if( e.target === this ) {
				self.close();
			}
		});

		$(window).resize(function(){
			if( self.opened ) {
				self.resize();
			}
		});
	},
	open: function(cb){
		var self = this;

		this.contentFixedByThisOverlay = window.setFixedContent(true);

		this.element.addClass('resizable');
		this.resize();
		this.on_open(cb);
		this.opened = true;
	},
	on_open: function(cb){
		this.element.addClass('open show');
		if( typeof cb === 'function' ) {
			cb(this);
		}

		if( typeof window.video_play_onscroll_update === 'function' ) {
			window.stop_all_background_videos = true;
			window.video_play_onscroll_update();
		}

		if( typeof this.onOpen === 'function' ) {
			this.onOpen(this);
		}
	},
	close: function(cb){
		var self = this;
		this.element.removeClass('show');

		if( typeof window.video_play_onscroll_update === 'function' ) {
			window.stop_all_background_videos = false;
			window.video_play_onscroll_update();
		}

		setTimeout(function(){
			self.element.removeClass('open');
			self.on_close(cb);
		},300);
	},
	on_close: function(cb){
		this.element.removeClass('resizable');
		if( typeof cb === 'function' ) {
			cb(this);
		}
		if( typeof this.onClose === 'function' ) {
			this.onClose(this);
		}
		if( this.contentFixedByThisOverlay ) {
			window.setFixedContent(false);
		}
		this.opened = false;
	},
	resize: function(){
		var ww = $(window).width(),
			wh = $(window).height();

		this.popup.css({ position: 'absolute' });

		if( this.scroll ) {
			this.scroll.resize();
		}

		this.width = this.popup.outerWidth(true);
		this.height = this.popup.outerHeight(true);

		if( this.height < ( wh - 120 ) ){
			var top = Math.round( ( wh - this.height ) / 2 ),
				left = Math.round( ( ww - this.width ) / 2 );
			this.popup.css({ position: 'absolute', top: top, left: left });
		}else{
			this.popup.css({ position: '', top: '', left: '' });
		}
	},
	set_content: function(html,cb){
		this.content.empty().html(html);
		if( typeof cb === 'function' ) {
			cb(this.content);
		}
		return this
	}
});