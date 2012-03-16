/*
 * post-hover.js
 * https://github.com/savetheinternet/Tinyboard-Tools/blob/master/js/post-hover.js
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/post-hover.js';
 *
 */

$(document).ready(function(){
	var dont_fetch_again = [];
	$('p.body a:not([rel="nofollow"])').each(function() {
		var id;
		
		if(id = $(this).text().match(/^>>(\d+)$/)) {
			id = id[1];
		}
		
		var post = false;
		var hovering = false;
		$(this).hover(function(e) {
			hovering = true;
			
			var start_hover = function(link) {
				if(post.is(':visible') &&
						post.offset().top + post.height() >= $(window).scrollTop() &&
						post.offset().top <= $(window).scrollTop() + $(window).height()
						) {
					// post is in view
					post.attr('style', 'border-style: none dashed dashed none; background: ' + post.css('border-right-color'));
				} else {
					var top = e.pageY - post.height() - 15;
					
					post.clone()
						.attr('id', 'post-hover-' + id)
						.addClass('post-hover')
						.css('position', 'absolute')
						.css('border-style', 'solid')
						.css('box-shadow', '1px 1px 1px #999')
						.css('display', 'block')
						.insertAfter($(link).parent());
					$(link).trigger('mousemove');
				}
			};
			
			post = $('div.post#reply_' + id);
			console.log(post);
			if(post.length > 0) {
				start_hover(this, e);
			} else {
				var link = this;
				if($.inArray($(this).attr('href'), dont_fetch_again) != -1) {
					return;
				}
				
				dont_fetch_again.push($(this).attr('href'));
				$.ajax({
					url: $(this).attr('href'),
					context: document.body,
					success: function(data) {
						post = $('div.post:first')
								.prepend($(data).find('div.post#reply_' + id).css('display', 'none').addClass('hidden'))
								.find('div.post#reply_' + id);
						if(typeof window.enable_fa == 'function' && localStorage['forcedanon']) 
							enable_fa();
						if(hovering)
							start_hover(link);
					}
				});
			}
		}, function() {
			hovering = false;
			if(!post)
				return;
			
			post.attr('style', '');
			if(post.hasClass('hidden'))
				post.css('display', 'none');
			$('.post-hover').remove();
		}).mousemove(function(e) {
			if(!post)
				return;
			var top = e.pageY - post.height() - 15;
			$('#post-hover-' + id)
				.css('left', e.pageX)
				.css('top', top > $(window).scrollTop() ? top : $(window).scrollTop());
		});
	});
});

