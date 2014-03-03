/**
 * Copyright (c) 2014 Leonardo Cardoso (http://leocardz.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.0.0
 */
(function($) {
	$.fn.linkPreview = function(options) {

        var defaults = {
            placeholder: "What's in your mind",
            imageQuantity : -1 // illimited
        };

        var opts = jQuery.extend(defaults, options);

        function trim(str) {
            return str.replace(/^\s+|\s+$/g, "");
        }

        var selector = $(this).selector;
        console.log("Object ID");
        console.log(objectID);
        var myThis = $(this);
        selector = selector.substr(1);
        $(this).append('<div id="previewLoading' + selector + '" class="previewLoading"></div> <div> <textarea type="text" id="text'+selector+'" placeholder="'+opts.placeholder+'" class="text"/></textarea> <div style="clear: both"></div> </div> <div id="preview'+selector+'" class="preview"> <div id="previewImages'+selector+'" class="previewImages"> <div id="previewImage'+selector+'" class="previewImage"><img src="Facebook-Link-Preview-master/img/loader.gif" style="margin-left: 43%; margin-top: 39%;"/> </div> <input type="hidden" id="photoNumber'+selector+'" class="photoNumber" value="0" /> </div> <div id="previewContent'+selector+'" class="previewContent"> <div id="closePreview'+selector+'" title="Remove" class="closePreview" ></div> <div id="previewTitle'+selector+'" class="previewTitle"></div> <div id="previewUrl'+selector+'" class="previewUrl"></div> <div id="previewDescription'+selector+'" class="previewDescription"></div> <div id="hiddenDescription'+selector+'" class="hiddenDescription"></div> <div id="previewButtons'+selector+'" class="previewButtons" > <div id="previewPreviousImg'+selector+'" class="buttonLeftDeactive" ></div> <div id="previewNextImg'+selector+'" class="buttonRightDeactive" ></div> <div id="photoNumbers'+selector+'" class="photoNumbers" ></div> <div id="chooseThumbnail'+selector+'" class="chooseThumbnail"> Choose a thumbnail </div> </div> <input type="checkbox" id="noThumb'+selector+'" class="noThumb noThumbCb" /> <div class="nT" id="nT'+selector+'" > <span id="noThumbDiv'+selector+'" class="noThumbDiv" >No thumbnail</span> </div> </div> <div style="clear: both"></div> </div> <div style="clear: both"></div> <div id="postPreview'+selector+'" class="postPreview"> <button type="button" id="postPreviewButton'+selector+'" class="postPreviewButton" data-hull-action="comment" /> <div style="clear: both"></div> </div> <div class="previewPostedList" id="previewPostedList'+selector+'"></div> <div id ="commentExtra" > </div>');

		var text;
		var urlRegex = /(https?\:\/\/|\s)[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})(\/+[a-z0-9_.\:\;-]*)*(\?[\&\%\|\+a-z0-9_=,\.\:\;-]*)?([\&\%\|\+&a-z0-9_=,\:\;\.-]*)([\!\#\/\&\%\|\+a-z0-9_=,\:\;\.-]*)}*/i;
		var block = false;
		var blockTitle = false;
		var blockDescription = false;
		var contentWidth = 355;
		var content = "";
		var image = "";
		var images = "";
		var title = "";
		var url = "";
		var video = "no";
		var videoPlay = "";
		var description = "";
		var hrefUrl = "";
		var videoIframe = "";
		var leftSideContent = "";
		var photoNumber = 0;
		var firstPosted = false;
		var firstPosting = false;
		var nT = false;
		var imageId = "";
		var pTP = "";
		var pDP = "";
		var fancyUrl = '';
		var allowPosting = false;
		var isCrawling = false;

		var textText = "";
		myThis.find('#text'+selector).focus(function() {
			if (trim(myThis.find('#text'+selector).val()) === textText) {
				$(this).val('');
				$(this).css({
					'color' : 'black'
				});
			}
		}).blur(function() {
			if (trim(myThis.find('#text'+selector).val()) === "") {
				$(this).val(textText);
				$(this).css({
					'color' : 'grey'
				});
			}
		});

		function resetPreview() {
			myThis.find('#previewPreviousImg'+selector).removeClass('buttonLeftActive');
			myThis.find('#previewPreviousImg'+selector).addClass('buttonLeftDeactive');
			myThis.find('#previewNextImg'+selector).removeClass('buttonRightActive');
			myThis.find('#previewNextImg'+selector).addClass('buttonRightDeactive');
			myThis.find('#previewTitle'+selector).css({
				"width" : "355px"
			});
			myThis.find('#previewDescription'+selector).css({
				"width" : "355px"
			});
			myThis.find('#previewButtons'+selector).show();
			contentWidth = 355;
			photoNumber = 0;
			myThis.find('#noThumb'+selector).show();
			myThis.find('#nT'+selector).show();
			myThis.find('#noThumb'+selector).removeAttr("checked");
			images = "";
		}

		$(this).find('textarea').keyup(function(e) {
			
			console.log("KEY UP");

			allowPosting = true;

			if ((e.which === 13 || e.which === 32 || e.which === 17) && trim($(this).val()) !== "") {
				text = " " + myThis.find('#text'+selector).val();
				video = "no";
				videoPlay = "";
				if (block === false && urlRegex.test(text)) {
					block = true;
					myThis.find('#preview'+selector).hide();
					myThis.find('#previewButtons'+selector).hide();
					myThis.find('#previewLoading'+selector).html("<img src='Facebook-Link-Preview-master/img/loader.gif' />");
					myThis.find('#photoNumber'+selector).val(0);

					allowPosting = false;
					isCrawling = true;

					$.post('Facebook-Link-Preview-master/php/textCrawler.php', {
						text : text,
						imagequantity : opts.imageQuantity
					}, function(answer) {
						if (answer.url === null)
							answer.url = "";
						if (answer.pageUrl === null)
							answer.pageUrl = "";
						if (answer.title === null)
							answer.title = answer.titleEsc;
						if (answer.description === null)
							answer.description = answer.descriptionEsc;
						if (answer.title === null || answer.title === "")
							answer.title = "Enter a title";
						if (answer.description === null || answer.description === "")
							answer.description = "Enter a description";
						if (answer.canonicalUrl === null)
							answer.canonicalUrl = "";
						if (answer.images === null)
							answer.images = "";
						if (answer.video === null)
							answer.video = "";
						if (answer.videoIframe === null)
							answer.videoIframe = "";
						resetPreview();
						myThis.find('#previewLoading'+selector).html("");
						myThis.find('#preview'+selector).show();
						myThis.find('#previewTitle'+selector).html("<span id='previewSpanTitle"+selector+"' class='previewSpanTitle' >" + answer.title + "</span><input type='text' value='" + answer.title + "' id='previewInputTitle"+selector+"' class='previewInputTitle inputPreview' style='display: none;'/>");
						myThis.find('#text'+selector).css({
							"border" : "1px solid #b3b3b3",
							"border-bottom" : "1px dashed #b3b3b3"
						});

						myThis.find('#previewUrl'+selector).html(answer.url);
						myThis.find('#previewDescription'+selector).html("<span id='previewSpanDescription"+selector+"' class='previewSpanDescription' >" + answer.description + "</span><textarea id='previewInputDescription"+selector+"' class='previewInputDescription' style='width: 355px; display: none;' class='inputPreview' >" + answer.description + "</textarea>");
						title = "<a href='" + answer.pageUrl + "' target='_blank'>" + myThis.find('#previewTitle'+selector).html() + "</a>";
						url = "<a href='http://" + answer.canonicalUrl + "' target='_blank'>" + answer.canonicalUrl + "</a>";
						fancyUrl = answer.canonicalUrl;
						hrefUrl = answer.url;
						description = myThis.find('#previewDescription'+selector).html();
						video = answer.video;
						videoIframe = answer.videoIframe;
						try {
							images = (answer.images).split("|");
							myThis.find('#previewImages'+selector).show();
							myThis.find('#previewButtons'+selector).show();
						} catch (err) {
							myThis.find('#previewImages'+selector).hide();
							myThis.find('#previewButtons'+selector).hide();
						}
						images.length = parseInt(images.length);
						var appendImage = "";
						for ( i = 0; i < images.length; i++) {
							if (i === 0)
								appendImage += "<img id='imagePreview"+ selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto' ></img>";
							else
								appendImage += "<img id='imagePreview"+ selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto; display: none' ></img>";
						}
						myThis.find('#previewImage'+selector).html("<a href='" + answer.pageUrl + "' target='_blank'>" + appendImage + "</a><div id='whiteImage' style='width: 130px; color: transparent; display:none;'>...</div>");
						myThis.find('#photoNumbers'+selector).html("1 of " + images.length);
						if (images.length > 1) {
							myThis.find('#previewNextImg'+selector).removeClass('buttonRightDeactive');
							myThis.find('#previewNextImg'+selector).addClass('buttonRightActive');

							if (firstPosted === false) {
								firstPosted = true;
								myThis.find('#previewPreviousImg'+selector).click(function() {
									if (images.length > 1) {
										photoNumber = parseInt(myThis.find('#photoNumber'+selector).val());
										myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'none'
										});
										photoNumber -= 1;
										if (photoNumber === -1)
											photoNumber = 0;
										myThis.find('#previewNextImg'+selector).removeClass('buttonRightDeactive');
										myThis.find('#previewNextImg'+selector).addClass('buttonRightActive');
										if (photoNumber === 0) {
											photoNumber = 0;
											myThis.find('#previewPreviousImg'+selector).removeClass('buttonLeftActive');
											myThis.find('#previewPreviousImg'+selector).addClass('buttonLeftDeactive');
										}
										myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'block'
										});
										myThis.find('#photoNumber'+selector).val(photoNumber);
										myThis.find('#photoNumbers'+selector).html(parseInt(photoNumber + 1) + " of " + images.length);
									}
								});
								myThis.find('#previewNextImg'+selector).click(function() {
									if (images.length > 1) {
										photoNumber = parseInt(myThis.find('#photoNumber'+selector).val());
										myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'none'
										});
										photoNumber += 1;
										if (photoNumber === images.length)
											photoNumber = images.length - 1;
										myThis.find('#previewPreviousImg'+selector).removeClass('buttonLeftDeactive');
										myThis.find('#previewPreviousImg'+selector).addClass('buttonLeftActive');
										if (photoNumber === images.length - 1) {
											photoNumber = images.length - 1;
											myThis.find('#previewNextImg'+selector).removeClass('buttonRightActive');
											myThis.find('#previewNextImg'+selector).addClass('buttonRightDeactive');
										}
										myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'block'
										});
										myThis.find('#photoNumber'+selector).val(photoNumber);
										myThis.find('#photoNumbers'+selector).html(parseInt(photoNumber + 1) + " of " + images.length);
									}
								});
							}
						} else if (images.length === 0) {
							myThis.find('#closePreview'+selector).css({
								"margin-right" : "-206px"
							});
							myThis.find('#previewTitle'+selector).css({
								"width" : "495px"
							});
							myThis.find('#previewDescription'+selector).css({
								"width" : "495px"
							});
							myThis.find('#previewInputDescription'+selector).css({
								"width" : "495px"
							});
							contentWidth = 495;
							myThis.find('#previewButtons'+selector).hide();
							myThis.find('#noThumb'+selector).hide();
							myThis.find('#nT'+selector).hide();
						}
						if (nT === false) {
							nT = true;
							myThis.find('#nT'+selector).click(function() {
								var noThumb = myThis.find('#noThumb'+selector).attr("checked");
								if (noThumb !== "checked") {
									myThis.find('#noThumb'+selector).attr("checked", "checked");
									myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
										'display' : 'none'
									});
									myThis.find('#whiteImage'+selector).css({
										'display' : 'block'
									});
									myThis.find('#previewButtons'+selector).hide();
								} else {
									myThis.find('#noThumb'+selector).removeAttr("checked");
									myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
										'display' : 'block'
									});
									myThis.find('#whiteImage'+selector).css({
										'display' : 'none'
									});
									myThis.find('#previewButtons'+selector).show();
								}
							});
						}
						myThis.find('#previewSpanTitle'+selector).click(function() {
							if (blockTitle === false) {
								blockTitle = true;
								myThis.find('#previewSpanTitle'+selector).hide();
								myThis.find('#previewInputTitle'+selector).show();
								myThis.find('#previewInputTitle'+selector).val(myThis.find('#previewInputTitle'+selector).val());
								myThis.find('#previewInputTitle'+selector).focus().select();
							}
						});
						myThis.find('#previewInputTitle'+selector).blur(function() {
							blockTitle = false;
							myThis.find('#previewSpanTitle'+selector).html(myThis.find('#previewInputTitle'+selector).val());
							myThis.find('#previewSpanTitle'+selector).show();
							myThis.find('#previewInputTitle'+selector).hide();
						});
						myThis.find('#previewInputTitle'+selector).keypress(function(e) {
							if (e.which === 13) {
								blockTitle = false;
								myThis.find('#previewSpanTitle'+selector).html(myThis.find('#previewInputTitle'+selector).val());
								myThis.find('#previewSpanTitle'+selector).show();
								myThis.find('#previewInputTitle'+selector).hide();
							}
						});
						myThis.find('#previewSpanDescription'+selector).click(function() {
							if (blockDescription === false) {
								blockDescription = true;
								myThis.find('#previewSpanDescription'+selector).hide();
								myThis.find('#previewInputDescription'+selector).show();
								myThis.find('#previewInputDescription'+selector).val(myThis.find('#previewInputDescription'+selector).val());
								myThis.find('#previewInputDescription'+selector).focus().select();
							}
						});
						myThis.find('#previewInputDescription'+selector).blur(function() {
							blockDescription = false;
							myThis.find('#previewSpanDescription'+selector).html(myThis.find('#previewInputDescription'+selector).val());
							myThis.find('#previewSpanDescription'+selector).show();
							myThis.find('#previewInputDescription'+selector).hide();
						});
						myThis.find('#previewInputDescription'+selector).keypress(function(e) {
							if (e.which === 13) {
								blockDescription = false;
								myThis.find('#previewSpanDescription'+selector).html(myThis.find('#previewInputDescription'+selector).val());
								myThis.find('#previewSpanDescription'+selector).show();
								myThis.find('#previewInputDescription'+selector).hide();
							}
						});
						myThis.find('#previewSpanTitle'+selector).mouseover(function() {
							myThis.find('#previewSpanTitle'+selector).css({
								"background-color" : "#ff9"
							});
						});
						myThis.find('#previewSpanTitle'+selector).mouseout(function() {
							myThis.find('#previewSpanTitle'+selector).css({
								"background-color" : "transparent"
							});
						});
						myThis.find('#previewSpanDescription'+selector).mouseover(function() {
							myThis.find('#previewSpanDescription'+selector).css({
								"background-color" : "#ff9"
							});
						});
						myThis.find('#previewSpanDescription'+selector).mouseout(function() {
							myThis.find('#previewSpanDescription'+selector).css({
								"background-color" : "transparent"
							});
						});
						myThis.find('#noThumb'+selector).click(function() {
							var noThumb = $(this).attr("checked");
							if (noThumb !== "checked") {
								myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
									'display' : 'block'
								});
								myThis.find('#whiteImage'+selector).css({
									'display' : 'none'
								});
								myThis.find('#previewButtons'+selector).show();
							} else {
								myThis.find('#imagePreview'+ selector + '_' + photoNumber).css({
									'display' : 'none'
								});
								myThis.find('#whiteImage'+selector).css({
									'display' : 'block'
								});
								myThis.find('#previewButtons'+selector).hide();
							}
						});
						myThis.find('#closePreview'+selector).click(function() {
							block = false;
							hrefUrl = '';
							fancyUrl = '';
							images = '';
							video = '';
							myThis.find('#preview'+selector).fadeOut("fast", function() {
								myThis.find('#text'+selector).css({
									"border" : "1px solid #b3b3b3",
									"border-bottom" : "1px solid #e6e6e6"
								});
								myThis.find('#previewImage'+selector).html("");
								myThis.find('#previewTitle'+selector).html("");
								myThis.find('#previewUrl'+selector).html("");
								myThis.find('#previewDescription'+selector).html("");
							});

						});
						if (firstPosting === false) {
							firstPosting = true;
						}
						allowPosting = true;
						isCrawling = false;
					}, "json");
				}
			}
		});

		myThis.find('#postPreview'+selector).click(function() {

			imageId = "";
			pTP = "";
			pDP = "";
			text = " " + myThis.find('#text'+selector).val();
			title = myThis.find('#previewTitle'+selector).html();
			description = myThis.find('#previewDescription'+selector).html();

			if (((trim(text) !== "") || (trim(text) === "" && trim(hrefUrl) !== "")) && (allowPosting === true && isCrawling === false)) {
				$.get('Facebook-Link-Preview-master/php/highlightUrls.php', {
					text : text,
					description : description
				}, function(urls) {
					if (myThis.find('#noThumb'+selector).attr("checked") === "checked" || images.length === 0) {
						contentWidth = 495;
						leftSideContent = "";
					} else if (images || video) {
						if (video === "yes") {
							var pattern = /id="(.+?)"/i;
							imageId = videoIframe.match(pattern);
							imageId = imageId[1];
							pTP = "pTP" + imageId;
							pDP = "pDP" + imageId;
							imageId = "img" + imageId;
							image = "<img id='" + imageId + "' src='" + myThis.find('#imagePreview'+ selector + '_' + photoNumber).attr("src") + "' class='imgIframe' style='width: 130px; height: auto; float: left;' ></img>";
							videoPlay = '<span class="videoPostPlay"></span>';
							leftSideContent = image + videoPlay;
						} else {
							image = "<img src='" + myThis.find('#imagePreview'+ selector + '_' + photoNumber).attr("src") + "' style='width: 130px; height: auto; float: left;' ></img>";
							leftSideContent = '<a href="' + hrefUrl + '" target="_blank">' + image + '</a>';
						}
					}
					content = '<div class="previewPosted">' + '<div class="previewTextPosted">' + urls.urls + '</div>' + videoIframe + '<div class="previewImagesPosted">' + '<div class="previewImagePosted">' + leftSideContent + '</div>' + '</div>' + '<div class="previewContentPosted">' + '<div class="previewTitlePosted" id="' + pTP + '" style="width: ' + contentWidth + 'px" ><a href="' + hrefUrl + '" target="_blank">' + title + '</a></div>' + '<div class="previewUrlPosted">' + fancyUrl + '</div>' + '<div class="previewDescriptionPosted" id="' + pDP + '" style="width: ' + contentWidth + 'px" >' + urls.description + '</div>' + '</div>' + '<div style="clear: both"></div>' + '</div>';

                    /** Database insert */
                 /*   $.post('Facebook-Link-Preview-master/php/save.php', {
                        text : myThis.find('#text'+selector).val(),
                        image : myThis.find('#imagePreview'+ selector + '_' + photoNumber).attr("src"),
                        title : title,
                        canonicalUrl : fancyUrl,
                        url : hrefUrl,
                        description : myThis.find('#previewSpanDescription'+selector).html(),
                        iframe : videoIframe
                    });*/
                    
                    var itemText = myThis.find('#text'+selector).val();
                    var itemImage = myThis.find('#imagePreview'+ selector + '_' + photoNumber).attr("src");
                    var itemTitle = title;
                    var itemCanonicalUrl = fancyUrl;
                    var itemUrl = hrefUrl;
                    var itemDescription = myThis.find('#previewSpanDescription'+selector).html();
                    var itemIframe = videoIframe;
                    
                    //Pasted from linkPreviewRetrieve
                    if(itemIframe != ""){
                    iframeId = itemIframe.split("id=\"");
                    iframeId = iframeId[1].split("\"");
                    iframeId = iframeId[0];
			
			
                    myThis.find('#commentExtra').html('<div class="previewPosted" style=""><div class="previewTextPosted"> '+itemText+' </div> '+itemIframe+' <div class="previewImagesPosted"><div class="previewImagePosted"><img id="img_'+iframeId+'" src="'+itemImage+'" class="imgIframe" style="width: 130px; height: auto; float: left;"><span class="videoPostPlay"></span></div></div><div class="previewContentPosted"><div class="previewTitlePosted" id="pTP_'+iframeId+'" style="width: 355px">'+itemTitle+'</div><div class="previewUrlPosted">'+itemCanonicalUrl+'</div><div class="previewDescriptionPosted" id="pDP_'+iframeId+'" style="width: 355px"> <span id="previewSpanDescription">'+itemDescription+'</textarea></div></div><div style="clear: both"></div></div>');

                    /*$(".imgIframe").click(function() {
                        var oldId = $(this).attr("id");
                        var currentId = oldId.substring(4);
                        pTP = "pTP_" + currentId;
                        pDP = "pDP_" + currentId;
                        oldId = "#" + oldId;
                        currentId = "#" + currentId;
                        $(oldId).css({
                            'display' : 'none'
                        });
                        $(currentId).css({
                            'display' : 'block'
                        });
                        $('#' + pTP).css({
                            'width' : '495px'
                        });
                        $('#' + pDP).css({
                            'width' : '495px'
                        });
                    });*/

                }
                else
                {
                    myThis.find('#commentExtra').html('<div class="previewPosted" style=""><div class="previewTextPosted"> '+itemText+'  </div><div class="previewImagesPosted"><div class="previewImagePosted"><a href="'+itemUrl+'" target="_blank"><img src="'+itemImage+'" style="width: 130px; height: auto; float: left;"></a></div></div><div class="previewContentPosted"><div class="previewTitlePosted" ><a href="'+itemUrl+'" target="_blank"><span id="previewSpanTitle">'+itemTitle+'</span></a></div><div class="previewUrlPosted">'+itemCanonicalUrl+'</div><div class="previewDescriptionPosted"  > <span id="previewSpanDescription">'+itemDescription+'</span></div><div style="clear: both"></div></div>');
                }
                    ///End of pasted

					myThis.find('#preview'+selector).fadeOut("fast", function() {
						myThis.find('#text'+selector).css({
							"border" : "1px solid #b3b3b3",
							"border-bottom" : "1px solid #e6e6e6"
						});
						myThis.find('#text'+selector).val("");
						myThis.find('#previewImage'+selector).html("");
						myThis.find('#previewTitle'+selector).html("");
						myThis.find('#previewUrl'+selector).html("");
						myThis.find('#previewDescription'+selector).html("");
						//myThis.find(content).hide().prependTo('#previewPostedList'+selector).fadeIn("fast");
						myThis.find(".imgIframe").click(function() {
							var oldId = $(this).attr("id");
							var currentId = oldId.substring(3);
							pTP = "pTP" + currentId;
							pDP = "pDP" + currentId;
							oldId = "#" + oldId;
							currentId = "#" + currentId;
							myThis.find(oldId).css({
								'display' : 'none'
							});
							myThis.find(currentId).css({
								'display' : 'block'
							});
							myThis.find('#' + pTP).css({
								'width' : '495px'
							});
							myThis.find('#' + pDP).css({
								'width' : '495px'
							});
						});
					});



                    block = false;
					hrefUrl = '';
					fancyUrl = '';
					images = '';
					video = '';
				}, "json");
				text = "";
			}
		});

	};
})(jQuery);
