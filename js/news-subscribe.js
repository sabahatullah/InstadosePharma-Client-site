var NewsSubscribeOverlay = Overlay.extend({
	create: function(){
		this._super();

		var self = this;

		this.agreement_opened = false;
		this.element.find('.js-toggle-agreement').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			self.toggle_agreement(true);
		});

		$('.js-news-subscribe-trigger').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			self.open();
		});
	},
	mailtest: function(mail) {
		var ret=/^[a-zA-Z0-9\.\-_]{1,}\@([a-zA-Z0-9\-_]{1,}\.){1,2}[a-zA-Z]{2,4}$/.test(mail);
		return(ret ? mail : false);
	},
	open: function(){
		this._super();
		this.popup.find('.thank').fadeOut('fast');
		this.popup.find('.loader').fadeOut('fast');
		this.popup.find('.main').fadeIn('fast');
	},
	toggle_agreement: function(dir){

		if( typeof dir === 'undefined' ) {
			dir = !this.agreement_opened;
		}

		if( dir ) {
			this.popup.addClass('show-agreement');
			this.agreement_opened = true;
			this.resize();
		}else{
			this.popup.removeClass('show-agreement');
			this.agreement_opened = false;
		}

		this.agreement_opened = dir;
	},
	close: function(){
		if(!this.agreement_opened) {
			this._super();
			this.element.find('.loader').fadeOut('fast');
			this.element.find('.thank').fadeOut('fast');
		}
		this.toggle_agreement(false);
	}
});

$(document).ready(function() {

	window.news_subscribe_overlay = new NewsSubscribeOverlay({ element: $('#news-subscribe-overlay') });

	var phone = $('[name="phone"]'),
		input = $('input[type="text"], textarea');

	phone.click(function () {
		$(this).parent().removeClass('error');
		if ($(this).val().length == 0) {
			$(this).val('+');
		}
	});
	phone.focusout(function () {
		if ($(this).val().length < 2) {
			$(this).val('');
		}
	});

	phone.bind("change keyup input click", function() {
        if (this.value.match(/[^0-9+ ]/g)) {
            this.value = this.value.replace(/[^0-9+ ]/g, '');
        }
    });

	input.focus(function () {
		$(this).parent().removeClass('error');
		$(this).parent().find('span').addClass('focused');
	});
	input.focusout(function(){
		if ($(this).val() == ''){
			$(this).parent().find('span').removeClass('focused');
		}
	});

	input.val('');

	$('.js-i-checkbox').each(function(i,elm){
		elm = $(elm);

		var i = elm.find('i'),
			span = elm.find('span'),
			input = elm.find('input').val( i.hasClass('active') ? 1 : 0 ),
			on_click = function(){
				i.removeClass('error');
				if( i.hasClass('active') ) {
					i.removeClass('active');
					input.val(0);
				}else{
					i.addClass('active');
					input.val(1);
				}
			};

		$(i).click(on_click);
		$(span).click(on_click);
	});

});

$(function () {

	function mailtest(mail) {
		var ret=/^[a-zA-Z0-9\.\-_]{1,}\@([a-zA-Z0-9\-_]{1,}\.){1,2}[a-zA-Z]{2,4}$/.test(mail);
		return(ret ? mail : false);
	}

	var required = $('.required');

	$('#subscribe_form').submit(function (e) {
		e.preventDefault();

		var can_send = true,
			has_error = false,
			form = e.target;

		if( typeof form['agree'] != 'undefined' ) {
			if( parseInt(form['agree'].value) < 1 ) {
				$('.js-i-checkbox i').addClass('error');
				can_send = false;
			}
		}

		required.each(function(){
			var is_error = 0;
			if( (this.name == 'email' ) && !mailtest(this.value)) {
				is_error = 1;
			}else if ($(this).val() == '') {
				is_error = 1;
			}

			if( is_error ){
				has_error = true;
				$(this).parent().addClass('error');
			}
		});
		if (has_error){
			return false;
		}else{
			can_send && submit_subscribe_form($(this));
		}
	});

});

function submit_subscribe_form(form) {
	$.ajax({
		url: form.attr('action'),
		method: "POST",
		dataType: "json",
		async: true,
		data: form.serialize() + '&random_value=' + random_value,
		beforeSend: function () {
			$('.news-subscribe-popup .loader').fadeIn('fast');
		},
		success: function (data, textStatus, xhr) {
			if (xhr.status == 200) {
				$('.news-subscribe-popup .main').fadeOut('fast');
				$('.news-subscribe-popup .loader').fadeOut('fast');
				$('.news-subscribe-popup .thank').fadeIn('fast');
				$('input[type="text"]').val('');
				$('.focused').removeClass('focused');
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status != 200) {

			}
		}
	});
}