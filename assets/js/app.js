proxy = 'https://cors-anywhere.herokuapp.com/';

function createDb() {
    var db_name = 'allWords';
    var db_version = '1.0';
    var db_describe = 'Jobs AllWorks';
    var db_size = 2048;
    var db = openDatabase(db_name, db_version, db_describe, db_size, function(db) {
        console.log(db);
        console.log("Banco de dados aberto com sucesso! Ou criado pela primeira vez!");
        createTable(db);
    });

    return db;
}

function createTable(db) {
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_resultados (id unique, json_data)', [], function(transaction, result) {
            console.log(result);
            console.log('Tabela criada com sucesso!');
        }, function(transaction, error) {
            console.log(error);
        });
    }, transError, transSuccess);
}

function transError(t, e) {
    console.log(t);
    console.log(e);
    console.error("Error occured ! Code:" + e.code + " Message : " + e.message);
}

function transSuccess(t, r) {
    console.info("Transaction completed Successfully!");
    console.log(t);
    console.log(r);
}

function insertRecords(id, json_data) {
    var db = createDb();

    if (db) {
        db.transaction(function (tx) { 
            tx.executeSql('INSERT INTO tbl_resultados (id, json_data) VALUES ('+id+', "'+json_data+'")'); 
            console.log('Dados inserido');
         }); 
    } else {
        console.log('No Database man! wait creating it for you!');
        createDb();
    }
}

function selectRecords(){
    var db = createDb();

    db.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM tbl_resultados', [], function (tx, results) { 
           var len = results.rows.length, i; 
           for (i = 0; i < len; i++) { 
              console.log(results.rows.item(i) ); 
           } 
       
        }, null); 
     });

}

function get_token(){
    $('#result').empty().html('AUTENTICANDO...');
	
	var url = "http://api.cup2022.ir/api/v1/user/login"
	payload = JSON.stringify( { "email": "rpassosfranco@gmail.com", "password": "CUP475816"} )
		
	var finalURL = proxy + url;
	console.log(finalURL);
	
	$.ajax({
		url:  finalURL	,
		type: "POST",
		dataType: "json",
		data: payload,
		contentType: "application/json",
		crossDomain: true,
		async: true,
		headers: { 
		  'Access-Control-Allow-Origin': '*',
		  'Content-Type': 'application/json',
		  'Accept': 'application/json'
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Access-Control-Allow-Origin","*")
			xhr.setRequestHeader("X-Permitted-Cross-Domain-Policies","none")
		},
		success: function(result) {
			 token =  result.data.token;
			 //BUSCA DADOS
			 busca_dados(token);
		},
		error: function (xhr) {
			console.log(xhr);
		}
   });
   
}

function busca_dados(token){
    $('#result').empty().html('BUSCANDO DADOS...');
    //var url = 'http://api.cup2022.ir/api/v1/team'
    var url_equipe = 'http://api.cup2022.ir/api/v1/match/'
    
    var finalURL = proxy + url_equipe;
    console.log(finalURL);
          
    $.ajax({
          url:  finalURL,
          type: "GET",
          dataType: "json",
          contentType: "application/json",
          crossDomain: true,
          headers: { 
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+token
          },
          beforeSend: function(xhr) {
              xhr.setRequestHeader("Access-Control-Allow-Origin","*")
              xhr.setRequestHeader("X-Permitted-Cross-Domain-Policies","none")
          },
          success: function(result) {
               dados =  result.data;
               $('#result').empty().html('MONTANDO GRADE...');
               var id_generico = Math.floor(Math.random() * (1 - 100 + 1) ) + 1;
               insertRecords(id_generico,dados);
               monta_resultado(dados);
          },
          error: function (xhr) {
              console.log(xhr);
          }
     });
  }

  function monta_times(data){
    console.log(data);
	
	for (var i = 0; i < data.length; i++) {
		var object = data[i];
		var gp_time = '#grupo'+object["groups"];
		var nome_time = object["name_en"];
		var flag_time = object["flag"];
		console.log(gp_time)
		linha = '<img src="'+flag_time+'" width="70px">'
		$(gp_time).append('<li class="list-group-item">'+linha+' '+nome_time+'</li>');
	}

}

