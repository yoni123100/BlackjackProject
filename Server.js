//Global Variables - Librery
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);

//Const Variables
const suits = ["spades", "diamonds", "clubs", "hearts"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

//Variables
var deck = initDeck();
var serverDeck = [];
shuffle(deck);

//Start up the server
startUpServer();

//Function that will init and reset all needed variables for the game
function initAllVariables() {
    deck = initDeck();
    gameOver = false;
    serverDeck = [];
    shuffle(deck);
    serverDeck.push(deck.pop(0));
    serverDeck.push(deck.pop(0));
}

//Function that will setup the server
function startUpServer() {
    console.log("Server Side - ONLINE");

    //css
    app.use(express.static(__dirname + "/views"));

    //accept client side js file
    app.use(express.static(__dirname));

    //Mapping
    app.get("/",function(req, res) {
        res.sendFile(__dirname + "/views/index.html"); 
    });

    server.listen(3000);

    io.on("connection", (socket) => {
        console.log("A user has been connected!");
        initAllVariables();

        socket.on("clientDeck", (clientDeck) => {
            console.log("Client Deck: " + clientDeck);
        });

        socket.on("serverDeck", (serverDeck) => {
            console.log("Server Deck: " + serverDeck);
        });

        socket.on("startUpGame", (bool) => {
            if(bool) {
                deck = initDeck();
                shuffle(deck);
                serverDeck = [];
                serverDeck.push(deck.pop(0));
                serverDeck.push(deck.pop(0));

                socket.emit("serverAndDeckObjects", {Deck: JSON.stringify(deck), serverDeck: JSON.stringify(serverDeck), GameOver: false});
            }
        });

        socket.emit("serverAndDeckObjects", {Deck: JSON.stringify(deck), serverDeck: JSON.stringify(serverDeck), GameOver: false});
    });
}

//Function that will return all cards of the deck
function initDeck() {
    var deck = [];

    for(var i = 0; i < suits.length; i++)
	{
		for(var x = 0; x < values.length; x++)
		{
			var card = {Value: values[x], Suit: suits[i]};
			deck.push(card);
		}
    }
    
    return deck;
}

//Function that will shuffle the cards
function shuffle(deck) {
    for (var i = 0; i < 1000; i++)
	{
		var firstCard = Math.floor((Math.random() * deck.length));
		var secondCard = Math.floor((Math.random() * deck.length));
		var temp = deck[firstCard];

		deck[firstCard] = deck[secondCard];
		deck[secondCard] = temp;
	}
}