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

    var self = this;
    var login = null;

    var show = null;
    const ITEMS = 0;
    const ITEMS_DONE = 1;

    //init:
    self.init = function ( callback ) {
      self.store.onChange = function () {
        self.render();
      };

      callback();
    }

    self.clearItemsDone = function(dataset) {

      if (dataset != null) {
        dataset.items_done = [];
        self.store.set( dataset, function () { self.render(); } );
      }
    }


    //log
    self.printStores = function (dataset) {

      if(dataset != null) {

        var i;
        console.log("items-done length: "+dataset.items_done.length);

        for(i=0;i<dataset.items_done.length;i++) {
          var item = dataset.items_done[ i ];
          console.log(item);
        }

      }

    }

    self.renderItems = function (dataset) {

      self.show = ITEMS;

      var items_div = ccm.helper.find( self, '.items' );

      items_div.html("");

      for ( var i = 0; i < dataset.items.length; i++ ) {

        var item = dataset.items[ i ];

        console.log('test text:'+item.text);
        console.log('test date:'+item.date);

        items_div.append( ccm.helper.html( self.html.get( 'item' ), {

          id: i,

          text: ccm.helper.val( item.text ),

          date: ccm.helper.val( item.date ),

          onclick: function () {

            console.log("clicked: "+this.id);

            if(this.id != -1) {
              var done = dataset.items.splice(this.id,1);
              console.log('done: '+done[0].text);
              console.log('done: '+done[0].date);

              if(dataset.items_done === null || dataset.items_done === undefined) {
                dataset.items_done = [];
              }

              dataset.items_done.push( { text: done[0].text, date: done[0].date } )
              //test:
              self.printStores(dataset);
            }

            self.store.set( dataset, function () { self.render(); } );


          }
        } ) );
      }

      //item-submit
      var items_div = ccm.helper.find( self, '.items-input' );

      items_div.html("");

      items_div.append ( ccm.helper.html( self.html.get( 'input' ), {
        onsubmit: function () {

          var value = ccm.helper.val( ccm.helper.find( self, '#input-text' ).val().trim() );
          var date = ccm.helper.val( ccm.helper.find( self, '#input-date' ).val().trim() );
          console.log(date);
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

        var item = dataset.items_done[ i ];
        console.log('test done:'+item);
        console.log('test done text:'+item.text);
        console.log('test done date:'+item.date);
        items_div.append( ccm.helper.html( self.html.get( 'item' ), {

          id: i,

          text: ccm.helper.val( "<strike>"+item.text+"</strike>" ), //<strike>text</strike>

          date: ccm.helper.val( "<strike>"+item.date+"</strike>" ),

          onclick: function () {

            console.log("clicked: "+this.id);

            if(this.id != -1) {
              var done = dataset.items_done.splice(this.id,1);
              console.log('done: '+done);
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

    //render:
    self.render = function ( callback ) {

      var element = ccm.helper.element( self );
      element.html("<h2>Login Required</h2>");

      //Login:
      self.user.login( function () {  // Nutzung der user-Instanz für Authentifizierung

        var login = self.user.data().key;

      self.store.get( self.key+login, function ( dataset ) {
        if (dataset === null) {
          console.log("store = null");
          self.store.set({
            key: self.key+login,
            items: [],
            items_done: []
          }, proceed);


        } else {

        console.log("store != null");
        proceed(dataset);
      }
        function proceed(dataset) {

          element.html(ccm.helper.html( self.html.get('main') ));

          var header_div = ccm.helper.find( self, '.header' );

          header_div.append(ccm.helper.html( self.html.get( 'header' ), {

            text: "Items von "+login,

            onclickItems: function() {
              //render items
              console.log('render items')
              self.renderItems(dataset);
            } ,

            onclickDone: function() {
              //render done items
              console.log('render items_done')
              self.renderItemsDone(dataset);
            }

          }) );

          if(self.show == ITEMS_DONE) {
            console.log("show items done");
            self.renderItemsDone(dataset);
          } else {
            console.log("show items");
            self.renderItems(dataset);
          }

          if ( callback ) callback();
        }

        //login end
      })

    } );
    }

  },


} );
