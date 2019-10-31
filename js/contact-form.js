$(document).ready(function() {
  	$("#buttonsend").click(function(){
		
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
				},
				error:function (){}
			});
			$('#contact-name, #contact-subject, #contact-email, #contact-message').css("border","1px solid #eaeaea").val("");
			$('.alert').fadeOut(5000, function() { $(this).remove(); });
		}
	});
	return false;
});

function validateContact() {

	var name    = $('#contact-name').val();
    var subject = $('#contact-subject').val();
    var email   = $('#contact-email').val();
    var message = $('#contact-message').val();

	var valid = true;	
	$(".contact-input").css('background-color','');
	$(".contact-require").html('');
	
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