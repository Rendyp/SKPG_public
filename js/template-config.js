/* --------------------------------------------------------------------------
 * File        : template-config.js
 * Version     : 1.0
 * Author      : IMediapixel
 * Author URI  : http://themeforest.net/user/imediapixel
 *
 * IMediapixel Copyright 2019 All Rights Reserved.
 * -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
 * javascript handle initialization
		1. Menu Toggle
		2. Google Map
		3. Portfolio Filter
 *
 * -------------------------------------------------------------------------- */
(function($){

	"use strict";
	
	var TemplateApp = {
		//---------- 1. Menu Toggle -----------
	    template_drophover:function() {
	    	// Check for click events on the navbar burger icon
			$('ul.navbar-nav li.dropdown').hover(function() {
			  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
			}, function() {
			  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
			});
	    },
	    //---------- 2. Slider -----------
	    template_slider:function() {
	    	$(".slider1").owlCarousel({
	    		items: true,
	    		nav: true,
	    		dots: true,
	    		autoplay: false,
	    		loop: true,
	    	});
	    },
	    //---------- 3. Slider -----------
	    template_slider_2:function() {

    		var slider = $(".slider2");
	    	slider.on('initialized.owl.carousel', function (event) { 
	    		var $currentItem = $('.owl-item', slider).eq(event.item.index); 
	    		var $elemsToanim = $currentItem.find("[data-animation-out]"); 
	    		setAnimation($elemsToanim, 'in'); 
    		});

	    	slider.owlCarousel({
	    		loop: true,
		      	margin:0,
		      	navSpeed: 300,
		      	nav:true,
		      	autoplay: true,
		      	rewind: false,
		      	items:1,
		      	autoHeight: true
	    	});

	    	// add animate.css class(es) to the elements to be animated
			function setAnimation ( _elem, _InOut ) {
				// Store all animationend event name in a string.
				// cf animate.css documentation
				var animationEndEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

				_elem.each ( function () {
				  	var $elem = $(this);
				  	var $animationType = 'animated ' + $elem.data( 'animation-' + _InOut );

				  	$elem.addClass($animationType).one(animationEndEvent, function () {
				    	$elem.removeClass($animationType); // remove animate.css Class at the end of the animations
				  	});
				});
			}

			// Fired before current slide change
			slider.on('change.owl.carousel', function(event) {
			  	var $currentItem = $('.owl-item', slider).eq(event.item.index);
			  	var $elemsToanim = $currentItem.find("[data-animation-out]");
			  	setAnimation ($elemsToanim, 'out');
			});

			// Fired after current slide has been changed
			var round = 0;
			slider.on('changed.owl.carousel', function(event) {

			  	var $currentItem = $('.owl-item', slider).eq(event.item.index);
			  	var $elemsToanim = $currentItem.find("[data-animation-in]");

			  	setAnimation ($elemsToanim, 'in');
			})

			slider.on('translated.owl.carousel', function(event) {
			//console.log (event.item.index, event.page.count);

			  	if (event.item.index == (event.page.count - 1))  {
			    	if (round < 1) {
			      		round++
			      		//console.log (round);
		    		} else {
				      	slider.trigger('stop.owl.autoplay');
				      	var owlData = slider.data('owl.carousel');
				      	owlData.settings.autoplay = false; //don't know if both are necessary
				      	owlData.options.autoplay = false;
				      	slider.trigger('refresh.owl.carousel');
			    	}
			  	}
			});
	    },
	    //---------- 4. Odometer -----------
	    template_counter:function() {
    		$('.timer').countTo();
    	},
	    //---------- 4. Portfolio Filter -----------
	    template_pf_filter:function() {
	    	//Portfolio Filter Jquery
			var $container = $('.pf-4cols');

			$container.imagesLoaded(function() {
				$container.isotope({
					filter: '*',
					animationOptions: {
						duration: 750,
						easing: 'linear',
						queue: false,
						itemSelector: '.pf-item', // use a separate class for itemSelector, other than .col-
  						percentPosition: true,
					}
				});
			});
			$('#pf-filter a').click(function(){
				var selector = $(this).attr('data-filter');
				$container.isotope({
					filter: selector,
					animationOptions: {
						duration: 750,
						easing: 'linear',
						queue: false,
					}
				});
			  return false;
			});

			$("#pf-filter a").click(function(e){
				$(this).parent().addClass('active').siblings().removeClass('active');
		    });
		},

	  	// theme init
      	theme_init:function(){
      		TemplateApp.template_drophover();
      	 	TemplateApp.template_slider();
      	 	TemplateApp.template_slider_2();
      	 	TemplateApp.template_counter();
      	 	TemplateApp.template_pf_filter();
      	}
		
	}//end themeApp
	
	
	jQuery(document).ready(function($){
	   	   
		TemplateApp.theme_init();

    });
	
})(jQuery);