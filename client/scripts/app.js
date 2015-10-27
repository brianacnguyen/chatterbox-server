var app = {

  username: window.location.search.slice(10),

  fetchServer: 'https://api.parse.com/1/classes/chatterbox',

  currentData: {},

  getRooms : function(data) {
    $('#rooms').empty();
    var rooms = {};
    for (var i = 0; i < data.results.length; i++) {
      var room = escapeHtml(data.results[i].roomname);
      rooms[room] = true;
    }
    $('#rooms').append($('<option id=mainroom>Main Room</option>'));
    for (var key in rooms) {
      $('#rooms').append($('<option id="' + key + '" value= "' + key + '">' + key + '</option>'));
    }
    $('#rooms').append($('<option id=createNewRoom>Create A New Room</option>'));
  },

  createNewRoom : function() {
    var newRoomName = escapeHtml(prompt("What do you want to name your Room? Reminder: Your room wont be added until you initiate a conversation."));
    $('#rooms').prepend($('<option id="' + newRoomName + '" value= "' + newRoomName + '">' + newRoomName + '</option>'));
  },

  updateMessagewithRoom : function() {
    $('#posts').empty();
    var room = escapeHtml($('#rooms').val());
    if (room === 'Create A New Room') {
      app.createNewRoom();
    } else if (room === "Main Room") {
      for (var i = 0; i < app.currentData.length; i++) {
        var messageObj = app.currentData[i];
        var user = escapeHtml(messageObj.username);
        var message = escapeHtml(messageObj.text);
        $('#posts').append($('<p class="users" id ="' + user + '" >' + user + '</p>'));
        $('#posts').append($('<div class="messages" id ="' + user + '">' + message + '</div>'));
      }
    } else {
      for ( var i = 0; i < app.currentData.length; i++ ){
        var messageObj = app.currentData[i];
        if (messageObj.roomname === room){
          var user = escapeHtml(messageObj.username);
          var message = escapeHtml(messageObj.text);
          $('#posts').append($('<p class="users" id ="' + user + '" >' + user + '</p>'));
          $('#posts').append($('<div class="messages" id ="' + user + '">' + message + '</div>'));
        }
      }
    }
  },

  getMessages : function() {
    $.ajax({
      url: app.fetchServer,
      type: 'GET',
      data: {order: '-createdAt'},
      contentType: 'application/json',
      success: function(data) {
        app.getRooms(data);
        app.currentData = data.results;
        app.updateMessagewithRoom();
      },
      error: function (data) {
        console.error('chatterbox: Failed to retrieve message. Error: ', data);
      }
    });
  },

  insertMessage: function(){
    var getText = function() {
      return escapeHtml($('form #newmessage').val());
    };
    var getRoom = function(){
      return escapeHtml($('#rooms').val());
    };
    var Message = function() {
      this.username = app.username;
      this.text = getText();
      this.roomname = getRoom();
    };
    var message = new Message();
    $.ajax({
      url: app.fetchServer,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('Success!');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
    setTimeout(app.getMessages, 200);
  },
};

setTimeout(app.getMessages, 500); 