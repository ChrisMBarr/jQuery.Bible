//Example URL: http://labs.bible.org/api/?passage=John%203:16-199&type=json

/*TODO: 
	* Hover over each verse to see it's passage (tooltip)
	* Combine references properly
	* loading animation
	* demo with a different API
*/
(function($) {
	var B = $.bible= function(){
		B._getPassage.apply( this, arguments );
	};

	//Extend jQuery
	$.extend(B, {
		version : "0.1", //The current version of jQuery.Bible
		defaults : {
			baseUrl: 'http://labs.bible.org/api/',	//string
			searchParam: 'passage',				//string to be used for the main search in the query string OR false to not use this and pass in custom options as needed in the additionalParams
			additionalParams: {'type':'json'}, 		//Empty object or an object with key:value pairs to be converted to query string parameters
			ajaxOptions: {
				cache: false,
	    			dataType: "jsonp",
			},
			onSuccess: $.noop,
			onError: function(jqXHR, textStatus, errorThrown){
				if(window.console) console.error("Thou shalt not "+textStatus+"!", jqXHR, textStatus, errorThrown);
			},
			combineVerses: true, //if true, will output "John 3:16-18" ::: if false, will output "John 3:16" and "John 3:17" and "John 3:18"
			outputFormat: "<p><strong>{{reference}}</strong> - {{verseBody}}</p>",
			formatter:function(passagaData, passageQuery, options){
				var outputHtml = ""

				function _makeRedLetters(input){
					return input.replace(/<b>/g,"<span class='redletters'>").replace(/<\/b>/g,"</span>")
				}

				function _toTitleCase(str){
					return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
				}

				//The properties on each verse come from the data returned by the API!

				if(options.combineVerses){
					//The Bible.org API license agreement required that the verses remain unmodified and they must contain a link
					//Since we are combining multiple verse here, we will save the link out of the first verse,
					//and then remove the link from all verses as we loop through them. Finally the link will be appended at the end of the passage.
					var linkMatcher = /<a.*<\/a>$/;
					var linkToAdd =passagaData[0].text.match(linkMatcher)[0];
					
					//Loop though each verse
					var allVerses = $.map(passagaData, function(thisVerse, i){
						//remove the link from each verse and add a class to bolded words
						return _makeRedLetters(thisVerse.text.replace(linkMatcher,""));
					}).join('');

					outputHtml += options.outputFormat
						.replace("{{reference}}", _toTitleCase(passageQuery)) //Just use what the user typed in for now...
						.replace("{{verseBody}}", allVerses)

					//Add the link back in
					outputHtml += linkToAdd;
				}else{
					//Each verse is separate!

					$.each(passagaData, function(i, thisVerse){
						var reference = thisVerse.bookname+" "+thisVerse.chapter+":"+thisVerse.verse;
						outputHtml += options.outputFormat
							.replace("{{reference}}", reference)
							.replace("{{verseBody}}", _makeRedLetters(thisVerse.text))
					});
				}

				return outputHtml;
			}
		},
		_getPassage : function(passageQuery, options, $elementToUpdate) {
			
			//Get the finalized options
			var opts = B._mergeOptions(options);
			
			var passageObj = {};
			if(typeof opts.searchParam === 'string') passageObj[opts.searchParam] = passageQuery;

			var ajaxOpts = $.extend({}, opts.ajaxOptions, {
				//url : debugUrl,
				url : opts.baseUrl,
				data: $.extend({}, opts.additionalParams, passageObj)
			});

			//Make the ajax call with the options and funning custom functions
			$.ajax(ajaxOpts)
				.success(function(data, textStatus, jqXHR){

					if($elementToUpdate !== undefined) $elementToUpdate.html(opts.formatter(data, passageQuery, opts));

					//Run the custom function
					if($.isFunction(opts.onSuccess)) opts.onSuccess(data, textStatus, jqXHR);
				})
				.error(function(jqXHR, textStatus, errorThrown){

					//Run the custom function
					if($.isFunction(opts.onError)) opts.onError(jqXHR, textStatus, errorThrown);
				});
		},
		_mergeOptions: function(completeFunctionOrOptions){
			var opts = {};

			if($.isFunction(completeFunctionOrOptions)){
				//If the 2nd param passed in was a function,
				//just use that as the completion option
				//instead of specifying custom options
				opts = $.extend({}, B.defaults, {
					onSuccess: completeFunctionOrOptions
				});
			}else{
				//If the 2nd param passed in was NOT a function,
				//merge these options with the default options
				opts = $.extend({}, B.defaults, completeFunctionOrOptions);
			}

			return opts;
		}
	});

	// jQuery plugin initialization
	$.fn.bible = function (passageQuery, options) {

		//Create a finalized version of the options
		var opts = B._mergeOptions(options);

		//Return the elements & loop though them to set their HTML
		return this.each(function(){
			var $thisElement = $(this);

			B._getPassage(passageQuery, opts, $thisElement);

		});
	};

})(jQuery);