var NewsBox = function(elm) {
	this.element = $(elm);

	this.page = 1;
	this.start_date = 0;
	this.finish_date = 0;
	this.category_id = false;
	this.busy = false;
	this.update_period_btn = false;
	this.load_more_btn = false;
	this.news_overlay_content = false;

	this.mode = $(elm).data('mode');

	this.overlay_element = $("#news-overlay");
	this.overlay = new Overlay({ element: this.overlay_element, _onClose: function(){
		self.opened = false;
	}});

	var self = this;

	this.opened = false;
	this.news_overlay_content = this.overlay_element.find('#news-overlay-content');

	this.setup_events();

	this.load_more_btn = $('.js-load-more-news');
	this.load_more_btn.css({ cursor : 'pointer' })
		.click(function(){
			self.load_more();
		});

	if( this.load_more_btn.length ) {
		this.category_id = parseInt(this.load_more_btn.attr('category_id'));
	}

	var autoopen = document.querySelector('.js-autoopen-alias');
	if( autoopen ) {
		var autoopen_alias = autoopen.getAttribute('autoopen-alias');
		if( autoopen_alias ) {
			this.news_popup_overlay(null,autoopen_alias);
		}
	}

	if( window.location.hash.length ) {
		var autoopen_alias = window.location.hash.substring(1);
		if( autoopen_alias ) {
			$(window).bind('onQueryLoaderLoaded',function(){
				self.news_popup_overlay(null,autoopen_alias);
			});
		}
	}
};

NewsBox.prototype.setup_events = function() {
	var self = this;
	this.element.find('.item').each(function(i,elm){
		elm = $(elm);
		if( parseInt(elm.attr('data-events')) ) {
			return;
		}

		elm.click(function(){
			self.news_popup_overlay(this);
		}).attr('data-events',1);
	});
};

NewsBox.prototype.set_period = function(start,finish){
	this.start_date = start;
	this.finish_date = finish;
	this.page = 1;
	this.update();
};

NewsBox.prototype.gather_data = function(){
	return {
		page : this.page,
		start_date : this.start_date,
		finish_date : this.finish_date
	};
};

NewsBox.prototype.update = function(){
	if(this.busy) {
		return;
	}

	var self = this,
		data = this.gather_data();

	this.busy = true;

	$.ajax({
		url : '/news.json',
		dataType : 'json',
		type : 'GET',
		data : data
	})
		.done(function(resp){
			if(resp.error) {
				alert(resp.message);
				return;
			}

			if( resp.have_more ) {
				self.load_more_btn.parent().removeClass('hidden');
			}else{
				self.load_more_btn.parent().addClass('hidden');
			}

			self.element.empty().html(resp.html);
			self.setup_events();

		})
		.fail(function(){
			alert('Error updating news');
		})
		.always(function(){
			self.busy = false;
		});
};

NewsBox.prototype.news_popup_overlay = function (elm,alias) {
	var self = this;
	this.news_overlay_content.empty();

	var id = parseInt($(elm).attr('data-id'));
	alias = elm ? $(elm).attr('data-alias') : alias;
	if( !alias ) {
		return;
	}

	$.ajax({
		url: '/news/view/' + alias + '.json',
		dataType: 'json',
		type: 'GET',
		context: this
	})
		.done(function(data,textStatus,xhr){

			if( data.error ) {
				if( typeof window.console !== 'undefined' && typeof window.console.log === 'function' ){
					window.console.log(data.message);
				}
				return;
			}

			self.news_overlay_content.html(data.html);
			self.overlay.open(function(){
				self.news_overlay_content.find('.news-card-slider').slick();
				self.news_overlay_content.find('.slick-arrow').click(function(){
					$(this).parent().parent().find('.slider-count .current').empty().append($(this).parent().find('.slick-active').index());
				});
				self.news_overlay_content.find('.slider-count .all').empty().append($('.slick-slide').length - 2);
			});

			self.opened = true;

			window.history.pushState({ section : 'news-overlay', article_id : id, article_alias: alias }, window.title, ( self.mode === 'index' ? "/#" : "/news/" ) + alias);
		})
		.fail(function(xhr,textStatus,errorThrown){
			if( typeof window.console !== 'undefined' && typeof window.console.log === 'function' ){
				window.console.log(textStatus,errorThrown);
			}
		})
		.always(function(){

		});
};

NewsBox.prototype.load_more = function(){

	this.page++;

	var self = this,
		data = this.gather_data();

	$.ajax({
		url : '/news.json',
		data : data,
		dataType : 'json',
		context : this
	})
		.done(function(resp){
			if( resp.error ) {
				alert(resp.message);
				return;
			}

			if( parseInt(resp.count) > 0 ) {
				self.element.append( resp.html );
				self.setup_events();
			}

			if( resp.have_more ) {
				self.load_more_btn.parent().removeClass('hidden');
			}else{
				self.load_more_btn.parent().addClass('hidden');
			}

		})
		.fail(function(xhr,textStatus,errorThrown){
			self.page--;
			alert( textStatus + ': ' + errorThrown);
		});
};

var news_box = $('#news-box');
if( news_box.length ) {
	var news_box = new NewsBox(news_box[0]),
		calendars = [];
	if( typeof Calendar != 'undefined' ) {
		$('.js-calendar').each(function(i,calendar){
			calendars.push(new Calendar(calendar,news_box));
		});
	}
};