window.stop_all_background_videos = false;
window.video_play_onscroll_update = function() {
	$('.video-background').each(function (i, elm) {

		var scrollTop = $(window).scrollTop(),
			windowHeight = $(window).height(),
			videoTop = $(elm).offset().top,
			videoHeight = $(elm).height();

		var shouldPlay = !window.stop_all_background_videos && ( ( scrollTop + windowHeight > videoTop ) && ( scrollTop < videoTop + videoHeight ) ),
			isPlaying = parseInt($(elm).data('play'));

		if (!isPlaying && shouldPlay) {
			elm.play();
			$(elm).data('play', 1);
			//console.log(elm.id + ' play');
		} else if (isPlaying && !shouldPlay) {
			elm.pause();
			$(elm).data('play', 0);
			//console.log(elm.id + ' stop');
		}
	});
};

$(document).ready(function(){


	// setTimeout(function(){
	//  $(".main-block .text-block .green").fadeOut(2000).css('color','#aca22b');
	// 		setTimeout(function(){
	// 		$(".main-block .text-block .green").fadeIn('slow')
	// 	}, 1500)
	// }, 2000);

	var serVid = 0;

	$('.service-block .item').hover(function(){
		$(this).addClass('hover');
		$(this).find('video')[0].play();
		$(this).find('video').fadeIn('fast');
	},function(){
		$(this).removeClass('hover');
		$(this).find('video')[0].pause();
		$(this).find('video').fadeOut('fast');
	});

	function transitionEndEventName(){
		var i,
			undefined,
			el = document.createElement('div'),
			eventNames = {
				'transition':'transitionend',
				'OTransition':'otransitionend',
				'MozTransition':'transitionend',
				'WebkitTransition':'webkitTransitionEnd',
				'msTransition':'MSTransitionEnd'
			};

		for (i in eventNames) {
			if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
				return eventNames[i];
			}
		}
	}

	(function(){
		var items = $('.progress-switcher div'),
			tEvt = transitionEndEventName(),
			total_items = items.length,
			animating = false,
			active_item = $('.progress-switcher div.active'),
			active_item_num = parseInt(active_item.data('progress')),
			next_item_num = false,
			idle_timer = false,
			animating_line = false,
			timer_enabled = false,
			first_time_animation = true;

		function onTimerComplete(e,elm){
			if(e.originalEvent.propertyName != 'height') return;
			if(animating) return;

			e.stopPropagation();
			e.preventDefault();

			activateProgressItem(next_item_num);

			animating_line.removeClass('animate first-time');
			next_item_num = animating_line = false;
		}

		function activateProgressItem(item_num){
			var elm = $('.progress-switcher div[data-progress='+item_num+']');
			if (elm.hasClass('active')){
				return;
			}

			active_item.removeClass('active');
			elm.addClass('active');

			active_item = elm;
			active_item_num = item_num;

			$('.progress.active').find('.sub-line').addClass('zero');
			$('.progress.active').find('.num').each(function(i,elm){
				elm = $(elm);
				elm.stop().animate({
					num: 0
				},{
					duration : 1200,
					step : function(now, fx){
						elm.html( number_format(now,0,'.',' ') );
					}
				});
			});
			$('.progress.active').removeClass('active').fadeOut('fast', function(){
				animating = true;
				$('.progress-' + item_num).fadeIn('fast').addClass('active').find('.zero').removeClass('zero');
				$('.progress-' + item_num).find('.num').each(function(i,elm){
					elm = $(elm);
					elm.stop().animate({
						num: parseInt(elm.attr('data-num-value'))
					},{
						duration : 1200,
						step : function(now, fx){
							elm.html( number_format(now,0,'.',' ') );
						},
						complete: function(){
							!i && timer_enabled && window.startProgressTimer();
							animating = false;
						}
					});
				});
			});
		}

		window.startProgressTimer = function(){
			timer_enabled = true;

			var num = active_item_num - 1;
			if( num < 1 ) { num = total_items; }

			next_item_num = num;

			animating_line = $(items[active_item_num-1]).find('.line');
			if( animating_line.length ) {
				if( first_time_animation ) {
					animating_line.addClass('first-time');
					first_time_animation = false;
				}
				animating_line.addClass('animate');
			}
		};

		window.stopProgressTimer = function(){
			timer_enabled = false;
			if(animating_line.length){
				animating_line.removeClass('animate');
				animating_line = false;
			}
		};

		items.each(function(){
			var elm = $(this);
			elm.css('left',$(this).data('default'));
			elm.find('.line').bind(tEvt,function(e){ onTimerComplete(e,elm); });
		});

		items.click(function(){
			window.stopProgressTimer();
			if( idle_timer ) {
				clearTimeout(idle_timer);
				idle_timer = false;
			}
			idle_timer = setTimeout(function(){ window.startProgressTimer(); },10000);
			activateProgressItem(parseInt($(this).data('progress')));
		});

	})();

	(function(){
		var player2 = document.getElementById('player2'),
			player2_playing = false;
		if( player2 ) {
			var player2_card = $('.js-player2-card');

			player2_card.click(function(e){
				window.vimeo_player2.play();
			});

			window.vimeo_player2 = new Vimeo.Player(player2);
			window.vimeo_player2.on('play',function(){
				player2_card.fadeOut();
				player2_playing = true;
				window.stopProgressTimer();
			});
			window.vimeo_player2.on('pause',function(){
				player2_card.fadeIn();
				player2_playing = false;
				window.startProgressTimer();
			});

			$(window).scroll(function(){
				if(!player2_playing) return;

				var rect = player2.getBoundingClientRect(),
					prc = 0, total = window.innerHeight + rect.height;

				if( rect.top > window.innerHeight ) prc = 0;
				else if( rect.top < -rect.height ) prc = 1;
				else prc = 1 - ( ( rect.top + rect.height ) / total );

				if( prc <= 0 || prc >= 1) {
					window.vimeo_player2.pause();
				}
			});
		}
	})();

	(function(){

		function openVideoPopup(){
			window.stopProgressTimer();
			window.setFixedContent(true);
			$('.video-popup-overlay').fadeIn('fast');
			$('.video-popup').addClass('open');
			window.vimeo_player.play();
		}

		function closeVideoPopup(){
			window.vimeo_player.pause();
			$('.video-popup').removeClass('open');
			$('.video-popup-overlay').fadeOut('fast');
			window.setFixedContent(false);
			window.startProgressTimer();
		}

		window.vimeo_player = new Vimeo.Player('player1');

		$('.video-trigger').click(openVideoPopup);
		$('.video-popup .close-btn').click(closeVideoPopup);
		$('.video-popup-overlay').click(function(e){
			if( e.target === this ) {
				closeVideoPopup();
			}
		});
	})();

	var home_on_resize = function() {
		var ww = $(window).width(),
			wh = $(window).height(),
			header_height = $('.header').height();

		$('.main-block').css({ width: ww, height: wh });
		$('.video-block').css({ height: wh - header_height });
		$('.technick-block').css({ height: wh - header_height });
		$('.overlay-video').css({ height: wh });
		$('.video-popup').css({ left: Math.round((ww - $('.video-popup').outerWidth(true) ) / 2) });

		var dvw = 1920,
			dvh = 1080,
			vw = ww,
			vh = Math.round( vw / dvw * dvh ),
			vl = 0,
			vt = 0;
		if( vh < wh ){
			vh = wh;
			vw = Math.round( vh / dvh * dvw );
		}
		vl = Math.round( ( ww - vw ) / 2 );
		vt = Math.round( ( wh - vh ) / 2 );
		$('.video-background').css({ top: vt, left: vl, width: vw, height: vh });
	};

	var progress_activated = false;
	var home_on_scroll = function(){
		if(window.contentFixed) {
			return;
		}

		if( !menuOpened ){
			if ($(window).scrollTop() > 150){
				$('.header').addClass('open');
			} else {
				$('.header').removeClass('open');
			}
		}

		if(!progress_activated) {
			$('.progress-4').each(function() {
				var thisel = $(this);
				if ($(window).scrollTop() > $(this).offset().top - $(window).height() + 300) {
					thisel.find('.zero').removeClass('zero');
					thisel.find('.num').each(function(i,elm){
						elm = $(elm);
						elm.stop().animate({
							num: parseInt(elm.attr('data-num-value'))
						},{
							duration : 500,
							step : function(now, fx){
								elm.html( number_format(now,0,'.',' ') );
							},
							complete: function(){
								!i && window.startProgressTimer();
							}
						});
					});
					progress_activated = true;
				}
			});
		}

		window.video_play_onscroll_update();
	};

	var lang = $('html').attr('lang');
	$('.js-asterisk').each(function(i,elm){
		var trigger = $(elm),
			tooltip = $('.js-asterisk-tooltip'),
			visible = false;

		function repos_tooltip(){
			var pos = trigger.offset(),
				top = pos.top + trigger.outerHeight(true) + 26,
				left = pos.left;

			if( lang === 'en' ) {
				if(!visible){ tooltip.css({ display: 'block' }); }
				top = pos.top - tooltip.outerHeight(true);
				if(!visible){ tooltip.css({ display: 'none' }); }
			}

			tooltip.css({ top : top, left : left });
		}

		if( is_touch_device() ) {
			trigger.bind('touchstart',function(e){
				if( !visible ) {
					e.preventDefault();
					e.stopPropagation();

					repos_tooltip();
					tooltip.fadeIn('fast');
					visible = true;
				}
			});

			$(window).bind('touchstart',function(){
				if( visible ) {
					tooltip.fadeOut('fast');
					visible = false;
				}
			});
		}else{
			trigger.bind('mouseenter mouseleave',function(e){
				e.preventDefault();
				e.stopPropagation();
				switch(e.type){
					case 'mouseenter':
						if( menuOpened ) { return; }
						repos_tooltip();
						tooltip.fadeIn('fast');
						visible = true;
						break;
					case 'mouseleave':
						tooltip.fadeOut('fast');
						visible = false;
						break;
				}
			});
		}

		$(window).resize(repos_tooltip);
		repos_tooltip();
	});

	$(window).resize(home_on_resize);
	$(window).scroll(home_on_scroll);
	home_on_scroll();
	home_on_resize();
});

