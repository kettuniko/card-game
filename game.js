var exampleSocket = new WebSocket("ws://localhost:8081")
exampleSocket.onopen = function (event) {
//		  exampleSocket.send("Here's some text that the server is urgently awaiting!");
};
exampleSocket.onerror = function (event) {
  alert("web soket pls " + event)
  console.log(event)
}
exampleSocket.onmessage = function (event) {
  var message = JSON.parse(event.data)

  if (message.type === 'gameStart') {
    var cards = JSON.parse(event.data).cards

    var images = cards.map(card => {
      var img = new Image()
      img.src = "cards/" + card.name + '.png'
      img.onclick = playCard(card)
      return img
    })

    var myCards = document.getElementById('my-cards');
    images.forEach(image => myCards.appendChild(image))
    document.getElementById('message').innerHTML = 'game started'
  } else if (message.type === 'yourTurn') {
    document.getElementById('message').innerHTML = 'YOUR TURN!'
  }
}

function playCard(card) {
  return function() {
    console.log("playing card " + card)
    exampleSocket.send(JSON.stringify({type: "playCard", card: card}))
  }
}