var ForceVimeoPlayer = MinimalClass.extend({
	__className: 'ForceVimeoPlayer',

	_players: [],
	_pause_other_players: function()
	{
		var self = this;
		this._players.forEach(function(elm,i){
			if( elm != self ) {
				elm.pause();
			}
		});
	},

	pre: function(opt)
	{
		this.id = 0;

		this.player_options = { byline: false, portrait: false, title: false, loop: false, color: '129968' };

		this.onPlay = false;
		this.onEnded = false;
		this.onReady = false;
		this.onLoaded = false;

		this.width = 0;
		this.height = 0;
		this.video_width = 0;
		this.video_height = 0;
		this.resizeMode = 'default';

		this.ready = false;
		this.playing = false;
		this.is_loaded = false;

		this.autoplay = false;
		this.autoopen = false;
	},
	create: function()
	{
		this._players.push(this);

		if(this.id) {
			this.player_options.id = this.id;
			this.create_player();
		}else{
			this.log('Unable to create vimeo player: no id');
		}
	},
	create_player: function()
	{
		var self = this;

		this.player = new Vimeo.Player(this.element[0], this.player_options);
		this.player.setLoop(false);

		this.player.on('loaded', function() {
			self.player.getVideoWidth().then(function(width){ self.video_width = width; self.resize(); }).catch(function(error){});
			self.player.getVideoHeight().then(function(height){ self.video_height = height; self.resize(); }).catch(function(error){});
			self.is_loaded = true;
			self.loaded();
		});

		this.player.on('play', function() {
			self.playing = true;
			if( typeof self.onPlay === 'function' ) { self.onPlay(this); }
		});

		this.player.on('pause', function() {
			self.playing = false;
			if( typeof self.onPause === 'function' ) { self.onPause(this); }
		});

		this.player.on('ended', function() {
			self.playing = false;
			if( typeof self.onEnded === 'function' ) { self.onEnded(this); }
		});
	},
	resize: function()
	{
		var self = this,
			ww = this.element.width(),
			wh = this.element.height();

		switch(this.resizeMode){
			case 'element':
				this.width = ww;
				this.height = wh;
				break;
			case 'window':
				ww = $(window).width();
				wh = $(window).height();
			default:
				if( !this.video_width || !this.video_height ) {
					return false;
				}

				var multiplier = .6;
				switch( window.device_mode ){
					case 'mobile':
						multiplier = 1;
						break;
				}

				this.width = Math.round(ww * multiplier);
				this.height = Math.round(this.width / this.video_width * this.video_height);

				if( this.height > wh * multiplier ) {
					this.height = Math.round(wh * multiplier);
					this.width = Math.round( this.height / this.video_height * this.video_width );
				}
				break;
		}

		this.element.find('iframe').css({
			width: this.width,
			height: this.height
		});

		if( !this.ready ) {
			this.ready = true;
			this.element.trigger('ready', [ this ]);
			if( typeof self.onReady === 'function' ) { self.onReady(this); }
		}
	},
	loaded: function()
	{
		this.resize();
		if(this.autoplay){
			this.play();
		}

		if( typeof this.onLoaded === 'function' ) { this.onLoaded(this); }
	},
	play: function()
	{
		this._pause_other_players();

		if(!this.player) {
			this.autoplay = true;
			return this.create_player();
		}

		if( this.playing ) return;
		this.player.play();
	},
	pause: function()
	{
		if( !this.playing ) return;
		this.player.pause();
	},
	remove: function()
	{
		var self = this,
			newPlayers = [];
		this._players.forEach(function(elm,i){
			if( elm !== self ) {
				newPlayers.push(elm);
			}
		});
		this._players = newPlayers;
		this.player.unload();
		this.element.remove();
	}
});