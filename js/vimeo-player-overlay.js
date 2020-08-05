var VimeoPlayerOverlay = Overlay.extend({
	create: function(){
		this.element = $('<div>').addClass('overlay vimeo-player-overlay').appendTo( $(document.body) );
		this.popup = $('<div>').addClass('overlay-popup vimeo-player-popup').appendTo(this.element);
		this.content = $('<div>').addClass('vimeo-player-box').appendTo(this.popup);
		this.closeBtn = $('<div>').addClass('close-btn js-close')
			.append( '<svg><use xlink:href="#close-icon"></use></svg>' )
			.append( '<span>CLOSE</span>' )
			.appendTo( this.popup );

		this.player = new ForceVimeoPlayer({ element: this.content, _id: this.vimeo_id, _resizeMode: this.resizeMode, delegate: this });
		this._super();
	},
	open: function(){
		this._super();
		this.player.play();
	},
	close: function(){
		this.player.pause();
		this._super();
	},
	resize: function(){
		this.player.resize();
		this._super();
	}
});