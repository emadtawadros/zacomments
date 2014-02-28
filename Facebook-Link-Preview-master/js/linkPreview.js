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
        console.log("SELECTOR");
        console.log(selector);
        //selector = selector.substr(1);
	console.log("THIS");
	console.log(this);
        $(this).append('<div id="previewLoading' + selector + '" class="previewLoading"></div> <div> <textarea type="text" id="text'+selector+'" placeholder="'+opts.placeholder+'" class="text"/></textarea> <div style="clear: both"></div> </div> <div id="preview'+selector+'" class="preview"> <div id="previewImages'+selector+'" class="previewImages"> <div id="previewImage'+selector+'" class="previewImage"><img src="Facebook-Link-Preview-master/img/loader.gif" style="margin-left: 43%; margin-top: 39%;"/> </div> <input type="hidden" id="photoNumber'+selector+'" class="photoNumber" value="0" /> </div> <div id="previewContent'+selector+'" class="previewContent"> <div id="closePreview'+selector+'" title="Remove" class="closePreview" ></div> <div id="previewTitle'+selector+'" class="previewTitle"></div> <div id="previewUrl'+selector+'" class="previewUrl"></div> <div id="previewDescription'+selector+'" class="previewDescription"></div> <div id="hiddenDescription'+selector+'" class="hiddenDescription"></div> <div id="previewButtons'+selector+'" class="previewButtons" > <div id="previewPreviousImg'+selector+'" class="buttonLeftDeactive" ></div> <div id="previewNextImg'+selector+'" class="buttonRightDeactive" ></div> <div id="photoNumbers'+selector+'" class="photoNumbers" ></div> <div id="chooseThumbnail'+selector+'" class="chooseThumbnail"> Choose a thumbnail </div> </div> <input type="checkbox" id="noThumb'+selector+'" class="noThumb noThumbCb" /> <div class="nT" id="nT'+selector+'" > <span id="noThumbDiv'+selector+'" class="noThumbDiv" >No thumbnail</span> </div> </div> <div style="clear: both"></div> </div> <div style="clear: both"></div> <div id="postPreview'+selector+'" class="postPreview"> <input id="postPreviewButton'+selector+'" class="postPreviewButton" type="submit" value="Post" /> <div style="clear: both"></div> </div> <div class="previewPostedList" id="previewPostedList'+selector+'"></div>');

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
		$('#text'+selector).focus(function() {
			if (trim($('#text'+selector).val()) === textText) {
				$(this).val('');
				$(this).css({
					'color' : 'black'
				});
			}
		}).blur(function() {
			if (trim($('#text'+selector).val()) === "") {
				$(this).val(textText);
				$(this).css({
					'color' : 'grey'
				});
			}
		});

		function resetPreview() {
			$('#previewPreviousImg'+selector).removeClass('buttonLeftActive');
			$('#previewPreviousImg'+selector).addClass('buttonLeftDeactive');
			$('#previewNextImg'+selector).removeClass('buttonRightActive');
			$('#previewNextImg'+selector).addClass('buttonRightDeactive');
			$('#previewTitle'+selector).css({
				"width" : "355px"
			});
			$('#previewDescription'+selector).css({
				"width" : "355px"
			});
			$('#previewButtons'+selector).show();
			contentWidth = 355;
			photoNumber = 0;
			$('#noThumb'+selector).show();
			$('#nT'+selector).show();
			$('#noThumb'+selector).removeAttr("checked");
			images = "";
		}


		$('#text'+selector).keyup(function(e) {
			
			console.log("KEY UP");

			allowPosting = true;

			if ((e.which === 13 || e.which === 32 || e.which === 17) && trim($(this).val()) !== "") {
				text = " " + $('#text'+selector).val();
				video = "no";
				videoPlay = "";
				if (block === false && urlRegex.test(text)) {
					block = true;
					$('#preview'+selector).hide();
					$('#previewButtons'+selector).hide();
					$('#previewLoading'+selector).html("<img src='Facebook-Link-Preview-master/img/loader.gif' />");
					$('#photoNumber'+selector).val(0);

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
						$('#previewLoading'+selector).html("");
						$('#preview'+selector).show();
						$('#previewTitle'+selector).html("<span id='previewSpanTitle"+selector+"' class='previewSpanTitle' >" + answer.title + "</span><input type='text' value='" + answer.title + "' id='previewInputTitle"+selector+"' class='previewInputTitle inputPreview' style='display: none;'/>");
						$('#text'+selector).css({
							"border" : "1px solid #b3b3b3",
							"border-bottom" : "1px dashed #b3b3b3"
						});

						$('#previewUrl'+selector).html(answer.url);
						$('#previewDescription'+selector).html("<span id='previewSpanDescription"+selector+"' class='previewSpanDescription' >" + answer.description + "</span><textarea id='previewInputDescription"+selector+"' class='previewInputDescription' style='width: 355px; display: none;' class='inputPreview' >" + answer.description + "</textarea>");
						title = "<a href='" + answer.pageUrl + "' target='_blank'>" + $('#previewTitle'+selector).html() + "</a>";
						url = "<a href='http://" + answer.canonicalUrl + "' target='_blank'>" + answer.canonicalUrl + "</a>";
						fancyUrl = answer.canonicalUrl;
						hrefUrl = answer.url;
						description = $('#previewDescription'+selector).html();
						video = answer.video;
						videoIframe = answer.videoIframe;
						try {
							images = (answer.images).split("|");
							$('#previewImages'+selector).show();
							$('#previewButtons'+selector).show();
						} catch (err) {
							$('#previewImages'+selector).hide();
							$('#previewButtons'+selector).hide();
						}
						images.length = parseInt(images.length);
						var appendImage = "";
						for ( i = 0; i < images.length; i++) {
							if (i === 0)
								appendImage += "<img id='imagePreview"+ selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto' ></img>";
							else
								appendImage += "<img id='imagePreview"+ selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto; display: none' ></img>";
						}
						$('#previewImage'+selector).html("<a href='" + answer.pageUrl + "' target='_blank'>" + appendImage + "</a><div id='whiteImage' style='width: 130px; color: transparent; display:none;'>...</div>");
						$('#photoNumbers'+selector).html("1 of " + images.length);
						if (images.length > 1) {
							$('#previewNextImg'+selector).removeClass('buttonRightDeactive');
							$('#previewNextImg'+selector).addClass('buttonRightActive');

							if (firstPosted === false) {
								firstPosted = true;
								$('#previewPreviousImg'+selector).click(function() {
									if (images.length > 1) {
										photoNumber = parseInt($('#photoNumber'+selector).val());
										$('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'none'
										});
										photoNumber -= 1;
										if (photoNumber === -1)
											photoNumber = 0;
										$('#previewNextImg'+selector).removeClass('buttonRightDeactive');
										$('#previewNextImg'+selector).addClass('buttonRightActive');
										if (photoNumber === 0) {
											photoNumber = 0;
											$('#previewPreviousImg'+selector).removeClass('buttonLeftActive');
											$('#previewPreviousImg'+selector).addClass('buttonLeftDeactive');
										}
										$('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'block'
										});
										$('#photoNumber'+selector).val(photoNumber);
										$('#photoNumbers'+selector).html(parseInt(photoNumber + 1) + " of " + images.length);
									}
								});
								$('#previewNextImg'+selector).click(function() {
									if (images.length > 1) {
										photoNumber = parseInt($('#photoNumber'+selector).val());
										$('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'none'
										});
										photoNumber += 1;
										if (photoNumber === images.length)
											photoNumber = images.length - 1;
										$('#previewPreviousImg'+selector).removeClass('buttonLeftDeactive');
										$('#previewPreviousImg'+selector).addClass('buttonLeftActive');
										if (photoNumber === images.length - 1) {
											photoNumber = images.length - 1;
											$('#previewNextImg'+selector).removeClass('buttonRightActive');
											$('#previewNextImg'+selector).addClass('buttonRightDeactive');
										}
										$('#imagePreview'+ selector + '_' + photoNumber).css({
											'display' : 'block'
										});
										$('#photoNumber'+selector).val(photoNumber);
										$('#photoNumbers'+selector).html(parseInt(photoNumber + 1) + " of " + images.length);
									}
								});
							}
						} else if (images.length === 0) {
							$('#closePreview'+selector).css({
								"margin-right" : "-206px"
							});
							$('#previewTitle'+selector).css({
								"width" : "495px"
							});
							$('#previewDescription'+selector).css({
								"width" : "495px"
							});
							$('#previewInputDescription'+selector).css({
								"width" : "495px"
							});
							contentWidth = 495;
							$('#previewButtons'+selector).hide();
							$('#noThumb'+selector).hide();
							$('#nT'+selector).hide();
						}
						if (nT === false) {
							nT = true;
							$('#nT'+selector).click(function() {
								var noThumb = $('#noThumb'+selector).attr("checked");
								if (noThumb !== "checked") {
									$('#noThumb'+selector).attr("checked", "checked");
									$('#imagePreview'+ selector + '_' + photoNumber).css({
										'display' : 'none'
									});
									$('#whiteImage'+selector).css({
										'display' : 'block'
									});
									$('#previewButtons'+selector).hide();
								} else {
									$('#noThumb'+selector).removeAttr("checked");
									$('#imagePreview'+ selector + '_' + photoNumber).css({
										'display' : 'block'
									});
									$('#whiteImage'+selector).css({
										'display' : 'none'
									});
									$('#previewButtons'+selector).show();
								}
							});
						}
						$('#previewSpanTitle'+selector).click(function() {
							if (blockTitle === false) {
								blockTitle = true;
								$('#previewSpanTitle'+selector).hide();
								$('#previewInputTitle'+selector).show();
								$('#previewInputTitle'+selector).val($('#previewInputTitle'+selector).val());
								$('#previewInputTitle'+selector).focus().select();
							}
						});
						$('#previewInputTitle'+selector).blur(function() {
							blockTitle = false;
							$('#previewSpanTitle'+selector).html($('#previewInputTitle'+selector).val());
							$('#previewSpanTitle'+selector).show();
							$('#previewInputTitle'+selector).hide();
						});
						$('#previewInputTitle'+selector).keypress(function(e) {
							if (e.which === 13) {
								blockTitle = false;
								$('#previewSpanTitle'+selector).html($('#previewInputTitle'+selector).val());
								$('#previewSpanTitle'+selector).show();
								$('#previewInputTitle'+selector).hide();
							}
						});
						$('#previewSpanDescription'+selector).click(function() {
							if (blockDescription === false) {
								blockDescription = true;
								$('#previewSpanDescription'+selector).hide();
								$('#previewInputDescription'+selector).show();
								$('#previewInputDescription'+selector).val($('#previewInputDescription'+selector).val());
								$('#previewInputDescription'+selector).focus().select();
							}
						});
						$('#previewInputDescription'+selector).blur(function() {
							blockDescription = false;
							$('#previewSpanDescription'+selector).html($('#previewInputDescription'+selector).val());
							$('#previewSpanDescription'+selector).show();
							$('#previewInputDescription'+selector).hide();
						});
						$('#previewInputDescription'+selector).keypress(function(e) {
							if (e.which === 13) {
								blockDescription = false;
								$('#previewSpanDescription'+selector).html($('#previewInputDescription'+selector).val());
								$('#previewSpanDescription'+selector).show();
								$('#previewInputDescription'+selector).hide();
							}
						});
						$('#previewSpanTitle'+selector).mouseover(function() {
							$('#previewSpanTitle'+selector).css({
								"background-color" : "#ff9"
							});
						});
						$('#previewSpanTitle'+selector).mouseout(function() {
							$('#previewSpanTitle'+selector).css({
								"background-color" : "transparent"
							});
						});
						$('#previewSpanDescription'+selector).mouseover(function() {
							$('#previewSpanDescription'+selector).css({
								"background-color" : "#ff9"
							});
						});
						$('#previewSpanDescription'+selector).mouseout(function() {
							$('#previewSpanDescription'+selector).css({
								"background-color" : "transparent"
							});
						});
						$('#noThumb'+selector).click(function() {
							var noThumb = $(this).attr("checked");
							if (noThumb !== "checked") {
								$('#imagePreview'+ selector + '_' + photoNumber).css({
									'display' : 'block'
								});
								$('#whiteImage'+selector).css({
									'display' : 'none'
								});
								$('#previewButtons'+selector).show();
							} else {
								$('#imagePreview'+ selector + '_' + photoNumber).css({
									'display' : 'none'
								});
								$('#whiteImage'+selector).css({
									'display' : 'block'
								});
								$('#previewButtons'+selector).hide();
							}
						});
						$('#closePreview'+selector).click(function() {
							block = false;
							hrefUrl = '';
							fancyUrl = '';
							images = '';
							video = '';
							$('#preview'+selector).fadeOut("fast", function() {
								$('#text'+selector).css({
									"border" : "1px solid #b3b3b3",
									"border-bottom" : "1px solid #e6e6e6"
								});
								$('#previewImage'+selector).html("");
								$('#previewTitle'+selector).html("");
								$('#previewUrl'+selector).html("");
								$('#previewDescription'+selector).html("");
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

		$('#postPreview'+selector).click(function() {

			imageId = "";
			pTP = "";
			pDP = "";
			text = " " + $('#text'+selector).val();
			title = $('#previewTitle'+selector).html();
			description = $('#previewDescription'+selector).html();

			if (((trim(text) !== "") || (trim(text) === "" && trim(hrefUrl) !== "")) && (allowPosting === true && isCrawling === false)) {
				$.get('Facebook-Link-Preview-master/php/highlightUrls.php', {
					text : text,
					description : description
				}, function(urls) {
					if ($('#noThumb'+selector).attr("checked") === "checked" || images.length === 0) {
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
							image = "<img id='" + imageId + "' src='" + $('#imagePreview'+ selector + '_' + photoNumber).attr("src") + "' class='imgIframe' style='width: 130px; height: auto; float: left;' ></img>";
							videoPlay = '<span class="videoPostPlay"></span>';
							leftSideContent = image + videoPlay;
						} else {
							image = "<img src='" + $('#imagePreview'+ selector + '_' + photoNumber).attr("src") + "' style='width: 130px; height: auto; float: left;' ></img>";
							leftSideContent = '<a href="' + hrefUrl + '" target="_blank">' + image + '</a>';
						}
					}
					content = '<div class="previewPosted">' + '<div class="previewTextPosted">' + urls.urls + '</div>' + videoIframe + '<div class="previewImagesPosted">' + '<div class="previewImagePosted">' + leftSideContent + '</div>' + '</div>' + '<div class="previewContentPosted">' + '<div class="previewTitlePosted" id="' + pTP + '" style="width: ' + contentWidth + 'px" ><a href="' + hrefUrl + '" target="_blank">' + title + '</a></div>' + '<div class="previewUrlPosted">' + fancyUrl + '</div>' + '<div class="previewDescriptionPosted" id="' + pDP + '" style="width: ' + contentWidth + 'px" >' + urls.description + '</div>' + '</div>' + '<div style="clear: both"></div>' + '</div>';

                    /** Database insert */
                    $.post('Facebook-Link-Preview-master/php/save.php', {
                        text : $('#text'+selector).val(),
                        image : $('#imagePreview'+ selector + '_' + photoNumber).attr("src"),
                        title : title,
                        canonicalUrl : fancyUrl,
                        url : hrefUrl,
                        description : $('#previewSpanDescription'+selector).html(),
                        iframe : videoIframe
                    });

					$('#preview'+selector).fadeOut("fast", function() {
						$('#text'+selector).css({
							"border" : "1px solid #b3b3b3",
							"border-bottom" : "1px solid #e6e6e6"
						});
						$('#text'+selector).val("");
						$('#previewImage'+selector).html("");
						$('#previewTitle'+selector).html("");
						$('#previewUrl'+selector).html("");
						$('#previewDescription'+selector).html("");
						$(content).hide().prependTo('#previewPostedList'+selector).fadeIn("fast");
						$(".imgIframe").click(function() {
							var oldId = $(this).attr("id");
							var currentId = oldId.substring(3);
							pTP = "pTP" + currentId;
							pDP = "pDP" + currentId;
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