function monta_resultado(data){
    
	for (var i = 0; i < data.length; i++) {
		var object = data[i];
		var gp_time = '#grupo'+object["group"];
		

		if (parseInt(object["id"]) > '16'){
            continue; 
        }


        style_css = "";
        if (object["time_elapsed"] == 'finished'){
            style_css = "background-color:#01fe4d"; 
        }
        if (object["time_elapsed"] == 'h1'){
            style_css = "background-color:#ffff00"; 
        }
        if (object["time_elapsed"] == 'hf'){
            style_css = "background-color:#ffff00"; 
        }
        if (object["time_elapsed"] == 'h2 '){
            style_css = "background-color:#ffff00"; 
        }


		var data_jogo  = object["local_date"];
        data_jogo = new Date(data_jogo+' GMT+03').toLocaleString('pt-BR')

		var home_name  = object["home_team_en"];
		var home_flag  = object["home_flag"];
		var home_score = object["home_score"];
		
		var away_name  = object["away_team_en"];
		var away_flag  = object["away_flag"];
		var away_score = object["away_score"];
		
		var card_template = '<li class="list-group-item">'+
		'<div class="row" style="'+style_css+'">'+
			'<div class="col-sm-6">'+
				'<b>'+data_jogo+'</b>'+
			'</div>'+	
		'</div>'+
		 '<div class="row">'+
		     '<div class="col-sm-6">'+
			  '<img src="'+home_flag+'" width="70px" height="46px">&nbsp;&nbsp;'+home_name+'&nbsp;&nbsp; : '+
			  '<b>'+home_score+'</b>'+
			 '</div>'+
			 '<div class="col-sm-6">'+
			  '<img src="'+away_flag+'" width="70px">&nbsp;&nbsp;'+away_name+'&nbsp;&nbsp; : '+
			  '<b>'+away_score+'</b>'+
			 '</div>'+
		   '</div>'+
		'</li>';
		
		$(gp_time).append(card_template)
	}
	$('#result').empty();
}


