//http://labs.bible.org/api/?passage=John%203:16-199&type=json

(function($) {
	var namespace = "BibleJS";

	function _getPassage(passage, opts){

		var passageObj = {};
		if(typeof opts.searchParam === 'string') passageObj[opts.searchParam] = passage; //escape(passage);

		var ajaxOpts = $.extend({}, opts.ajaxOptions, {
			//url : debugUrl,
			url : opts.baseUrl,
			data: $.extend({}, opts.additionalParams, passageObj)
		});

		//Make the ajax call with the options and funning custom functions
		$.ajax(ajaxOpts)
			.success(function(data, textStatus, jqXHR){

				//Run the custom function
				if($.isFunction(opts.onSuccess)) opts.onSuccess(data, textStatus, jqXHR);
			})
			.error(function(jqXHR, textStatus, errorThrown){

				//Run the custom function
				if($.isFunction(opts.onError)) opts.onError(jqXHR, textStatus, errorThrown);
			})

	}

	var extObj = {};
	extObj[namespace] = function(passage, completeFunctionOrOptions) {
		var opts;

		if($.isFunction(completeFunctionOrOptions)){
			//If the 2nd param passed in was a function,
			//just use that as the completion option
			//instead of specifying custom options
			opts = $.extend({}, $[NS].defaults, {
				onSuccess: completeFunctionOrOptions
			});
		}else{
			//If the 2nd param passed in was NOT a function,
			//merge these options with the default options
			opts = $.extend({}, $[NS].defaults, completeFunctionOrOptions);
		}

		//Get the passage and pass in the options
		_getPassage(passage, opts);

		return;
	};

	//Add the new extension to jQuery
	$.extend(extObj);

	//Set the default values for the plugin
	$[namespace].defaults =  {
		baseUrl: 'http://labs.bible.org/api/',	//string
		searchParam: 'passage',				//string to be used for the main search in the query string OR false to not use this and pass in custom options as needed in the additionalParams
		additionalParams: {'type':'json'}, 		//Empty object or an object with key:value pairs to be converted to query string parameters
		ajaxOptions: {
			cache: false,
    			dataType: "jsonp",
		},
		onSuccess: function(data, textStatus, jqXHR){
			$.each(data, function(i, thisPassage){
				if(window.console){
					console.log(thisPassage);
				}else{
					alert(thisPassage.text);
				}
			});
		},
		onError: function(jqXHR, textStatus, errorThrown){
			if(window.console) console.error("Thou shalt not "+textStatus+"!", jqXHR, textStatus, errorThrown);
		}
	};
})(jQuery);