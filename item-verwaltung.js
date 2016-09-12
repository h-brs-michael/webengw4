ccm.component( {

  name: 'item-verwaltung',
  config: {
    html:  [ ccm.store,  'http://www2.inf.fh-bonn-rhein-sieg.de/~mwelsc2s/w4/templates.json'  ],
    key:  'item-verwaltung-key',
    style: [ ccm.load, 'http://www2.inf.fh-bonn-rhein-sieg.de/~mwelsc2s/w4/item-verwaltung.css' ],
    user:  [ ccm.instance, 'http://kaul.inf.h-brs.de/ccm/components/user2.js' ],
    store: [ ccm.store , { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'item-verwaltung'} ],
  },

  Instance: function () {

    const ITEMS = 0;
    const ITEMS_DONE = 1;

    var self = this;
    var login = null;
    var date = null;

    var show = null;

    //init:
    self.init = function ( callback ) {
      self.store.onChange = function () {
        self.render();
      };

      callback();
    }

    //render:
    self.render = function ( callback ) {

      var element = ccm.helper.element( self );
      element.html("<h2>Login Required</h2>");

      //Login:
      self.user.login( function () {  //Nutzung der user-Instanz für Authentifizierung

        var login = self.user.data().key;

        self.store.get( self.key+login, function ( dataset ) {
          if (dataset === null) {
            self.store.set({
              key: self.key+login,
              items: [],
              items_done: []
            }, proceed);
          } else {
            proceed(dataset);
          }
          function proceed(dataset) {

            if (date === null) {
              date = self.getCurrentDate();
            }

            element.html(ccm.helper.html( self.html.get('main') ));

            var header_div = ccm.helper.find( self, '.header' );

            header_div.append(ccm.helper.html( self.html.get( 'header' ), {

              text: "Items von "+login,

              onclickItems: function() {
                self.renderItems(dataset);
              } ,

              onclickDone: function() {
                self.renderItemsDone(dataset);
              }
            }) );

            if(self.show == ITEMS_DONE) {
              self.renderItemsDone(dataset);
            } else {
              self.renderItems(dataset);
            }

            if ( callback ) callback();
          }
        })

      } );
    }

    self.clearItemsDone = function(dataset) {

      if (dataset != null) {
        dataset.items_done = [];
        self.store.set( dataset, function () { self.render(); } );
      }
    }

    self.renderItems = function (dataset) {

      self.show = ITEMS;

      var items_div = ccm.helper.find( self, '.items' );

      items_div.html("");

      for ( var i = 0; i < dataset.items.length; i++ ) {

        //sort values
        dataset.items.sort(function(a,b){return a.date>b.date });

        var item = dataset.items[ i ];

        items_div.append( ccm.helper.html( self.html.get( 'item' ), {

          id: i,

          itemid: i,

          text: ccm.helper.val( item.text ),

          date: ccm.helper.val( item.date ),

          onclick: function () {

            if(this.id != -1) {
              var done = dataset.items.splice(this.id,1);

              if(dataset.items_done === null || dataset.items_done === undefined) {
                dataset.items_done = [];
              }

              dataset.items_done.push( { text: done[0].text, date: done[0].date } )
            }

            self.store.set( dataset, function () { self.render(); } );
          }
        } ) );

        //color old dates
        if(date !== null) {
          if (item.date < date) {
            $(".ccm-item-verwaltung > #main > .items > #"+i+">.date ").css('color', 'red');
          }
        }
      }

      //item-submit
      var items_div = ccm.helper.find( self, '.items-input' );

      items_div.html("");

      items_div.append ( ccm.helper.html( self.html.get( 'input' ), {
        //test if submit is filled
        onsubmit: function () {
          var value = ccm.helper.val( ccm.helper.find( self, '#input-text' ).val().trim() );
          var date = ccm.helper.val( ccm.helper.find( self, '#input-date' ).val().trim() );
          if ( value === '' || date ==='') {
            alert("Geben Sie eine Item-Beschreibung sowie ein Datum ein.")
            return false;
          }

          dataset.items.push( { text: value, date: date } );

          self.store.set( dataset, function () { self.render(); } );
          return false;
        }

      } ) );

    }

    self.renderItemsDone = function (dataset) {

      self.show = ITEMS_DONE;

      var items_div = ccm.helper.find( self, '.items' );
      items_div.html("");

      if(dataset.items_done === null || dataset.items_done === undefined) {
        dataset.items_done = [];
      }

      for ( var i = 0; i < dataset.items_done.length; i++ ) {

        dataset.items_done.sort(function(a,b){return a.date>b.date });

        var item = dataset.items_done[ i ];
        items_div.append( ccm.helper.html( self.html.get( 'item' ), {

          id: i,

          text: ccm.helper.val( "<strike>"+item.text+"</strike>" ),

          date: ccm.helper.val( "<strike>"+item.date+"</strike>" ),

          onclick: function () {

            if(this.id != -1) {
              var done = dataset.items_done.splice(this.id,1);
              dataset.items.push( { text: done[0].text, date: done[0].date } );
            }

            self.store.set( dataset, function () { self.render(); } );


          }
        } ) );
      }

      //item-submit
      var items_div = ccm.helper.find( self, '.items-input' );

      items_div.html("");

      items_div.append ( ccm.helper.html( self.html.get( 'clear' ), {

        onclickclear: function () {

          self.clearItemsDone(dataset);

          return false;

        }

      } ) );

    }

    self.getCurrentDate = function() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
        dd='0'+dd
      }
      if(mm<10) {
        mm='0'+mm
      }
      today = yyyy+'-'+mm+'-'+dd;

      return today;
    }

  },


} );
