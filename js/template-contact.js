/* --------------------------------------------------------------------------
 * File        : template-contact.js
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
 * -------------------------------------------------------------------------- */
(function($){

	"use strict";
	
	var TemplateApp = {
	    //---------- 2. Google Map -----------
	    template_contact_form: function() {
	    	$("#buttonsend").on("click", function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var loc = window.location;
		        var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
		        var template_url = loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
		        var name    = $('#contact-name').val();
		        var subject = $('#contact-subject').val();
		        var email   = $('#contact-email').val();
		        var message = $('#contact-message').val();

		        var valid;
				valid = validateContact();
				if(valid) {
					jQuery.ajax({
						url: template_url+"sendemail.php",
						data: "contact-name=" + name + "&contact-subject=" + subject + "&contact-email=" + email + "&contact-message=" + message,
						type: "POST",
						success:function(data){
							$(".mail-status").html(data);
							$('#contact-name, #contact-subject, #contact-email, #contact-message').next('.contact-require').text(' *');
							$('#contact-name, #contact-subject, #contact-email, #contact-message').val("");
							$('.alert').fadeOut(5000, function() { $(this).remove(); });
						},
						error:function (){}
					});
					return false;
				}
			});

			$('#contact-name, #contact-subject, #contact-email,#contact-message').focus(function(){
                $(this).css({"border":"1px solid #eaeaea"}).next('.contact-require').text(' *');
            });
        },

	  // theme init
      theme_init:function(){
      	 TemplateApp.template_contact_form();
      }
		
	}//end themeApp
	
	
	jQuery(document).ready(function($){
	   	   
		TemplateApp.theme_init();

    });
	
})(jQuery);


function validateContact() {

	var name    = $('#contact-name').val();
    var subject = $('#contact-subject').val();
    var email   = $('#contact-email').val();
    var message = $('#contact-message').val();

	var valid = true;	
	$(".contact-input").css('background-color','');
	$(".contact-require").html('*');
	
	if(!name) {
		$('#contact-name').css("border","1px solid #FFB8B8").next('.contact-require').text(' !');
		valid = false;
	}
	if(!email) {
		$('#contact-email').css("border","1px solid #FFB8B8").next('.contact-require').text(' !');
		valid = false;
	}
	if(!email.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)) {
		$('#contact-email').css("border","1px solid #FFB8B8").next('.contact-require').text(' !');
		valid = false;
	}
	if(!subject) {
		$('#contact-subject').css("border","1px solid #FFB8B8").next('.contact-require').text(' !');
		valid = false;
	}
	if(!message) {
		$('#contact-message').css("border","1px solid #FFB8B8").next('.contact-require').text(' !');
		valid = false;
	}
	
	return valid;
}
