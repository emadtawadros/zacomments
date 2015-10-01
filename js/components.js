Hull.component('posts', {
            templates: ['posts'],
            initialize: function(){
                var tab = this.$el.parent().find('.loading');
                tab.slideDown();
        
                this.options.trendingDaysLimit = 365;    //3 days
                this.options.trendingLimit = 10;    //10 posts
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
                
                      //Get the result of the query and alert it.
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
                                console.log("fetching more data from Keen");
                                componenet.options.trendingDaysLimit += 30;
                                componenet.render();
                            }
                        });    //end of keen response
                    });
                    return dff.promise();
                }
            },
            afterRender: function() {
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
                
                this.$el.find('#loadMoreTrending').removeAttr('dissabled');

            },
            flagItem: function (event, action) {
            	event.preventDefault();
            	var id = action.data.id;
            	var isCertain = confirm('Do you want to report this content as inappropriate ?');
            	if (isCertain) {
            		this.sandbox.flag(id);
            	}
            },
            actions: {
            	flag:    'flagItem',
                loadMoreTrending: function() {
                	
                	this.$el.find('#loadMoreTrending').attr("disabled", "disabled");

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
        		this.options.limit = 10;
        	},
        	afterRender: function() {
        		this.$el.find('#loadMore').removeAttr('dissabled');
        	},
        	flagItem: function (event, action) {
        		event.preventDefault();
        		var id = action.data.id;
        		var isCertain = confirm('Do you want to report this content as inappropriate ?');
        		if (isCertain) {
        			this.sandbox.flag(id);
        		}
        	},
        	actions: {
        		flag: 'flagItem',
        		loadMore: function() {
        			this.$el.find('#loadMore').attr("disabled", "disabled");
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
	  }
	});
	
        Hull.component('flaggedposts', {
        	templates: ['flaggedposts'],
        	datasources: {
        		flaggedPosts: function() {
        			return this.api('/52e138eaf0f1b0ac30000bad/conversations', {
        				'where': {
        					'meta.flags': {
        						'$gt': 0
        					}
        				}
        			});
        		}
        	},
        	unflagItem: function (event, action) {
        		event.preventDefault();
        		var id = action.data.id;
        		this.api(id + '/flag?all=1', 'delete').then(function(response) {
        			console.log(response);
        		});
        		window.location.href = '#/maincomp';
        	},
        	deleteItem: function(event, action) {
        		event.preventDefault();
        		var isCertain = confirm('Are you sure you want to delete this topic?');
        		if (isCertain) {
        			var id = action.data.id;
        			this.api(id, 'delete').then(function(response) {
        				console.log(response);
        			});
        			window.location.href = '#/maincomp';	
        		}
                },
        	actions:
        	{
        		unflag: 'unflagItem',
        		deleteItem: 'deleteItem'
        	}
        });
        
        Hull.component('user', {
            templates: ['user'],
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
            beforeRender: function(data, errors) {
                console.log(data);
            },
            actions: {
                back: function() {
                    window.location.href = '#/maincomp';
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
                
		this.sandbox.on('hull.upload.image.add', function(image) {                  
			component.$el.children().attr("disabled", "disabled");
		});
                
                this.sandbox.on('hull.uploads.image.finished', function(image) {                  
                    component.api(component.options.id, 'put',{
                            "picture": image.id
                        }).then(function() {
                        window.location.href = '#/post/'+ component.options.id;
                    });                    
                });
            },
            actions: {
                skipimageupload: function() {
                    window.location.href = '#/post/'+ this.options.id;
                },
                updateimage: function() {
                	var component = this;
                	var newUrl = this.$el.find('#imageURL').val();
                	component.api(component.options.id, 'put',{
                		"picture": null,
                		"extra": {
                			"fallbackUrl": newUrl
                		}
                	}).then(function() {
                		window.location.href = '#/post/'+ component.options.id;
                    }); 
                }
            }
        });
        
        Hull.component('search', {
            templates: ['search'],
            initialize: function() {
                console.log(this.options.search);
            },
            datasources: {
                searchResults: function() {
                var searchString = ''+ this.options.search;
        //searchString.replace(/(the|it is|we all|an?|by|to|you|[mh]e|she|they|we)/ig, '');
                var searchTokens = searchString.split(/[ ,]+/);
                console.log(searchTokens);
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
                console.log(data);
                console.log(error);
            },
            afterRender: function(data) {
            	console.log(data);
            },
            actions: {
                back: function() {
                    window.location.href = '#/maincomp';
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
            	event.preventDefault();
            	var id = action.data.id;
            	var isCertain = confirm('Do you want to report this content as inappropriate ?');
            	if (isCertain) {
            		this.sandbox.flag(id);
            	}
            },
            actions: {
            delete:  'deleteComment',
            flag:    'flagItem',
            loadMore: function() {
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
            
            var tab = this.$el.parent().find('.loading');
            tab.slideUp();
           
            var component = this;
            this.$el.find(".imgIframe, .videoPostPlay").click(function() {
            	var oldId = $(this).parent().children(":first").attr("id"); //we do this trick because we want to get the .imgIframe. But we might be called from .VideoPostPlay
                var currentId = oldId.substring(4);
                console.log("old " + oldId);
                console.log("current " + currentId);
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
                    
            if(this.options.focus || this.focusAfterRender) {
            this.$el.find('input,textarea').focus();
            this.focusAfterRender = false;
            }
            this.checkButtonStatus();
            },
            
            deleteComment: function(event, action) {
            event.preventDefault();
            var id = action.data.id;
            var $parent = action.el
            .addClass('is-removing')
            .parents('[data-hull-comment-id="'+ id +'"]');
            this.api(id, 'delete').then(function () {$parent.remove();});
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
 		console.log(response);
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
        
        Hull.component('post', {
            templates: ['post'],
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
                            console.log("tag value");
                            console.log(tagValue);
                            componentRef.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                        'visibiliy': 'public',
                        where:{
                          'tags.value':tagValue.value
                        }                     
                        }).then(function(response){
                                console.log("related tag");
                                console.log(response);
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
                                console.log("Tags processing completed!");
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
                console.log("init");
                console.log(data);
                console.log(data);
            },
            beforeRender: function (data, errors) {
                console.log("before render");
                console.log(data);
                console.log("Before render errors:" + errors);
            },
            afterRender: function (data) {
            	var component = this;
                var hasElevatedAccess = false;
                if((data.loggedIn && data.isAdmin) || (data.loggedIn && data.me.id == data.post.actor.id)) {
                            hasElevatedAccess = true; 
                            component.$el.find('#editableTags').show();
                            component.$el.find('#updateImage').show();
                }
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
        
                console.log("after render");
                console.log(data);
                
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
	                			console.log("Title updated successfully!");
	                		});
	                	}
	                });
                }
            },
            flagItem: function (event, action) {
            	event.preventDefault();
            	var id = action.data.id;
            	var isCertain = confirm('Do you want to report this content as inappropriate ?');
            	if (isCertain) {
            		this.sandbox.flag(id);
            		}
            },
            actions: {
            	flag:    'flagItem',
                deleteTopic: function() {
                	var isCertain = confirm('Are you sure you want to delete this topic?');
                	if (isCertain) {
                		Hull.api(this.options.id, 'delete').then(function(response) {
                			console.log(response);
                			window.location.href = '#/maincomp';
                		});
                	}
                },
                back: function() {
                    window.location.href = '#/maincomp';
                },
                updateTags: function() {
                   var component = this;
                	
                   this.$el.find('#updateTags').attr("disabled", "disabled");
                                        
                    var tagsText = this.$el.find('.tagsinput:eq(1)').prev().val(); //Selecting the second tagsinput because the first would be the create topic one. Remove if moved to separate form
                    var tagsPromise = processTags(tagsText);
                    var postID = this.options.id;
                    tagsPromise.done(function(result){
                        Hull.api(postID, 'put',{
                            "tags": result
                        }).then(function(response) {
                            component.$el.find('#updateTags').removeAttr("disabled");
                            
                            console.log(response);
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
                console.log(data);
                this.$el.find(".imgIframe").click(function() {
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
            	var component = this;
	
                this.sandbox.on('hull.uploads.image.finished', function(image) {
                	component.options.imageID = image.id;
                });
        
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
                    			component.$el.find('#imageRadio').fadeIn();
                    		}
                    	}  else {
                    		component.$el.find('#imageRadio').fadeOut();
                    	}
                    }
                });
                
                this.$el.find('.tagsinput').hide();
                
                this.$el.find('#newEntityField').keyup(function(e) {
		if(trim($(this).val()) !== "") {
			component.$el.find('.tagsinput').slideDown();
			component.$el.find('#createTopic').removeAttr("disabled");
		} else {
			component.$el.find('.tagsinput').slideUp();
			component.$el.find('#createTopic').attr("disabled", "disabled");
		}
                });
                
                this.$el.find('input[type="radio"]').click(function(){
                	if($(this).attr("value")=="url"){
                		component.$el.find('#imageURL').css('display', 'block');
                		component.$el.find('#imageUploader').hide();
                	}
                	if($(this).attr("value")=="upload"){
                		component.$el.find('#imageURL').hide();
                		component.$el.find('#imageUploader').show();
                	}
                	if($(this).attr("value")=="none"){
                		component.$el.find('#imageURL').hide();
                		component.$el.find('#imageUploader').hide();
                	}
                });
                

            },
            actions: {
                createtopic: function() {
                	
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
                            console.log("regular expression result");
                            console.log(response);
                            if(response.length == 0) {
                            	if(tagsText) {
                            		var tagsPromise = processTags(tagsText);
                                	tagsPromise.done(function(result){
                                		var createTopicModal = component.$el.find("#createTopicModal");
                                		var imageOption = component.$el.find('input[type="radio"]:checked').val();
                                		switch(imageOption) {
                                			case "url":
                                				var newUrl = component.$el.find('#imageURL').val();
                                				component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                                					"public": "true",
                                					"name": newConversationName,
                                					"tags": result,
                                					"picture": null,
                                					"extra": {
                                						"fallbackUrl": newUrl
                                					}
                                				}).then(function(response) {
                                					console.log(response);
                                					component.$el.find("#createTopicModal").modal("toggle");
                                					window.location.href = '#/post/' + response.id;
                                				});
                                				break;
                        				case "upload":
                        					if(component.options.imageID) {
                        						component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post', {
                        							"public": "true",
	                							"name": newConversationName,
	                							"tags": result,
	                							"picture": component.options.imageID

                        						}).then(function(response) {
                        							component.$el.find("#createTopicModal").modal("toggle");
                        							window.location.href = '#/post/'+ response.id;
                        						});
                        					} else {
                        						alert("please upload and image. Or wait for the upload to finish.");
                        					}
                        					break;
                					case "none":
                						component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                							"public": "true",
                							"name": newConversationName,
                							"tags": result
                						}).then(function(response) {
                							console.log(response);
                							createTopicModal.on('hidden', function() {
                								window.location.href = '#/post/' + response.id;
									})
									createTopicModal.modal("toggle");
                						});
                						break;
                                		}
                                	});
                        	} else {
                        		component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                                		"public": "true",
                                		"name": newConversationName
                                    	}).then(function(response) {
                                		console.log(response);
                                		component.$el.find("#createTopicModal").modal("toggle");
                                		window.location.href = '#/createtopic/' + response.id;
                                	});
                        	}
                            } else {
                                alert("A topic with the same name already exsits!");
                                component.$el.find('.createbuzz').children().removeAttr("disabled");
                            }
                        });
                    }        
                }
            }
        });
        
         Hull.component('maincomp', {
            templates: ['maincomp', 'post', 'user', 'search', 'createtopic', 'comment'],
            refreshEvents: ['model.hull.me.change'],
            initialize: function(){
                var HullagramRouter = Backbone.Router.extend({
                    routes: {
                        ':view(/:id)(/:action)' : 'view'
                    }
                });
            
                var router  = new HullagramRouter();
                router.on('route:view', function(view, id, action) {
                    var tpl = action || view || 'maincomp';
                    this.currentView = tpl;
                    this.render(tpl, { id: id });
                }, this);
        
                this.sandbox.on('hullagram.route', function(route) {
                    router.navigate(route, { trigger: true });
                });
        
                setTimeout(function() {
                    Backbone.history.start();
                    router.navigate('/maincomp');

                }, 200);
        
            },  
            beforeRender: function(data) {
            	if(window.location.search) { //This is a result of FB share
            		window.location.href = '#/' + window.location.search.substring(1).split('&')[0].replace('=', '/');
            	} else {
            		data.currentView = this.currentView;
            	}
                return data;
            },
            afterRender: function() {
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
               
            }               
        });