(function(exports) {
    "use strict";

   /**
    * The 'pause' event is fired when the app is sent to the background (app completely hidden) or when its partially obscured 
    */
    function onPause() {
        if (app.playerView) {
            app.playerView.pauseVideo();
        }
    }

   /**
    * The 'resume' event is fired when the app is brought to the foreground (app completely visible) including when the Voice Search Dialog is dismissed
    */
    function onResume() {
         if (app.playerView) {
             app.playerView.resumeVideo();
         }
    }

   /**
    * Add listeners for pause and resume when the platform is ready
    */
    function onAmazonPlatformReady() {
        document.addEventListener("pause" , onPause, false);
        document.addEventListener("resume" , onResume, false);
    }

   /**
    * Handle device rotation event
    * When in portrait mode put up the app overlay div and notify the user
    * to change back to landscape
    */
    function handleDeviceOrientation() {
        //disregard on FireTV
        if(navigator.userAgent.match(/AFT/i)) {return;}

        //wrap in a timer to make sure the height and width are updated
        setTimeout(function() {
            if(window.innerWidth < window.innerHeight) {
                $('#overlay-message').html('please rotate your device back to landscpe');
                $('#app-overlay').css('display', 'block'); 
            } 
            else {
                $('#overlay-message').html('');
                $('#app-overlay').css('display', 'none'); 
            }
        }, 500);
    }

    document.addEventListener("amazonPlatformReady" , onAmazonPlatformReady, false);  
    window.addEventListener('orientationchange', handleDeviceOrientation, false); 

   /**
    * The app object : the controller for the app, it creates views, manages navigation between views
    *                  routes input to the currently focused view, giving data to the views, and otherwise stitching things together
    * @param {Object} settingsParams settings for the application
    *                 settingsParams.dataURL {String} url of the initial data request 
    *                 settingsParams.displayButtons {Boolean} flag that tells the app to display the buttons or not
    */
    function App(settingsParams) {

        //hold onto the app settings
        this.settingsParams = settingsParams;
        this.showSearch = settingsParams.showSearch;

        //main application container div
        this.$appContainer = $("#app-container");

         /**
        * Handle the call to the model to get our data 
        */
          this.makeInitialDataCall = function () {
            this.data.loadInitialData(this.dataLoaded);
        };

        /**
        * Callback from XHR to load the data model, this really starts the app UX
        */
         this.dataLoaded = function() {
            var logo;
            this.$appContainer.empty();

            //check for entitlement services
            if(settingsParams.entitlement) {
                this.initializeEntitlementView();
            }

            // quick template render to add the logo to the app, probably doesnt need an entire view since its one line
            if (app.data.appLogo) {
                logo = app.data.appLogo;
            } 
            else {
                logo = "assets/img_logo.png";
            }
            
            var html = utils.buildTemplate($("#app-header-template"), {
                img_logo:logo
            });
            this.$appContainer.append(html);
            
            this.initializeLeftNavView();

            this.initializeOneDView();

            this.selectView(this.oneDView);

        }.bind(this);

         /** 
        * Set the application's current view
        * @param {Object} view the current view
        */
          this.selectView = function (view) {
            this.currentView = view;
        };

        /**
        * User has pressed the back button
        */
         this.exitApp = function () {
            if (confirm("Você tem certeza que quer sair?")) {
                window.open('', '_self').close();
            }
            buttons.resync();
        };

        this.exitPlayerView = function () {
            this.loadingSpinner.hide.all();

            // incase this was a livestream we need to clear the livestream updater
            clearTimeout(this.liveUpdater);
            if (this.subCategoryView) {
                this.transitionFromPlayerToSubCategory();
            }
            else {
                this.transitionFromPlayerToOneD();
            }
        };

         /**
        * All button events route through here, send them to current view
        * Views are switched based on the type of key press - up and down
        * key events will make the left-nav menu the focus while left and 
        * right control the oneDView. When the video player has focus it
        * will handle all key events
        * @param {Event} e
        */
          this.handleButton = function(e) {
            //TODO: hijack button events when error dialog is active. We may not need special logic if we set dialog view to currentView.
            //Pending implementation detail.
            if (this.currentView) {
                this.currentView.handleControls(e);
            } 
            else if (e.type === 'buttonpress' && e.keyCode === buttons.BACK) {
                this.exitApp();
            }
        };

       /**
        * Handle touch events
        */
        this.handleTouch = function(e) {
            if(e.type === 'swipe') {
                if($("#left-nav-list-container").hasClass('leftnav-menulist-collapsed')) {
                    this.currentView = this.oneDView;
                } 
                else {
                    this.currentView = this.leftNavView;
                }
            }
            this.currentView.handleControls(e);
        };

       /***************************
        *
        * IAP Purchase Flow 
        *
        **************************/
        this.initializeEntitlementView = function() {
            var entitlementView = this.entitlementView = new EntitlementView();

           /**
            * Event Handler - Handle leaving the entitlement view
            */
            entitlementView.on('exit', function() {
                this.transitionOutOfEntitlementView();
            }, this);

            entitlementView.render(app.$appContainer);
        };

         /***************************
        *
        * Left Nav View Object
        *
        **************************/
          this.initializeLeftNavView = function() {

            var leftNavView = this.leftNavView = new LeftNavView();
            if (this.showSearch) {
                this.searchInputView = new SearchInputView();
            }

           /**
            * Event Handler - Select menu item
            * @param {Number} index the index of the selected item
            */
            leftNavView.on('select', function(index) {
                if (!this.showSearch || index !== 0) {
                    //remove the contents of the oneDView
                    this.oneDView.remove();
                    
                    //show the spinner
                    this.loadingSpinner.show.spinner();

                    //set the newly selected category index
                    if(this.showSearch) { index--;}
                    app.data.setCurrentCategory(index);

                    //update the content
                    this.oneDView.updateCategory();   
                    
                    //set the selected view
                    this.selectView(this.oneDView);
                    
                    //hide the leftNav
                    this.leftNavView.collapse();

                    if (this.showSearch) {
                        this.leftNavView.searchUpdated = false;
                        this.searchInputView.reset();
                    }
                }
                else {
                    //remove the contents of the oneDView
                    this.oneDView.remove();
                    
                    //show the spinner
                    this.loadingSpinner.show.spinner();
                    this.oneDView.updateCategoryFromSearch(this.searchInputView.currentSearchQuery);

                    //set the selected view
                    this.selectView(this.oneDView);
                    
                    //hide the leftNav
                    this.leftNavView.collapse();
                }
            }, this);

           /**
            * Event Handler - deselect leftnav view
            */
            leftNavView.on('deselect', function() {
                this.transitionFromLefNavToOneD();
                if (this.oneDView.noItems) {
                    this.exitApp();
                }
            }, this);
   
           /**
            * Event Handler - exit the left nav back to oneD
            */
            leftNavView.on('exit', function() {
                this.leftNavView.collapse();
                this.transitionToLeftNavView();
            }, this);

            if (this.showSearch) {
                this.searchInputView.on('searchQueryEntered', function() {
                    if (this.leftNavView.currSelectedIndex === 0) {
                    this.leftNavView.searchUpdated = true;
                    this.leftNavView.confirmNavSelection();
                    }   
                }, this);
            }

           /**
            * Event Handler - Make this the active view
            */
            leftNavView.on('makeActive', function() {
                this.transitionToExpandedLeftNavView();
            }, this);

           /**
            * Event Handler - Change index of currently selected menu item 
            * @param {Number} index the index of the selected item
            */
            leftNavView.on('indexChange', function(index) {
                //set the newly selected category index
                if (this.showSearch && index === 0) {
                    this.searchInputView.select();
                }
                else {
                    if (this.showSearch) {
                        app.data.setCurrentCategory(index - 1);
                    } 
                    else {
                        app.data.setCurrentCategory(index);
                    }
                    if (this.showSearch) {
                        this.searchInputView.deselect();
                    }
                }

            }, this);

           /**
            * Event Handler - When the left nav is loaded remove the 
            *                 app overlay until the content is loaded
            */
            leftNavView.on('loadComplete', function() {
                this.loadingSpinner.hide.overlay();
            }, this);

            //render the left nav right now
            var leftNavData = app.data.getCategoryItems().slice(0);
            var startIndex = 0;
            if (this.showSearch) {
                leftNavData.unshift(this.searchInputView);
                startIndex = 1;
            }

            leftNavView.render(app.$appContainer, leftNavData, startIndex);
        };



        get_token();

    }


    exports.App = App;
}(window));