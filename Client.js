//Const Variabels
const suits = ["spades", "diamonds", "clubs", "hearts"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const socket = io();

//HTML Variables
const resetBtn = document.getElementById("resetBtnID");
const hitBtn = document.getElementById("hitBtnID");
const standBtn = document.getElementById("standBtnID");
const clientScoreHView = document.querySelector(".clientScore");
const clientDeckDiv = document.querySelector(".clientDeck");
const serverDeckDiv = document.querySelector(".serverDeck");

//Variables
var deck = [];
var clientDeck = [];
var serverDeck = [];
var gameOver = false;

//Code
setupSockets();
startUpGame();

//Listeners
resetBtn.addEventListener("click", resetGame);
hitBtn.addEventListener("click", addCardToClient);
standBtn.addEventListener("click", serverMakeMove);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printWinner(winner) {
    gameOver = true;
    alert("Game Over! \n The Winner is the " + winner);
    renderCards(true);
    clientScoreHView.innerText = "Game Over! \n The Winner is the " + winner + "\n" +
                                    "Client Score: " + getClientScore() + "\n" +
                                        "Server Score: " + getServerScore();

    if(winner == "CLIENT") 
        document.body.style.backgroundColor = "green";          
    else 
        document.body.style.backgroundColor = "red";                    
}

//Function that will add a card from the random cards to the client
//Using "setTimeout" function to let the card images to load before message
function addCardToClient(event) {
    if(gameOver) return;
    clientDeck.push(deck.pop(0));
    renderCards(false);

    if(getClientScore() > 21) {
        setTimeout(printWinner("SERVER"), 1000);
    } else if(getClientScore() == 21) {
        setTimeout(printWinner("CLIENT"), 1000);
    } else {
        //Then make server to chose a card or stand
        setTimeout(serverMakeMove,3000);
    }
}

//Function that will add a card from the random cards to the server
//Simple algorithm , calculates if he should pick a card, if next will be 1-10
//Using "setTimeout" function to let the card images to load before message
function serverMakeMove(event) {
    if(gameOver) return;
    if(getServerScore() + Math.floor(Math.random() * 100) <= 21) {
        serverDeck.push(deck.pop(0));
        renderCards(false);

        if(getClientScore() > 21) {
            setTimeout(printWinner("CLIENT"), 1000);
        } else if(getClientScore() == 21) {
            setTimeout(printWinner("SERVER"), 1000);
        } else {
            setTimeout(alert("Your Turn"), 1000);
        }
        return;
    }
    //Server Stand
    setTimeout(alert("Server chose on stand!"), 1000);
}

//Welcome message to client console with sockets - Testing Sockets - NOT NEEDED.
function setupSockets() {
    console.log("Client Side - ONLINE");
    socket.on("connect", () => {``
        console.log("You have been connected to the server!");
    });
}

//Function that will return the name of the file(image) of the specific card by card value and suit
function getPathToCardImg(cardObject) {
    return cardObject.Value + "_of_" + cardObject.Suit + ".png";
}

//Function that will render the card on screen
function renderCards(flipServerCards) {
    //Reseting the html to not multiply the cards
    clientDeckDiv.innerHTML = "";
    serverDeckDiv.innerHTML = "";
    //Creating the card element, LI element (List Item) that will represent a card
    //For the client and server!
    for(var i = 0; i < clientDeck.length; i++) {
        const playerCard = document.createElement("li")
        const imageCard = document.createElement("img");
        imageCard.src = "../cardimgs/" + getPathToCardImg(clientDeck[i]);
        //playerCard.innerText = JSON.stringify(clientDeck[i]) + " - " + getPathToCardImg(clientDeck[i]);
        playerCard.classList.add("card");
        playerCard.appendChild(imageCard);
        clientDeckDiv.appendChild(playerCard);
    }

    //Rendering only 1 server card, so that the client cannot see his cards
    const serverCard = document.createElement("li");
    const imageCard = document.createElement("img");
    imageCard.src = "../cardimgs/" + getPathToCardImg(serverDeck[0]);
    //serverCard.innerText = JSON.stringify(serverDeck[0]);
    serverCard.classList.add("card");
    serverCard.appendChild(imageCard);
    serverDeckDiv.appendChild(serverCard);

    for(var i = 1; i < serverDeck.length; i++) {
        const serverCard = document.createElement("li");
        const imageCard = document.createElement("img");
        if(flipServerCards == true) 
            imageCard.src = "../cardimgs/" + getPathToCardImg(serverDeck[i]);
        else 
            imageCard.src = "../cardimgs/back.png";
        //serverCard.innerText = "FLIPPED CARD";
        serverCard.classList.add("card");
        serverCard.appendChild(imageCard);
        serverDeckDiv.appendChild(serverCard);
    }


    clientScoreHView.innerText = "Client Score: " + getClientScore();
}

//Function that will return the score of the client (Score = Value of all his cards)
function getClientScore() {
    var sum = 0 ;
    for(var i = 0; i < clientDeck.length; i++) {
        let card = clientDeck[i];
        console.log(card);
        
        if(card.Value == "J" || card.Value == "Q" || card.Value == "K") 
            sum += 10;
        else if(card.Value == "A")
            sum += 1;
        else 
            sum += parseInt(clientDeck[i].Value, 10);
        
    }
    return sum;
}

//Function that will return the score of the client (Score = Value of all his cards)
function getServerScore() {
    var sum = 0 ;
    for(var i = 0; i < serverDeck.length; i++) {
        let card = serverDeck[i];
        console.log(card);
        
        if(card.Value == "J" || card.Value == "Q" || card.Value == "K") 
            sum += 10;
        else if(card.Value == "A")
            sum += 1;
        else 
            sum += parseInt(serverDeck[i].Value, 10);
        
    }
    return sum;
}

//Function that will reset clients and servers deck, and will give them 2 random cards + render cards
function startUpGame() {
    socket.on("serverAndDeckObjects", (data) => {
        clientDeck = [];
        deck = JSON.parse(data.Deck);
        serverDeck = JSON.parse(data.serverDeck);
        gameOver = data.GameOver;

        //Adding 2 cards to client - Server has already pushed 2 random cards
        //So we don't need to push more
        clientDeck.push(deck.pop(0));
        clientDeck.push(deck.pop(0));

        //Rendering the cards on screen
        renderCards();
    });
}

function resetGame() {
    document.body.style.backgroundColor = "white";    
    socket.emit("startUpGame", true);
}