var VideoTrigger = MinimalClass.extend({
	create: function(){
		var self = this;

		this.video_box = this.element.find('.video-box');
		this.play_button = this.element.find('.play-button');

		this.open_mode = this.element.attr('open-mode');
		this.vimeo_id = this.element.attr('vimeo-id');

		if(!this.vimeo_id) {
			return;
		}

		this.element.click(function(e){
			e.stopPropagation();
			e.preventDefault();
			self.open(e);
		});

		this.overlay = false;
		switch( this.open_mode ) {
			case 'overlay':
				this.overlay = new VimeoPlayerOverlay({ _vimeo_id: this.vimeo_id, _resizeMode: 'window', delegate: this });
				break;
			case 'inline':
				this.vimeo_box = this.element.find('.vimeo-box');
				this.player = new ForceVimeoPlayer({
					element: this.vimeo_box,
					_id: this.vimeo_id,
					_resizeMode: 'element',
					delegate: this,
					_onPlay: function(){
						self.element.addClass('open');
					},
					_onPause: function() {
						self.element.removeClass('open');
					},
					_onEnded: function(){
						self.element.removeClass('open');
					}
				});
				break;
		}
	},
	open: function(e){
		switch( this.open_mode ) {
			case 'overlay':
				this.overlay.open();
				break;
			case 'inline':
				this.player.play();
				break;
		}
	}
});