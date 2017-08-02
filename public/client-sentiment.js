$(function() {
  var socket = io();
  
  socket.on('sentiment', function(data) {
    console.log('NEW SENTIMENT!');

    if ($('.waiting').length > 0) {
      // remove the initial waiting widget
      $('.waiting').animate({
        width: "0%",
        height: "0%",
        marginBottom: "0em"
      }, 
      {
        duration: 2200,
        complete: function() {
          $(this).remove();
        }
      });
      
    }
    
    $('.content').append(tmpl(data));
  })
  
});

var tmpl = Handlebars.compile('<div class="chunk {{valence}}" data-polarity="{{polarity}}">{{chunk}}</div>');