function create_footer_map() {
	var map_styles = [
	    {
	        "featureType": "administrative.country",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#a1d6aa"
	            },
	            {
	                "weight": "0.50"
	            },
	            {
	                "lightness": "-10"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.country",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#424242"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.country",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.province",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "color": "#a1d6aa"
	            },
	            {
	                "weight": "0.50"
	            },
	            {
	                "lightness": "-10"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.province",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#424242"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.province",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.locality",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#424242"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.locality",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.man_made",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": "-100"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#c3ecca"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#424242"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape.natural",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#c3ecca"
	            },
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "poi.park",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#c3ecca"
	            }
	        ]
	    },
	    {
	        "featureType": "road",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#ffffff"
	            }
	        ]
	    },
	    {
	        "featureType": "road",
	        "elementType": "geometry.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "simplified"
	            },
	            {
	                "saturation": "-100"
	            },
	            {
	                "lightness": "0"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "transit.station",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "geometry.fill",
	        "stylers": [
	            {
	                "color": "#e4f8ff"
	            },
	            {
	                "lightness": "0"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "labels.text.fill",
	        "stylers": [
	            {
	                "color": "#0089b6"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "labels.text.stroke",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    }
	];
	var map_options = {
		center: { lat: 55.722874, lng: 37.501740 },
		scrollwheel: false,
		zoom: 14,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_TOP
		},
		mapTypeControl: false,
		streetViewControl: false,
		panControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles : map_styles
	};

	var map = new google.maps.Map(document.getElementById('map'), map_options),
		marker = new google.maps.Marker({
			position: {
				lat: 55.722874,
				lng: 37.501740
			},
			title : 'Title',
			address : main_map_address,
			map : map,
			icon: {
				url: '/img/map-pin.png',
				size: new google.maps.Size(132, 168),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(33, 62),
				scaledSize: new google.maps.Size(66, 84)
			},
			map_center : function() {
				return map_offset_coords(map,marker.getPosition(),Math.round($(window).width() / 4 ) ,0);
			}
		}),
		info_bubble = new InfoBubble(marker,map,'contact',true);

	window.content_scaler_map = map;
	window.content_scaler_maker = marker;

	google.maps.event.addListener(map,'tilesloaded',function(){
		//info_bubble.open();
		google.maps.event.addListener(marker, 'click', function(e){
			info_bubble.open();
		});

		map.setCenter(marker.map_center());
		google.maps.event.clearListeners(map,'tilesloaded');
	});
}

var initMap = function(){
	setTimeout(create_footer_map,100);
};