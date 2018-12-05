var splash = (function(){

  var text_cloud;
  var web_socket;

  window.addEventListener("DOMContentLoaded", init);

  function init() {
    text_cloud = document.getElementById("text-cloud");
    web_socket = new WebSocket("ws://localhost:8080");

    web_socket.onmessage = process_incoming;
  }

  function process_incoming(data){
    // Try to parse received data as JSON
    try{
      var data = JSON.parse(data.data);
    }catch(e){
      console.log("Couldn't parse json");
      return;
    }

    switch(data.action){
      case "playerWaitingChange":
        if(data.props.playerIsWaiting){
          text_cloud.classList.remove("text-cloud-hidden");
          text_cloud.classList.add("text-cloud-visible");
        }else{
          text_cloud.classList.remove("text-cloud-visible");
          text_cloud.classList.add("text-cloud-hidden");
        }
      break;
    }
  }

})();
