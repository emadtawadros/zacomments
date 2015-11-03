Hull.component('posts', {
            templates: ['posts'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
			        case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },
            initialize: function(){
                var tab = this.$el.parent().find('.loading');
                tab.slideDown();
        
                this.options.trendingDaysLimit = 730;    //3 days
                this.options.trendingLimit = 30;    //10 posts
            }, //initialize
            datasources: {
                trendingPosts: function loadTrendingPosts() {
                    var dff = $.Deferred();
                    var result = [];
                    var componenet = this;
                    var timeFrame = "this_" + this.options.trendingDaysLimit + "_days";
                    Keen.onChartsReady(function() {
                        var metric = new Keen.Metric("hull.comment.create", {
                            analysisType: "count",
                            groupBy: "target_id",
                            timeframe: timeFrame
                        });
                
                        metric.getResponse(function(response){
                            var numberOfDeletedItems = 0;
                            if(response.result.length >= componenet.options.trendingLimit) {
                                response.result.sort(function(a,b) {
                                    return b.result - a.result;
                                });
                                
                                
                                for(var i = 0; i< response.result.length; i++)
                                {
                                    componenet.api(response.result[i].target_id, {async:false}).then(function(response) {
                                    	if(result.length < componenet.options.trendingLimit) {
                                    		result.push(response);
                                    	}
                                    }, function(error) {
                                        numberOfDeletedItems ++;
                                    });
                                }
                                (function wait(){
                                    if(result.length >= componenet.options.trendingLimit || result.length + numberOfDeletedItems >= response.result.length) {
                                        dff.resolve(result);
                                    } else {
                                        setTimeout(wait, 100);
                                    }
                                })();
                            }
                            else {    //We need to fetch more data from Keen
                                componenet.options.trendingDaysLimit += 30;
                                componenet.render();
                            }
                        });    //end of keen response
                    });
                    return dff.promise();
                }
            },
            beforeRender: function(data){
            	if($("#mobileNavigator").is(':visible')){ //Meaning that we're in mobile
            		$('#trendingTopicsNavigator').click(function(){
            			$('#hotTopics').show();
	                	$('#newTopics').hide();
	                	$('#newTopicsNavigator').addClass('unselected').removeClass('selected');
	                	$('#trendingTopicsNavigator').addClass('selected').removeClass('unselected');
            		});
	                $('#newTopicsNavigator').click(function(){
	                	$('#newTopics').show();
	                	$('#newTopicsNavigator').addClass('selected').removeClass('unselected');
	                	$('#hotTopics').hide();
	                	$('#trendingTopicsNavigator').addClass('unselected').removeClass('selected');
	                });
	                if($('#newTopicsNavigator').hasClass('selected')) { //firstload
	                	this.$el.hide();
	                }
            		$('#trendingTopicsNavigator').removeClass('active disabled');
            	}
            },
            afterRender: function() {
		this.$el.removeClass("loading");
                this.$el.find('#loadMoreTrending').removeClass("active disabled");
                $("img").on("contextmenu",function(){
                	return false;
                });
            },
            flagItem: function (event, action) {
            	var component = this;
            	event.preventDefault();
            	var id = action.data.id;
            	var n = noty({
			text: 'Are you sure you want to report this topic? Please report only inappropriate, spam or duplicate topics.',
			layout: 'topCenter',
			theme: 'relax',
			type: 'warning',
			animation: {
				open: {height: 'toggle'}, // jQuery animate function property object
				close: {height: 'toggle'}, // jQuery animate function property object
				easing: 'swing', // easing
				speed: 300 // opening & closing animation speed
			},
			buttons: [
				{addClass: 'btn btn-success', text: 'Yes', onClick: function($noty) {
					$noty.close();
					component.sandbox.flag(id);
					}
				},
				{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
						$noty.close();
					}
				}
			]
		});
            },
            actions: {
            	flag:    'flagItem',
                loadMoreTrending: function() {
                	
                	this.$el.find('#loadMoreTrending').addClass("active disabled");

                        this.options.trendingLimit += 10;
                        this.render();
                    
                },
                shareToFB: function(event, action) {
                	var redirectURI = "http://zacomments.azurewebsites.net/?post=" + action.data.id;
                	Hull.share({
                		provider:'facebook', //share on Facebook
                		method: 'share', //Facebook allows more than one sharing dialog, choose the one you want.
                		anonymous: true, //Allow anonymous sharing, I.E. without requring a login beforehand? Default: false.
                		params:{
                			redirect_uri: redirectURI, //Where to redirect the user in the popup after he shared. Mandatory
                			display: 'popup', //popup || iframe. Optional. Default: Smart depending on connection status and device. Iframe for desktop, Popup for mobile
                			href: redirectURI //Params passed to the sharing dialog.
        			}
                	});
                }
            }
        });    //posts component
        
        Hull.component('newposts', {
        	templates: ['newposts'],
        	helpers: {
	            	ifcond: function (v1, operator, v2, options) {
	            		switch (operator) {
				        case '==':
				            return (v1 == v2) ? options.fn(this) : options.inverse(this);
				        case '===':
				            return (v1 === v2) ? options.fn(this) : options.inverse(this);
				        case '<':
				            return (v1 < v2) ? options.fn(this) : options.inverse(this);
				        case '<=':
				            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				        case '>':
				            return (v1 > v2) ? options.fn(this) : options.inverse(this);
				        case '>=':
				            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				        case '&&':
				            return (v1 && v2) ? options.fn(this) : options.inverse(this);
				        case '||':
				            return (v1 || v2) ? options.fn(this) : options.inverse(this);
				        default:
				            return options.inverse(this);
	    			}
			}
        	},
        	datasources: {
        		newPosts: function() {
        			return this.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
        				'visibiliy': 'public',
        				limit: this.options.limit,
        				order_by: 'created_at DESC'
        				});
        				}
        				
        				},
        	initialize: function(){
        		this.options.limit = 30;
        	},
        	afterRender: function() {
        			this.$el.find('#loadMore').removeClass("active disabled");
        	},
        	flagItem: function (event, action) {
        		var component = this;
        		event.preventDefault();
        		var id = action.data.id;
	        	var n = noty({
	        		text: 'Are you sure you want to report this topic? Please report only inappropriate, spam or duplicate topics.',
	        		layout: 'topCenter',
        			theme: 'relax',
        			type: 'warning',
        			animation: {
        				open: {height: 'toggle'}, // jQuery animate function property object
        				close: {height: 'toggle'}, // jQuery animate function property object
        				easing: 'swing', // easing
        				speed: 300 // opening & closing animation speed
        			},
				buttons: [
					{addClass: 'btn btn-success', text: 'Yes', onClick: function($noty) {
						$noty.close();
						component.sandbox.flag(id);
						}
					},
					{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
							$noty.close();
						}
					}
				]
			});
        	},
        	actions: {
        		flag: 'flagItem',
        		loadMore: function() {
        			this.$el.find('#loadMore').addClass("active disabled");
        			this.options.limit += 10;
        			this.render();
        			}	
        	}
        });
        
	Hull.component('mylogin', {
	  type: 'Hull',
	
	  templates: [
	    'mylogin'
	  ],
	
	  options:{
	    provider:''
	  },
	
	  refreshEvents: ['model.hull.me.change'],
	
	  initialize: function() {
	    "use strict";
	    this.authHasFailed = false;
	
	
	    this.sandbox.on('hull.auth.failure', this.sandbox.util._.bind(function() {
	      this.authHasFailed = true;
	      this.render();
	    }, this));
	
	  },
	
	  beforeRender: function(data) {
	    "use strict";
	
	    data.authHasFailed = this.authHasFailed;
	    var authServices = this.authServices() || [];
	
	    // If providers are specified, then use only those. else use all configuredauthServices
	    if(this.options.provider){
	      data.providers = this.options.provider.replace(' ','').split(',');
	    } else {
	      data.providers = authServices;
	    }
	
	    // If I'm logged in, then create an array of logged In providers
	    if(this.loggedIn()){
	      data.loggedInProviders = this.sandbox.util._.keys(this.loggedIn());
	    } else {
	      data.loggedInProviders = [];
	    }
	
	    // Create an array of logged out providers.
	    data.loggedOut = this.sandbox.util._.difference(data.providers, data.loggedInProviders);
	    data.matchingProviders = this.sandbox.util._.intersection(data.providers.concat('email'), data.loggedInProviders);
	    data.authServices = authServices;
	
	    return data;
	  },
	
	  afterRender: function() {
	    this.authHasFailed = false;
	  },
	  trim: function (str) {
            return str.replace(/^\s+|\s+$/g, "");
	  },
	  actions: {
	  	close: function(){
	  		this.$el.hide();
	  	},
	  	expandSignup: function() {
	  		this.$el.find('#signupForm').toggle();
	  	},
	  	toggleEmailLogin: function(){
	  		this.$el.find('#emailLoginSection').toggle();
	  	},
	  	toggleRegistration: function(){
	  		this.$el.find('#registrationSection').slideToggle();
	  	},
	  	newFBLogin: function(){
	  		if(this.data.me.attributes.main_identity == "guest")
	  		{
	  			Hull.linkIdentity({
	  				provider:'facebook',
	  				strategy:'redirect',
	  				redirect_url:'http://zacomments.azurewebsites.net'
	  			});
	  		} else {
	  			Hull.login({
	  				provider:'facebook',
	  				strategy:'redirect',
	  				redirect_url:'http://zacomments.azurewebsites.net'
	  			});
	  		}
	  	},
	  	signup: function() {
	  		var component = this;
	  		var username = this.$el.find('#usernameField').val();
	  		var email = this.$el.find('#emailField').val();
	  		var password = this.$el.find('#passwordField').val();
	  		var confirmPassword = this.$el.find('#confirmPasswordField').val();
	  		if((trim(password) !== "") && (trim(confirmPassword) !== "") && (trim(password) === trim(confirmPassword)))
	  		{
	  			if((trim(username) !== "") && (trim(email) !=="")){
		  			this.$el.find('#signupButton').addClass("active disabled");
			  		Hull.signup({
			  			email: email,
			  			password: password,
			  			name: username
			  		}).then(function(user){
			  			component.$el.find('#signupButton').removeClass("active disabled");
			  		}, function(error){
			  			component.$el.find('#signupButton').removeClass("active disabled");
		                		var n = noty({
		                			layout: 'topCenter',
		                			theme: 'relax',
		                			text: 'Somebody is already using that email!',
		                			type: 'warning',
		                			timeout: 3000,
		                			killer: true,
		                			animation: {
		                				open: {height: 'toggle'}, // jQuery animate function property object
		                				close: {height: 'toggle'}, // jQuery animate function property object
		                				easing: 'swing', // easing
		                				speed: 300 // opening & closing animation speed
		                			}
		                		});
			  		});
	  			} else{
	  				var n = noty({
	                			layout: 'topCenter',
	                			theme: 'relax',
	                			text: 'Oops! Looks like you missed a field!',
	                			type: 'warning',
	                			timeout: 3000,
	                			killer: true,
	                			animation: {
	                				open: {height: 'toggle'}, // jQuery animate function property object
	                				close: {height: 'toggle'}, // jQuery animate function property object
	                				easing: 'swing', // easing
	                				speed: 300 // opening & closing animation speed
	                			}
	                		});
	  			}
	  		} else {
	        		var n = noty({
	        			layout: 'topCenter',
	        			theme: 'relax',
	        			text: 'Password do not match! Type fast much?',
	        			type: 'warning',
	        			timeout: 3000,
	        			killer: true,
	        			animation: {
	        				open: {height: 'toggle'}, // jQuery animate function property object
	        				close: {height: 'toggle'}, // jQuery animate function property object
	        				easing: 'swing', // easing
	        				speed: 300 // opening & closing animation speed
	        			}
	        		});
	  		}
	  	},
	  	signin: function(){
	  		var component = this;
	  		var email = this.$el.find('#emailLoginField').val();
	  		var password = this.$el.find('#passwordLoginField').val();
	  		if((trim(email) !=="") && (trim(password)!== "")){
	  			component.$el.find('#emailSigninButton').addClass("active disabled");
	  			Hull.login({
	  				login: email,
	  				password: password
	  			}).then(function (me) {
	  				component.$el.find('#emailSigninButton').removeClass("active disabled");
	  			}, function (error) {
	  				component.$el.find('#emailSigninButton').removeClass("active disabled");
	                		var n = noty({
	                			layout: 'topCenter',
	                			theme: 'relax',
	                			text: "Looks like there is something wrong with the credentials you entered. We think it's you not us.",
	                			type: 'warning',
	                			timeout: 3000,
	                			killer: true,
	                			animation: {
	                				open: {height: 'toggle'}, // jQuery animate function property object
	                				close: {height: 'toggle'}, // jQuery animate function property object
	                				easing: 'swing', // easing
	                				speed: 300 // opening & closing animation speed
	                			}
	                		});
	  			});	
	  		}
	  	}
	  }
	});
	
        Hull.component('flaggedposts', {
        	templates: ['flaggedposts'],
        	datasources: {
        		flaggedPosts: function() {
        			return this.api('/52e138eaf0f1b0ac30000bad/conversations', {
        				'where': {
        					'stats.flags': {
        						'$gt': 0
        					}
        				}
        			});
        		},
        		allFlagged: function() {
        			return this.api('/org/flagged', 'get');
        		}
        	},
        	beforeRender: function(data, errors) {
        	},
        	afterRender: function(data) {
        		var component = this;
        		this.$el.find(".imgIframe, .videoPostPlay").click(function() {
	            		var oldId = $(this).parent().children(":first").attr("id"); //we do this trick because we want to get the .imgIframe. But we might be called from .VideoPostPlay
		                var currentId = oldId.substring(4);
		                pTP = "pTP_" + currentId;
		                pDP = "pDP_" + currentId;
		                oldId = "#" + oldId;
		                currentId = "#" + currentId;
		                component.$el.find(oldId).css({
		                	'display' : 'none'
		                });
		                component.$el.find(oldId).next(".videoPostPlay").css({
		                	'display' : 'none'
		                });
		                component.$el.find(currentId).css({
		                    'display' : 'block',
		                     'width': 'auto'
		                });
		                component.$el.find('#' + pTP).css({
		                    'width' : 'auto'
		                });
		                component.$el.find('#' + pDP).css({
		                    'width' : 'auto'
		                });
        		});
        	},
        	unflagItem: function (event, action) {
        		var component = this;
        		event.preventDefault();
        		var id = action.data.id;
        		this.api(id + '/flag?all=1', 'delete').then(function(response) {
        			component.refresh();
        		});
        	},
        	deleteItem: function(event, action) {
        		event.preventDefault();
        		var component = this;
	        	var n = noty({
	        		text: 'Are you sure you want to delete this topic?',
	        		layout: 'topCenter',
        			theme: 'relax',
        			type: 'warning',
        			animation: {
        				open: {height: 'toggle'}, // jQuery animate function property object
        				close: {height: 'toggle'}, // jQuery animate function property object
        				easing: 'swing', // easing
        				speed: 300 // opening & closing animation speed
        			},
				buttons: [
					{addClass: 'btn btn-danger', text: 'Yes', onClick: function($noty) {
						var id = action.data.id;
        					component.api(id, 'delete').then(function(response) {
        						$noty.close();
        						component.refresh();
        					});
						}
					},
					{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
							$noty.close();
						}
					}
				]
			});
                },
        	actions:
        	{
        		unflag: 'unflagItem',
        		deleteItem: 'deleteItem'
        	}
        });
        
        Hull.component('user', {
            templates: ['user'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
			        case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },
            datasources: {
                feed: function() {
                    var dff = $.Deferred(); 
                    var component = this;
                    component.api('/following/' + component.options.id, 'put').then(function(response) {
                        component.api('app/following_activity', 'get', {
                            where: {
                                'actor_id': component.options.id,
                                'obj_type': { $in: ['Comment', 'Review'] }
                            },
                            limit: 1000
                        }).then(function(response) {
                            dff.resolve(response);
                        });        
                    });
                    return dff.promise();
                },
                interestedTopics: function() {
                	var result = [];
                	var dff = $.Deferred(); 
                	var component = this;
                	component.api('/following/' + component.options.id, 'put').then(function(response) {
                        	component.api('app/following_activity', 'get', {
                        		where: {
                        			'actor_id': component.options.id,
                        			'obj_type': { $in: ['Comment'] }
                        		},
                            limit: 1000
                        }).then(function(response) {
                        	$.each(response, function(actionIndex, actionValue) {
                        		if(actionValue.object.type == "comment") {
                        			component.options.commentMojo++;
                        			if(actionValue.object.stats.reviews) {
                        				component.options.commentMojo += actionValue.object.stats.reviews.updown;
                        			}
                        			if(notAlreadyAdded(result, actionValue.object.commentable_id)) {
                        				if(null != actionValue.object.object)
                        				{
                        					result.push(actionValue.object.object);
                        				}
                        			}
                        		}
                        	});
                            dff.resolve(result);
                        });        
                    });
                    return dff.promise();	
                }
            },
            initialize: function() {
            	this.options.commentMojo = 0;	
            },
            beforeRender: function(data, errors) {
            	if($("#mobileNavigator").is(':visible')){ //Meaning that we're in mobile
            		$('#interestsNavigator').click(function(){
            			$('.mainAside').show();
	                	$('.userFeed').hide();
	                	$('#feedNavigator').addClass('unselected').removeClass('selected');
	                	$('#interestsNavigator').addClass('selected').removeClass('unselected');
            		});
	                $('#feedNavigator').click(function(){
	                	$('.userFeed').show();
	                	$('#feedNavigator').addClass('selected').removeClass('unselected');
	                	$('.mainAside').hide();
	                	$('#interestsNavigator').addClass('unselected').removeClass('selected');
	                });
	                $('#feedNavigator').removeClass('active disabled');
            	}
            },
            afterRender: function(){
            	this.$el.removeClass("loading");
            	$("img").on("contextmenu",function(){
            		return false;
                });
                if($("#mobileNavigator").is(':visible')){ //Meaning that we're in mobile
			$('.mainAside').hide();
                }
            },
            actions: {
                back: function() {
                    window.location.href = '#/main';
                }
            }
        });
        
            Hull.component('createtopic', {
            templates: ['createtopic'],
            datasources: {
                topic: ':id'
            },
            afterRender: function() {
                var component = this;
    		component.$el.find('#agreeToPolicyBox').click(function(){
		    	if($(this).attr("checked")) { //button already checked, uncheck it
		    		$(this).attr("checked", false);
		    		component.$el.find('#updateImage').attr("disabled", "disabled");
		    	} else{ //it's unchecked, check it
		    		$(this).attr("checked", true);
		    		component.$el.find('#updateImage').removeAttr("disabled");
		    	}	
    		});
		this.sandbox.on('hull.upload.image.add', function(image) {
			component.$el.find('input[name=file]').addClass("btn btn-default disabled")
		});
                
                this.sandbox.on('hull.uploads.image.finished', function(image) {
                	var userAgrees = component.$el.find('#agreeToPolicyBox').attr("checked");
                	if(userAgrees){
                		var agreementEntry = {
					date: Hull.util.moment().toDate(),
	        			userID: Hull.currentUser().id,
	        			userName: Hull.currentUser().name,
	        			imageId: image.id,
	        			agreed: true
				};
				var agreements = component.data.topic.attributes.extra.agreements;
				agreements.push(agreementEntry);
				component.api(component.options.id, 'put',{
					"picture": image.id,
					"extra": {
						"agreements": agreements
					}
				}).then(function() {
					window.location.href = '#/post/'+ component.options.id;
				});   
                	} else{
	        		var n = noty({
	        			layout: 'topCenter',
	        			theme: 'relax',
	        			text: 'Y U no accept image policy?!',
	        			type: 'warning',
	        			timeout: 3000,
	        			killer: true,
	        			animation: {
	        				open: {height: 'toggle'}, // jQuery animate function property object
	        				close: {height: 'toggle'}, // jQuery animate function property object
	        				easing: 'swing', // easing
	        				speed: 300 // opening & closing animation speed
	        			}
	        		});
                		component.$el.find('input[name=file]').removeClass("disabled")
                	}
                });
            },
            actions: {
                skipimageupload: function() {
                    window.location.href = '#/post/'+ this.options.id;
                },
                updateimage: function() {
                	var component = this;
                	var newUrl = this.$el.find('#imageURL').val();
                	var userAgrees = component.$el.find('#agreeToPolicyBox').attr("checked");
                	if(newUrl !== "" && userAgrees){
                		var agreementEntry = {
                			date: Hull.util.moment().toDate(),
                			userID: Hull.currentUser().id,
                			userName: Hull.currentUser().name,
                			imageUrl: newUrl,
                			agreed: true
				};
				var agreements = component.data.topic.attributes.extra.agreements;
				agreements.push(agreementEntry);
                		component.api(component.options.id, 'put',{
	                		"picture": null,
	                		"extra": {
	                			"fallbackUrl": newUrl,
	                			"agreements": agreements
	                		}
	                	}).then(function() {
	                		window.location.href = '#/post/'+ component.options.id;
	                    }); 	
                	} else{
                		var n = noty({
                			layout: 'topCenter',
                			theme: 'relax',
                			text: 'Please fill in the new image URL!',
                			type: 'warning',
                			timeout: 3000,
                			killer: true,
                			animation: {
                				open: {height: 'toggle'}, // jQuery animate function property object
                				close: {height: 'toggle'}, // jQuery animate function property object
                				easing: 'swing', // easing
                				speed: 300 // opening & closing animation speed
                				}
                		});
                	}
                }
            }
        });
        
        Hull.component('search', {
            templates: ['search'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
            			case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },
            initialize: function() {
            },
            datasources: {
                searchResults: function() {
                var searchString = ''+ this.options.search;
        //searchString.replace(/(the|it is|we all|an?|by|to|you|[mh]e|she|they|we)/ig, '');
                var searchTokens = searchString.split(/[ ,]+/);
                return this.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                                'visibiliy': 'public',
                                where:{
                                    'name': {
                                        '$regex': '.*('+ searchTokens.join('|') +').*', '$options': 'i'
                                    }
                                }
                             });
                }
            },
            beforeRender: function(data, error) {
            },
            afterRender: function(data) {
            	$("img").on("contextmenu",function(){
                	return false;
                });
            },
            actions: {
                back: function() {
                    window.location.href = '#/main';
                }       
            }
        });
        
        Hull.component('test', {
            templates: ['test'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
			        case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },

            refreshEvents: ['model.hull.me.change'],
            
            requiredOptions: ['id'],
            
            events: {
            'keyup [name="description"]' : 'checkButtonStatus'
            },
            flagItem: function (event, action) {
            	var component = this;
            	event.preventDefault();
            	var id = action.data.id;
            	var n = noty({
			text: 'Are you sure you want to report this comment? Please report only offensive and inappropriate comments.',
			layout: 'topCenter',
			theme: 'relax',
			type: 'warning',
			animation: {
				open: {height: 'toggle'}, // jQuery animate function property object
				close: {height: 'toggle'}, // jQuery animate function property object
				easing: 'swing', // easing
				speed: 300 // opening & closing animation speed
			},
			buttons: [
				{addClass: 'btn btn-success', text: 'Yes', onClick: function($noty) {
					$noty.close();
					component.sandbox.flag(id);
					}
				},
				{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
						$noty.close();
					}
				}
			]
		});
            },
            actions: {
            delete:  'deleteComment',
            flag:    'flagItem',
            loadMore: function() {
            	this.$el.find('#loadMore').addClass("active disabled");
                this.options.limit += 10;
                this.render();
                }
            },  
            options: {
            focus: false,
            perPage: 10,
            page: 1
            },
            
            datasources: {
            	post: ':id',
            	comments: function() {
                    var orderBy;
                    if(this.options.orderby == 'votes') {
                        orderBy = 'stats.reviews.updown DESC';
                    } else if(this.options.orderby == 'date') {
                        orderBy = 'created_at DESC';
                    }
                    return this.api(this.options.id + '/comments', {
                        limit: this.options.limit,
                        order_by: orderBy
                     }); 
                }
            },
            
            initialize: function() {
            this.options.limit = 5;
            var query = {};
            
            if (this.options.startPage) {
            query.page = this.options.startPage;
            } else {
            query.skip = this.options.skip || 0;
            }
            
            this.sandbox.on('hull.comments.' + this.options.id + ".**", function() {
            this.render()
            }, this);
            
            query.limit = this.options.limit || this.options.perPage;
            this.query = query;
            },
            
            checkButtonStatus: function() {
            var disabled = !this.$find('[name="description"]').val();
            //this.$find('[data-hull-action="comment"]').attr('disabled', disabled);
            },
            
            beforeRender: function(data) {
            if(data.comments.length < data.post.stats.comments) {
            	this.options.showLoadMoreButton = true;	
            } else {
		this.options.showLoadMoreButton = false;	
            }
            
            this.sandbox.util._.each(data.comments, function(c) {
            c.isDeletable = (c.user.id === data.me.id);
            return c;
            }, this);
            return data;
            },
            
            afterRender: function(data) {
            	this.$el.removeClass('loading');
            	var tab = this.$el.parent().find('.loading');
            	tab.slideUp();
            	
            	var component = this;
            	this.$el.find(".imgIframe, .videoPostPlay").click(function() {
            		var oldId = $(this).parent().children(":first").attr("id"); //we do this trick because we want to get the .imgIframe. But we might be called from .VideoPostPlay
	                var currentId = oldId.substring(4);
	                pTP = "pTP_" + currentId;
	                pDP = "pDP_" + currentId;
	                oldId = "#" + oldId;
	                currentId = "#" + currentId;
	                component.$el.find(oldId).css({
	                	'display' : 'none'
	                });
	                component.$el.find(oldId).next(".videoPostPlay").css({
	                	'display' : 'none'
	                });
	                component.$el.find(currentId).css({
	                    'display' : 'block',
	                     'width': 'auto'
	                });
	                component.$el.find('#' + pTP).css({
	                    'width' : 'auto'
	                });
	                component.$el.find('#' + pDP).css({
	                    'width' : 'auto'
	                });
            	});
            	
            	if(this.options.focus || this.focusAfterRender) {
            		this.$el.find('input,textarea').focus();
            		this.focusAfterRender = false;
            	}
            	this.checkButtonStatus();
            	this.$el.find('.commentDescription').readmore({
            		speed: 75,
	  		lessLink: '<a href="#">Read less</a>',
	  		collapsedHeight: 100,
	  		embedCSS: true,
	  		blockCSS: 'display: block; width: 100%;'
            	});
            	this.$el.closest('.tab-content').siblings('.nav-tabs').find('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            		//this crazines is to handle showing readmore for comments that are originally hidden by tabs
            		component.$el.find('.commentDescription').readmore({
            			speed: 75,
		  		lessLink: '<a href="#">Read less</a>',
		  		collapsedHeight: 100,
		  		embedCSS: true,
	  			blockCSS: 'display: block; width: 100%;'
            		});
            	});
            },
            deleteComment: function(event, action) {
            	var component = this;
            	var n = noty({
        		text: 'Are you sure you want to delete your comment?',
        		layout: 'topCenter',
			theme: 'relax',
			type: 'warning',
			animation: {
				open: {height: 'toggle'}, // jQuery animate function property object
				close: {height: 'toggle'}, // jQuery animate function property object
				easing: 'swing', // easing
				speed: 300 // opening & closing animation speed
			},
			buttons: [
				{addClass: 'btn btn-danger', text: 'Yes', onClick: function($noty) {
					event.preventDefault();
	            			var id = action.data.id;
	            			var $parent = action.el
	            			.addClass('is-removing')
	            			.parents('[data-hull-comment-id="'+ id +'"]');
            				component.api(id, 'delete').then(function () {
            					$parent.remove();
            					$noty.close();
            				});
					}
				},
				{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
						$noty.close();
					}
				}
			]
		});
            },
            toggleLoading: function () {
            this.$el.toggleClass('is-loading');
            this.$find('input,textarea,button').attr('disabled', this.$el.hasClass('is-loading'));
            },
            
            postComment: function (e) {
            e.preventDefault();
            var self = this;
            var $form = this.$find('form');
   	
   		//See if the user already commented on this post today
   		this.api(this.options.id + '/comments', 'get').then(function(response) {
		});
		
            formData = this.sandbox.dom.getFormData($form);
            
            //if (formData.description && formData.description.length > 0) {
            this.toggleLoading();
            this.api(this.options.id + '/comments', 'post', {
            	"description": "Rich Comment",
            	"extra": {
            		"richComment": richComment
            	}
            }).then(function(comment) {
            self.sandbox.emit('hull.comments.' + self.options.id + '.added', comment);
            self.toggleLoading();
            self.focusAfterRender = true;
            self.render();
            }, function() {
            self.$el.find('input,textarea').focus();
            self.toggleLoading();
            });
            //}
            }
        });
        
        Hull.component('commentbox', {
        	templates: ['commentbox'],
        	datasources: {
        		post: ':id'
        	},
        	actions: {
	            comment: 'postComment'
            },
            afterRender: function(data) {
	            var linkPreviewDiv = this.$el.find('#lp1');
	            if(linkPreviewDiv.children().length == 0) {
	            	linkPreviewDiv.linkPreview({objectID: data.post.id, objectName: data.post.name, component: this});
	            }
            },
            postComment: function (e) {
	            e.preventDefault();
	            var self = this;
	            var $form = this.$find('form');
	   
	            formData = this.sandbox.dom.getFormData($form);
	            
	            this.toggleLoading();
	            this.api(this.options.id + '/comments', 'post', {
	            	"description": "Rich Comment",
	            	"extra": {
	            		"richComment": richComment
	            	}
	            }).then(function(comment) {
		            self.sandbox.emit('hull.comments.' + self.options.id + '.added', comment);
		            self.toggleLoading();
		            self.focusAfterRender = true;
		            self.render();
	            }, function() {
		            self.$el.find('input,textarea').focus();
		            self.toggleLoading();
	            });
            }
        });
        
        Hull.component('imagepolicy', {
        	templates: ['imagepolicy'],
        	datasources: {
        		post: ':id'
        	},
        	afterRender: function(data) {
        		var imagePolicyModal = this.$el.find("#imagepolicymodal");
        		imagePolicyModal.modal("toggle");
        		imagePolicyModal.on('hidden.bs.modal', function() {
        			window.history.back();
        		});
        	},
        	actions: {
        		back: function() {
        			var imagePolicyModal = this.$el.find("#imagepolicymodal");
        			imagePolicyModal.modal("toggle");
        		}
        	}
        });
        
        Hull.component('post', {
            templates: ['post'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
			        case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },
            datasources: {
                post: ':id',
                postsUnder: function() {
                    return this.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                        'visibiliy': 'public',
                        where:{
                          'tags.value':this.options.id,
                        },
                        limit: 1000
                     });
                },
                postsRelated: function() {
                    var dff = $.Deferred();
                    var result = [];
                    var tagsProcessed = 0;
                    var numberOfTags = 0;
                    var componentRef = this;
                    this.api(this.options.id, 'get').then(function(response) {
                    if(response.tags) {
                        numberOfTags = response.tags.length;
                        $.each(response.tags, function(tagsIndex, tagValue){
                            componentRef.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                        'visibiliy': 'public',
                        where:{
                          'tags.value':tagValue.value
                        }                     
                        }).then(function(response){
                                $.each(response, function(responseIndex, responseValue){
                                	if((responseValue.id != componentRef.options.id) && notAlreadyAdded(result, responseValue.id)) {
                                        result.push(responseValue);
                                    }
                                });
                                console.log("Tags proccessed:"+ ++tagsProcessed);
                            });
                        });
        
                        (function wait(){
                            if(tagsProcessed == numberOfTags) {
                                dff.resolve(result);
                            } else {
                                setTimeout(wait, 100);
                            }
                        })();
                      }
                    else {
                        dff.resolve(result);
                    }
                  });            
                  return dff.promise();
                }
            },    
            initialize: function(data) {
            },
            beforeRender: function (data, errors) {
            },
            afterRender: function (data) {
            	this.$el.removeClass("loading");
            	var component = this;
            	$("img").on("contextmenu",function(){
                	return false;
                });
                var hasElevatedAccess = false;
                if((data.loggedIn && data.isAdmin) || (data.loggedIn && data.me.id == data.post.actor.id)) {
                            hasElevatedAccess = true; 
                            component.$el.find('#editableTags').show();
                            component.$el.find('#updateImage').show();
                            component.$el.find('#adminIcon').show();
                }
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
        
                if(hasElevatedAccess) {
	                var tagsElement = this.$el.find('#postTags');
	                tagsElement.tagsInput({
	                    'autocomplete_url': "saksaka",
	                    'autocomplete': {
	                    	source: function(request, response) {
	                    		var searchTokens = request.term.split(/[ ,]+/);
		                    	component.api('52e138eaf0f1b0ac30000bad/conversations', 'get',{
		                                'visibiliy': 'public',
		                                where:{
		                                    'name': {
		                                        '$regex': '.*('+ searchTokens.join('|') +').*', '$options': 'i'
		                                    }
		                                }
		                    	}).then(function(hullresponse){
		                             	var searchresponse = $.map(hullresponse, function(elementOfArray, indexInArray){
		                             		if(elementOfArray.name){
		                             			var datum = {
		                             				label: elementOfArray.name,
		                             				value: elementOfArray.id
		                             			}
		                             			return datum;
		                             		}
		                             	});
		                             	response(searchresponse);
		                    	});
	                    	},
	                    	select: function(event, ui) {
		                        tagsElement.addTag(ui.item.label);
		                        tagsElement.removeTag(ui.item.value);
	                    	},
	                    	search: function(event, ui) {
	                    		var currentClass = event.target.getAttribute("class");
	                    		currentClass += " ui-autocomplete-loading";
	                    		event.target.setAttribute("class", currentClass);
	                    	},
	                    	response: function(event, ui) {
	                    		var currentClass = event.target.getAttribute("class");
	                    		var classes = currentClass.split(" ");
	                    		event.target.setAttribute("class", classes[0]);
	                    	},
	                    	messages: {
	                    		noResults: '',
	                    		results: function() {}
	                    	}
	                    },
	                    'height':'100px',
	                    'width':'300px',
	                    'interactive':true,
	                    'defaultText':'add more tags',
	                    'removeWithBackspace' : true,
	                    'minChars' : 0,
	                    'maxChars' : 0,
	                    'placeholderColor' : '#666666'
	                });
	                if(this.data.post.attributes.tags) {
	                   $.each(this.data.post.attributes.tags, function (tagIndex, tagValue) {
	                       tagsElement.addTag(tagValue.label);
	                   });
	                }
	                
	                var postTitle = this.$el.find('#postTitle');
	                postTitle.editable({
	                	type: 'text',
	                	title: 'Enter new title',
	                	success: function(response, newValue) {
	                		component.api(component.options.id, 'put',{
	                			"name": newValue
	                		}).then(function() {
	                		});
	                	}
	                });
                }
            },
            flagItem: function (event, action) {
            	var component = this;
            	event.preventDefault();
            	var id = action.data.id;
            	var n = noty({
			text: 'Are you sure you want to report this topic? Please report only inappropriate, spam or duplicate topics.',
			layout: 'topCenter',
			theme: 'relax',
			type: 'warning',
			animation: {
				open: {height: 'toggle'}, // jQuery animate function property object
				close: {height: 'toggle'}, // jQuery animate function property object
				easing: 'swing', // easing
				speed: 300 // opening & closing animation speed
			},
			buttons: [
				{addClass: 'btn btn-success', text: 'Yes', onClick: function($noty) {
					$noty.close();
					component.sandbox.flag(id);
					}
				},
				{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
						$noty.close();
					}
				}
			]
		});
            },
            actions: {
            	flag:    'flagItem',
                deleteTopic: function() {
                	var component = this;
	        	var n = noty({
	        		text: 'Are you sure you want to delete this topic?',
	        		layout: 'topCenter',
        			theme: 'relax',
        			type: 'warning',
        			animation: {
        				open: {height: 'toggle'}, // jQuery animate function property object
        				close: {height: 'toggle'}, // jQuery animate function property object
        				easing: 'swing', // easing
        				speed: 300 // opening & closing animation speed
        			},
				buttons: [
					{addClass: 'btn btn-danger', text: 'Yes', onClick: function($noty) {
						Hull.api(component.options.id, 'delete').then(function(response) {
							$noty.close();
							window.location.href = '#/main';
						});
						}
					},
					{addClass: 'btn btn-default', text: 'I changed my mind', onClick: function($noty) {
							$noty.close();
						}
					}
				]
			});
                },
                back: function() {
                    window.location.href = '#/main';
                },
                updateTags: function() {
                   var component = this;
                	
                   this.$el.find('#updateTags').addClass("active disabled");
                                        
                    var tagsText = this.$el.find('.tagsinput:eq(1)').prev().val(); //Selecting the second tagsinput because the first would be the create topic one. Remove if moved to separate form
                    var tagsPromise = processTags(tagsText);
                    var postID = this.options.id;
                    tagsPromise.done(function(result){
                        Hull.api(postID, 'put',{
                            "tags": result
                        }).then(function(response) {
                            component.$el.find('#updateTags').removeClass("active disabled");
                            
                            window.location.href = '#/post/'+ component.options.id;
                        });
                    });
                },
                updateImage: function() {
                    window.location.href = '#/createtopic/' + this.options.id;
                }
            }
        }); //post component
        
        Hull.component('comment', {
            templates: ['comment'],
            helpers: {
            	ifcond: function (v1, operator, v2, options) {
            		switch (operator) {
			        case '==':
			            return (v1 == v2) ? options.fn(this) : options.inverse(this);
			        case '===':
			            return (v1 === v2) ? options.fn(this) : options.inverse(this);
			        case '<':
			            return (v1 < v2) ? options.fn(this) : options.inverse(this);
			        case '<=':
			            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			        case '>':
			            return (v1 > v2) ? options.fn(this) : options.inverse(this);
			        case '>=':
			            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			        case '&&':
			            return (v1 && v2) ? options.fn(this) : options.inverse(this);
			        case '||':
			            return (v1 || v2) ? options.fn(this) : options.inverse(this);
			        default:
			            return options.inverse(this);
    			}
		}
            },
            datasources: {
                comment: ':id',
                post: function() {
                    var dff = $.Deferred(); 
                    var component = this;
                    component.api(this.options.id, 'get').then(function(response) {
                        component.api(response.commentable_id, 'get').then(function(response1) {
                            dff.resolve(response1);
                        });        
                    });
                    return dff.promise();
                },
                postsRelated: function() {
                	var dff = $.Deferred(); 
                	var component = this;
                	component.api(this.options.id, 'get').then(function(comment) {
                		var result = [];
                		var tagsProcessed = 0;
                		var numberOfTags = 0;
                		component.api(comment.commentable_id, 'get').then(function(topic) {
                			if(topic.tags) {
                				numberOfTags = topic.tags.length;
                				$.each(topic.tags, function(tagsIndex, tagValue){
                					component.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                						'visibiliy': 'public',
                						where:{
                							'tags.value':tagValue.value
                						}
                					}).then(function(response){
                						$.each(response, function(responseIndex, responseValue){
                							if((responseValue.id != topic.id) && notAlreadyAdded(result, responseValue.id)) {
                								result.push(responseValue);
                							}
                						});
                						tagsProcessed++;
                					});
                				});
                				
                				(function wait(){
                					if(tagsProcessed == numberOfTags) {
                						dff.resolve(result);
                					} else {
                						setTimeout(wait, 100);
                					}
                				})();
                			} else {
                				dff.resolve(result);
                			}
                		});
                	});
                	return dff.promise();
                }
            },
            afterRender: function(data) {
            	this.$el.removeClass("loading");
            	var component = this;
            	$("img").on("contextmenu",function(){
                	return false;
                });
	            this.$el.find(".imgIframe, .videoPostPlay").click(function() {
	            	var oldId = $(this).parent().children(":first").attr("id"); //we do this trick because we want to get the .imgIframe. But we might be called from .VideoPostPlay
	                var currentId = oldId.substring(4);
	                pTP = "pTP_" + currentId;
	                pDP = "pDP_" + currentId;
	                oldId = "#" + oldId;
	                currentId = "#" + currentId;
	                component.$el.find(oldId).css({
	                	'display' : 'none'
	                });
	                component.$el.find(oldId).next(".videoPostPlay").css({
	                	'display' : 'none'
	                });
	                component.$el.find(currentId).css({
	                    'display' : 'block'
	                });
	                component.$el.find('#' + pTP).css({
	                    'width' : '495px'
	                });
	                component.$el.find('#' + pDP).css({
	                    'width' : '495px'
	                });
	            });
            }        
        });
        
        Hull.component('mobilesearchform', {
        	templates: ['mobilesearchform'],
        	afterRender: function(data) {
        		var component = this;
        		this.$el.find('#searchFieldMobile').autocomplete({
	                    source: function(request, response) {
	                    	var searchTokens = request.term.split(/[ ,]+/);
	                    	component.api('52e138eaf0f1b0ac30000bad/conversations', 'get',{
                                'visibiliy': 'public',
                                where:{
                                    'name': {
                                        '$regex': '.*('+ searchTokens.join('|') +').*', '$options': 'i'
                                    }
                                }
                             }).then(function(hullresponse){
                             	var searchresponse = $.map(hullresponse, function(elementOfArray, indexInArray){
                             		if(elementOfArray.name){
                             			var datum = {
                             				label: elementOfArray.name,
                             				value: elementOfArray.id
                             			}
                             			return datum;
                             		}
                             	});
                             	response(searchresponse);
                             });
	                    },
			    appendTo: ".searchFormMobile",
	                    select: function(event, ui) {
	                    	event.preventDefault();
	                    	$(this).val(ui.item.label);
	                    	var mobileSearchModal = component.$el.find("#mobileSearchModal");
	    			mobileSearchModal.on('hidden.bs.modal', function() {
	                        	window.location.href = '#/post/' + ui.item.value;
				})
				mobileSearchModal.modal("toggle");
	                    }
	                });
        	}
        });

        Hull.component('createtopicform', {
            templates: ['createtopicform'],
            refreshEvents: ['model.hull.me.change'],
	    initialize: function(data) {
	    	this.options.imageID = "0";
	    },
            afterRender: function (data) {
            	$('.create').each(function(index){
            		$(this).css('visibility', 'visible');
            	});
            	var component = this;
		
		this.sandbox.on('hull.upload.image.add', function(image) {
			component.$el.find('input[name=file]').addClass("btn btn-default disabled")
		});
		
                this.sandbox.on('hull.uploads.image.finished', function(image) {
                	component.options.imageID = image.id;
			component.$el.find('input[name=file]').removeClass("btn btn-default disabled")
			component.$el.find('#finishedUploadIcon').show();
                });
                var agreementCheckBox = component.$el.find('#agreeToPolicyBox');
                if(!($._data(agreementCheckBox.get(0), 'events'))){ //bind click event once. In case of multiple renders
    			agreementCheckBox.click(function(){
    				if($(this).attr("checked")) { //button already checked, uncheck it
    					$(this).attr("checked", false);
    					component.$el.find('#createTopic').attr("disabled", "disabled");
    				} else{ //it's unchecked, check it
    					$(this).attr("checked", true);
    					component.$el.find('#createTopic').removeAttr("disabled");
    				}	
    			});	
                }
        	var tagsField = this.$el.find('#tagsField');
                tagsField.tagsInput({
                	'autocomplete_url': "saksaka",
                	'autocomplete': {
                		source: function(request, response) {
                			var searchTokens = request.term.split(/[ ,]+/);
		                    	component.api('52e138eaf0f1b0ac30000bad/conversations', 'get',{
		                    		'visibiliy': 'public',
		                                where:{
		                                    'name': {
		                                        '$regex': '.*('+ searchTokens.join('|') +').*', '$options': 'i'
		                                    }
		                                }
		                    	}).then(function(hullresponse){
		                    		var searchresponse = $.map(hullresponse, function(elementOfArray, indexInArray){
		                    			if(elementOfArray.name){
		                    				var datum = {
		                             				label: elementOfArray.name,
		                             				value: elementOfArray.id
		                             			}
		                             			return datum;
		                             		}
		                    		});
		                    		response(searchresponse);
		                    	});
                		},
	                    	select: function(event, ui) {
		                        tagsField.addTag(ui.item.label);
		                        tagsField.removeTag(ui.item.value);
	                    	},
	                    	search: function(event, ui) {
	                    		var currentClass = event.target.getAttribute("class");
	                    		currentClass += " ui-autocomplete-loading";
	                    		event.target.setAttribute("class", currentClass);
	                    	},
	                    	response: function(event, ui) {
	                    		var currentClass = event.target.getAttribute("class");
	                    		var classes = currentClass.split(" ");
	                    		event.target.setAttribute("class", classes[0]);
	                    	},
	                    	messages: {
	                    		noResults: '',
	                    		results: function() {}
	                    	}
	                    },
                    'height':'100px',
                    'width':'300px',
                    'interactive':true,
                    'defaultText':'add some tags',
                    'removeWithBackspace' : true,
                    'minChars' : 0,
                    'maxChars' : 0,
                    'placeholderColor' : '#666666',
                    'onChange' : function(param) {
                    	var tagsText = $('.tagsinput').prev().val();
                    	if(tagsText) {
                    		var listOfTags = tagsText.split(',');
                    		var numberOfTags = listOfTags.length;
                    		if(numberOfTags > 0) {
                    			component.$el.find('#imageSection').fadeIn(function(){
                    				var agreeCheckBox = component.$el.find('#agreeToPolicyBox');
                    				var imageSelection = component.$el.find('input[name=imageSelection]:checked').val();
	                    			if(imageSelection === "url" || imageSelection==="upload") {
	                    				if(agreeCheckBox.attr("checked")) {
	                    					component.$el.find('#createTopic').removeAttr("disabled");
	                    				}
	                    			} else if(imageSelection === "none") {
	                    				component.$el.find('#createTopic').removeAttr("disabled");
	                    			}	
                    			});
                    		}
                    	}  else {
                    		component.$el.find('#imageSection').fadeOut();
                    		component.$el.find('#createTopic').attr("disabled", "disabled");
                    	}
                    }
                });
                
                this.$el.find('#newEntityField').keyup(function(e) {
			if(trim($(this).val()) !== "") {
				component.$el.find('#tagsSection').slideDown();
			} else {
				component.$el.find('#tagsSection').slideUp();
				component.$el.find('#createTopic').attr("disabled", "disabled");
			}
                });
                
                this.$el.find('input[type="radio"]').click(function(){
                	if($(this).attr("value")=="url"){
                		component.$el.find('#imageURL').css('display', 'block');
                		component.$el.find('#imageUploader').hide();
                		component.$el.find('#iAgreeSection').css('display', 'block');
                		component.$el.find('#createTopic').attr("disabled", "disabled");
                		component.$el.find('#agreeToPolicyBox').attr("checked", false);
                	}
                	if($(this).attr("value")=="upload"){
                		component.$el.find('#imageURL').hide();
                		component.$el.find('#imageUploader').show();
                		component.$el.find('#iAgreeSection').css('display', 'block');
                		component.$el.find('#createTopic').attr("disabled", "disabled");
                		component.$el.find('#agreeToPolicyBox').attr("checked", false);
                	}
                	if($(this).attr("value")=="none"){
                		component.$el.find('#imageURL').hide();
                		component.$el.find('#imageUploader').hide();
                		component.$el.find('#iAgreeSection').hide();
                		component.$el.find('#createTopic').removeAttr("disabled");
                		component.$el.find('#agreeToPolicyBox').attr("checked", false);
                	}
                });
                

            },
            actions: {
                createtopic: function() {
                
                    this.$el.find("#createTopic").addClass("active disabled");
                	
                    this.$el.find('.createbuzz').children().attr("disabled", "disabled");
                    
                    var component = this;
                    var newConversationName = this.$el.find('#newEntityField').val();
                    if(newConversationName) {
                        var tagsText = this.$el.find('.tagsinput').prev().val();
                        component.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                            'visibiliy': 'public',
                             where:{
                                'name': {
                                    '$regex': '^' + newConversationName + '$', '$options': 'i'
                                }
                            }
                        }).then(function(response) {
                            if(response.length == 0) {
                            	var createTopicModal = component.$el.find("#createTopicModal");
                            	if(tagsText) {
                            		var tagsPromise = processTags(tagsText);
                                	tagsPromise.done(function(result){
                                		var imageOption = component.$el.find('input[type="radio"]:checked').val();
                                		switch(imageOption) {
                                			case "url":
                                				var newUrl = component.$el.find('#imageURL').val();
                                				var userAgrees = component.$el.find('#agreeToPolicyBox').attr("checked");
                                				if(newUrl !== "" && userAgrees){
                                					var agreementEntry = {
			                                			date: Hull.util.moment().toDate(),
			                                			userID: Hull.currentUser().id,
			                                			userName: Hull.currentUser().name,
			                                			imageUrl: newUrl,
			                                			agreed: true
                                					};
                                					var agreements = [];
                                					agreements.push(agreementEntry);
                                					component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
	                                					"public": "true",
	                                					"name": newConversationName,
	                                					"tags": result,
	                                					"picture": null,
	                                					"extra": {
	                                						"fallbackUrl": newUrl,
	                                						"agreements": agreements
	                                					}
	                                				}).then(function(response) {
	                							createTopicModal.on('hidden.bs.modal', function() {
	                								window.location.href = '#/post/' + response.id;
										})
										createTopicModal.modal("toggle");
	                                				}, function(error){
						                		var n = noty({
						                			layout: 'topCenter',
						                			theme: 'relax',
						                			text: 'Oops! Something went wrong from our side. Please try again.',
						                			type: 'warning',
						                			timeout: 3000,
						                			killer: true,
						                			animation: {
						                				open: {height: 'toggle'}, // jQuery animate function property object
						                				close: {height: 'toggle'}, // jQuery animate function property object
						                				easing: 'swing', // easing
						                				speed: 300 // opening & closing animation speed
						                			}
						                		});
                							});	
                                				} else{
                                					var n = noty({
                                						layout: 'topCenter',
					                			theme: 'relax',
					                			text: 'Looks like your forgot the image URL!',
					                			type: 'warning',
					                			timeout: 3000,
					                			killer: true,
					                			animation: {
					                				open: {height: 'toggle'}, // jQuery animate function property object
					                				close: {height: 'toggle'}, // jQuery animate function property object
					                				easing: 'swing', // easing
					                				speed: 300 // opening & closing animation speed
					                			}
					                		});
                                					component.$el.find("#createTopic").removeClass("active disabled");
                                				}
                                				break;
                        				case "upload":
                        					var userAgrees = component.$el.find('#agreeToPolicyBox').attr("checked");
                        					if((component.options.imageID !== "0") && userAgrees) {
                        						var agreementEntry = {
                        							date: Hull.util.moment().toDate(),
			                                			userID: Hull.currentUser().id,
			                                			userName: Hull.currentUser().name,
			                                			imageId: component.options.imageID,
			                                			agreed: true
                                					};
                                					var agreements = [];
                                					agreements.push(agreementEntry);
                        						component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post', {
                        							"public": "true",
	                							"name": newConversationName,
	                							"tags": result,
	                							"picture": component.options.imageID,
	                							"extra": {
	                                						"agreements": agreements
	                							}
                        						}).then(function(response) {
                								createTopicModal.on('hidden.bs.modal', function() {
                									window.location.href = '#/post/' + response.id;
										})
										createTopicModal.modal("toggle");
                        						}, function(error){
						                		var n = noty({
						                			layout: 'topCenter',
						                			theme: 'relax',
						                			text: 'Oops! Something went wrong from our side. Please try again.',
						                			type: 'warning',
						                			timeout: 3000,
						                			killer: true,
						                			animation: {
						                				open: {height: 'toggle'}, // jQuery animate function property object
						                				close: {height: 'toggle'}, // jQuery animate function property object
						                				easing: 'swing', // easing
						                				speed: 300 // opening & closing animation speed
						                			}
						                		});
                        						});
                        					} else {
                        						var n = noty({
					                			layout: 'topCenter',
					                			theme: 'relax',
					                			text: 'Too fast! The image is not fully uploaded yet!',
					                			type: 'warning',
					                			timeout: 3000,
					                			killer: true,
					                			animation: {
					                				open: {height: 'toggle'}, // jQuery animate function property object
					                				close: {height: 'toggle'}, // jQuery animate function property object
					                				easing: 'swing', // easing
					                				speed: 300 // opening & closing animation speed
					                			}
					                		});
					                		component.$el.find("#createTopic").removeClass("active disabled");
                        					}
                        					break;
                					case "none":
                						component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                							"public": "true",
                							"name": newConversationName,
                							"tags": result
                						}).then(function(response) {
                							createTopicModal.on('hidden.bs.modal', function() {
                								window.location.href = '#/post/' + response.id;
									})
									createTopicModal.modal("toggle");
                						}, function(error){
                							var n = noty({
					                			layout: 'topCenter',
					                			theme: 'relax',
					                			text: 'Oops! Something went wrong from our side. Please try again.',
					                			type: 'warning',
					                			timeout: 3000,
					                			killer: true,
					                			animation: {
					                				open: {height: 'toggle'}, // jQuery animate function property object
					                				close: {height: 'toggle'}, // jQuery animate function property object
					                				easing: 'swing', // easing
					                				speed: 300 // opening & closing animation speed
					                			}
					                		});
                						});
                						break;
                                		}
                                	});
                        	} else {
                        		component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                                		"public": "true",
                                		"name": newConversationName
                                    	}).then(function(response) {
                                		createTopicModal.on('hidden.bs.modal', function() {
                					window.location.href = '#/post/' + response.id;
						})
						createTopicModal.modal("toggle");
                                	}, function(error){
                                		var n = noty({
		                			layout: 'topCenter',
		                			theme: 'relax',
		                			text: 'Oops! Something went wrong from our side. Please try again.',
		                			type: 'warning',
		                			timeout: 3000,
		                			killer: true,
		                			animation: {
		                				open: {height: 'toggle'}, // jQuery animate function property object
		                				close: {height: 'toggle'}, // jQuery animate function property object
		                				easing: 'swing', // easing
		                				speed: 300 // opening & closing animation speed
		                			}
		                		});
                                	});
                        	}
                            } else {
                		var n = noty({
                			layout: 'topCenter',
                			theme: 'relax',
                			text: "Looks like there's an existing topic with the same name. Please choose a different name",
                			type: 'warning',
                			timeout: 3000,
                			killer: true,
                			animation: {
                				open: {height: 'toggle'}, // jQuery animate function property object
                				close: {height: 'toggle'}, // jQuery animate function property object
                				easing: 'swing', // easing
                				speed: 300 // opening & closing animation speed
                			}
                		});
                                component.$el.find("#createTopic").removeClass("active disabled");
                            }
                        });
                    }        
                }
            }
        });
        
         Hull.component('main', {
            templates: ['main', 'post', 'user', 'search', 'createtopic', 'comment', 'imagepolicy'],
            refreshEvents: ['model.hull.me.change'],
            initialize: function(){
                var HullagramRouter = Backbone.Router.extend({
                    routes: {
                        ':view(/:id)(/:action)' : 'view'
                    }
                });
            
                var router  = new HullagramRouter();
                router.on('route:view', function(view, id, action) {
                    var tpl = action || view || 'main';
                    this.currentView = tpl;
                    this.render(tpl, { id: id });
                }, this);
        
                this.sandbox.on('hullagram.route', function(route) {
                    router.navigate(route, { trigger: true });
                });
        
                setTimeout(function() {
                    Backbone.history.start();
                    if(Backbone.history.location.hash ==="") { //navigate to main on first launch
                    	router.navigate('/main');
                    }
                }, 200);
        
            },  
            beforeRender: function(data) {
            	if(window.location.search) { //This is a result of FB share
            		window.location.href = '#/' + window.location.search.substring(1).split('&')[0].replace('=', '/');
            	} else {
            		data.currentView = this.currentView;
            	}
                return data;
            }            
        });
