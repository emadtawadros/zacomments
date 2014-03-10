Hull.component('posts', {
            templates: ['posts'],
            initialize: function(){
                var tab = this.$el.parent().find('.loading');
                tab.slideDown();
        
                this.options.limit = 5;
                this.options.trendingDaysLimit = 30;    //3 days
                this.options.trendingLimit = 10;    //10 posts
        
                setTimeout(function() {
                    Backbone.history.start();
                }, 200);
        
            }, //initialize
            datasources: {
                newPosts: function() {
                    return this.api('52e138eaf0f1b0ac30000bad/conversations', 'get', {
                        'visibiliy': 'public',
                        limit: this.options.limit,
                        order_by: 'created_at DESC'
                     });
                },
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
                            var numberOfPosts = componenet.options.trendingLimit;
                            if(response.result.length >= componenet.options.trendingLimit) {
                                response.result.sort(function(a,b) {
                                    return b.result - a.result;
                                });
                                
                                console.log(response.result);
                                for(var i = 0; i< componenet.options.trendingLimit; i++)
                                {
                                    componenet.api(response.result[i].target_id, 'get').then(function(response) {
                                        result.push(response);
                                    }, function(error) {
                                        numberOfPosts--;
                                    });
                                }
                                (function wait(){
                                    if(result.length >= numberOfPosts) {
                                        dff.resolve(result);
                                    } else {
                                        setTimeout(wait, 100);
                                    }
                                })();
                            }
                            else {    //We need to fetch more data from Keen
                                console.log("fetching more data from Keen");
                                componenet.options.trendingDaysLimit += 5;
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
            },
            actions: {
                loadMore: function() {
                    this.options.limit += 10;
                    this.render();
                },
                loadMoreTrending: function() {

                        this.options.trendingLimit += 10;
                        this.render();
                    
                }
            }
        });    //posts component
        
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
                var searchString = this.options.search;
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
            },
            actions: {
                back: function() {
                    window.location.href = '#/maincomp';
                }       
            }
        });
        
        Hull.component('test', {
            templates: ['test', 'form'],

            refreshEvents: ['model.hull.me.change'],
            
            requiredOptions: ['id'],
            
            events: {
            'keyup [name="description"]' : 'checkButtonStatus'
            },
            
            
            actions: {
            comment: 'postComment',
            'delete':  'deleteComment',
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
            this.sandbox.util._.each(data.comments, function(c) {
            c.isDeletable = (c.user.id === data.me.id);
            return c;
            }, this);
            return data;
            },
            
            afterRender: function(data) {
            
            console.log(data);
            var tab = this.$el.parent().find('.loading');
            tab.slideUp();
            
            var linkPreviewDiv = this.$el.find('#lp1');
            if(linkPreviewDiv.children().length == 0) {
            	linkPreviewDiv.linkPreview({objectID: this.options.id, objectName: data.post.name, component: this});
            }
            
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
            },
            
            flagItem: function (event, action) {
            event.preventDefault();
            var id = action.data.id;
            var isCertain = confirm('Do you want to report this content as inappropriate ?');
            if (isCertain) {
            this.sandbox.flag(id);
            }
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
                                    if(responseValue.id != componentRef.options.id) {
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
                var isTagsEditable = false;
                if(data.loggedIn && data.isAdmin) {
                            isTagsEditable = true; 
                }
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
        
                console.log("after render");
                console.log(data);
                var tagsElement = this.$el.find('#postTags');
                tagsElement.tagsInput({
                    'autocomplete_url': arr,
                    'autocomplete': {select: function(event, ui){
                        tagsElement.addTag(ui.item.label);
                        tagsElement.removeTag(ui.item.value);
                    }},
                    'height':'100px',
                    'width':'300px',
                    'interactive':isTagsEditable,
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
            },
            actions: {
                deleteTopic: function() {
                    Hull.api(this.options.id, 'delete').then(function(response) {
                    console.log(response);
                    });
                    window.location.href = '#/maincomp';
                },
                back: function() {
                    window.location.href = '#/maincomp';
                },
                updateTags: function() {
                    var tagsText = this.$el.find('.tagsinput').prev().val(); 
                    var tagsPromise = processTags(tagsText);
                    var postID = this.options.id;
                    tagsPromise.done(function(result){
                        Hull.api(postID, 'put',{
                            "tags": result
                        }).then(function(response) {
                            console.log(response);
                            window.location.href = '#/maincomp';
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

            afterRender: function (data) {
        
                var mappedTopics = $.map(rawAllTopics, function(elementOfArray, indexInArray){
                    if(elementOfArray.name){
                        var datum = {
                            label: elementOfArray.name,
                            value: elementOfArray.id
                        }
                        return datum;
                    }
                });
        
        	var tagsField = this.$el.find('#tagsField');
                tagsField.tagsInput({
                    'autocomplete_url': mappedTopics,
                    'autocomplete': {select: function(event, ui){
                        tagsField.addTag(ui.item.label);
                        tagsField.removeTag(ui.item.value);
                    }},
                    'height':'100px',
                    'width':'300px',
                    'interactive':true,
                    'defaultText':'add some tags',
                    'removeWithBackspace' : true,
                    'minChars' : 0,
                    'maxChars' : 0,
                    'placeholderColor' : '#666666'
                });
                
                this.$el.find('.tagsinput').hide();
                
                var component = this;
                this.$el.find('#newEntityField').keyup(function(e) {
		if(trim($(this).val()) !== "") {
			component.$el.find('.tagsinput').slideDown();
			component.$el.find('#createTopic').removeAttr("disabled");
		} else {
			component.$el.find('.tagsinput').slideUp();
			component.$el.find('#createTopic').attr("disabled", "disabled");
		}
                });
            },
            actions: {
                createtopic: function() {
                    var component = this;
                    var newConversationName = this.$el.find('#newEntityField').val();
                    if(newConversationName) {
                        var tagsText = this.$el.find('#tagsField').val();
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
                                var tagsPromise = processTags(tagsText);
                                tagsPromise.done(function(result){
                                    //create the new conversation
                                    component.api('/52e138eaf0f1b0ac30000bad/conversations', 'post',{
                                        "public": "true",
                                        "name": newConversationName,
                                        "tags": result
                                    }).then(function(response) {
                                        console.log(response);
                                        window.location.href = '#/createtopic/' + response.id;
                                    });
                                });
                            } else {
                                alert("A topic with the same name already exsits!");        
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
                }, 200);
        
            },  
            beforeRender: function(data) {
                data.currentView = this.currentView;
                return data;
            },
            afterRender: function() {
                var tab = this.$el.parent().find('.loading:first');
                tab.slideUp();
               
            }               
        });
