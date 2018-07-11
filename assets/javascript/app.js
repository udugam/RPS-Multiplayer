var config = {
    apiKey: "AIzaSyAZbpkdIHFWLpui315shwOre7Kkpnn_7B4",
    authDomain: "rps-multiplayer-30b7b.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-30b7b.firebaseio.com",
    projectId: "rps-multiplayer-30b7b",
    storageBucket: "",
    messagingSenderId: "496452426059"
};
firebase.initializeApp(config);

//Declare global variables
var database = firebase.database();
var gameInProgress = false;
var players; 

var TIME_TO_NEXT_ROUND = 5000;

//on page load setup database listeners
//This listener is for the players path
database
.ref('players')
.on('value', function(snapshot) {
    players = snapshot.val();
    //If there are no players in the database, call emptyGame function
    if(players===null) {
        emptyGame();
    } 
    //Else there are players present in the database and the page elements should be updated
    //based on the individual session storage id's of each instance of the page 
    else {
        var numPlayers = Object.keys(players).length;
        for (var key in players) {
            (sessionStorage.getItem('ID')===key) ? playerInstance(players[key],numPlayers) : observerInstance(players[key],numPlayers)
        }
        renderStats(players)            
        checkForSelections(players);
    }
})

//this listener is for the chatHistoryPath
database
.ref('chatHistory')
.on('value', function(snapshot) {
    var chatHistoryDiv = $('.chatHistory')
    chatHistoryDiv.empty()
    var chatHistoryData = snapshot.val()
    for (var key in chatHistoryData) {
        chatHistoryDiv.append("<p>"+chatHistoryData[key].name+": "+chatHistoryData[key].message+"</p>")
    }
})


//this listener is for when the page sessions ends either on close of tab or navigation to another page.
//If this happens then that means the user is leaving the game and both the session storage and databse storage 
//for that user needs to be removed
window.onbeforeunload = function() {
    playerID = sessionStorage.getItem('ID')
    sessionStorage.removeItem('ID');

    database.ref('players/'+playerID).remove();
}


//Event Declarations
//Event listener for when player's name is entered
$('body').on("keypress", "#playerName", function(event) {
    if(event.which==13) {
        var name = $(this).val()
        var id = randomID();

        //Store id in session storage to keep player unique to instance of page
        storeID(id);

        //Assign player a random ID and setup player data structure in database
        database.ref('players/'+id).set({
            id: id,
            name: name,
            selection: "",
            wins: 0,
            losses: 0,
            ties: 0
        })
    }
})

//Listener for when player types a message
$('body').on("keypress", "#playerMessage", function(event) {
    if(event.which==13) {
        var message = $(this).val()
        var playerID = sessionStorage.getItem('ID');
        
        for (var key in players) {
            if(key == playerID) {
                sendMessage(message, players[key].name);
                $(this).val('');
            }
        }
    }
})

//Listener for player's selection
$('body').on("click", "#playerSelection", function() {
    var selection = $('.carousel-item.active').attr('data-selection');
    var playerID = sessionStorage.getItem('ID');

    //write selection
    database.ref('players/'+playerID).update({
        selection: selection
    })
})


//Function Declarations
function emptyGame() {
    renderPlayerNameInput();
    $('#announcement-topic').text("Game Empty");
    $('#announcement').text("No one is here to play. Enter your name to the left and wait for another player.")
    $('#opponent').text("Waiting for opponent");
}
    
//This function renders an name input box for a player to enter their name
function renderPlayerNameInput() {
    $('#player').html("<input id='playerName'>");
}
    
//This function renders messages to the page when a player is waiting for an opponent
function renderPlayerWaiting(playerData) {
    if (sessionStorage.getItem('ID')==playerData.id) {
        $('#announcement-topic').text("Waiting For Opponent");
        $('#announcement').text("Once an opponent joins, their name will be displayed");
        $('#opponent').text("Waiting for an opponent...");
    } else {
        $('#announcement-topic').text("Oponent Ready");
        $('#announcement').text("Enter your name to start playing");
        $('#opponent').text(playerData.name+" is ready to play");
    }
}

function renderPlayerPresent(playerData) {
    $('#opponent').html("<h4>"+playerData.name+"</h4>")
}

//This function populates a player's information into the player area 
function renderPlayerData(playerData) {
    $('#player').html("<h4>"+playerData.name+"</h4>")
}


function startGame() {
    gameInProgress = true
    $('#opponentSelection').empty()
    $('#opponentStatus').empty()
    addSelectionButton();
    $('#announcement-topic').text("Choose Rock, Paper, or Scissors");
    $('#announcement').text("Use the left and right arrows to make your selection, then press Submit");
}

function randomID() {
    return Math.floor(Math.random()*1000)
}

function storeID(id) {
    sessionStorage.setItem("ID", id);
}

function addSelectionButton() {
    $('#selectionButton').html("<button type='button' id='playerSelection' class='btn btn-outline-secondary'>Select!</button>")
}

function playerInstance(playerData,numPlayers) {
    renderPlayerData(playerData);
    if (numPlayers===2) {
        gameInProgress? null: startGame();
    } else {
        renderPlayerWaiting(playerData);
    }
}

function observerInstance(playerData, numPlayers) {
    if (numPlayers==1) {
        renderPlayerWaiting(playerData);
        renderPlayerNameInput();
    } else {
        renderPlayerPresent(playerData);
    }
    //Add condition here for observers of the game
}

function checkForSelections(players) {
    var playerSelections = []
    
    for (key in players) {
        console.log(players[key])
        
        //if a player has made a selection != to "", then update the UI
        if(players[key].selection != "") {
            playerSelections.push({
                id: players[key].id,
                selection: players[key].selection
            })
            playerSelectionMade(players[key])
        }
    }

    if(playerSelections.length==2) {
        determineResult(playerSelections, players)
    }
}

function playerSelectionMade(playerData) {
    (sessionStorage.getItem('ID')==playerData.id) ? null : $('#opponentStatus').text(playerData.name+" has made a selection!")
}

function determineResult(selectionsArray, playersData) {
    selectionsArray.forEach(function(element) {
        if(sessionStorage.getItem('ID')==element.id) { //if the player instance, then render the selected option on the page
            $('.active').removeClass('active');
            $('#'+element.selection).addClass('active');
        } else { //else render the selected option to the opponents div
            $('#opponentSelection').html(
                "<img class='d-block w-100' src='./assets/images/"+element.selection+".png'>"
            )
        }
    })

    //determine result
    if (selectionsArray[0].selection==selectionsArray[1].selection) {
        renderResults('tie',playersData) //This condition is for a tie
    } else if (selectionsArray[0].selection=="rock" || selectionsArray[1].selection=="rock" 
    && 
    selectionsArray[1].selection=="scissors" || selectionsArray[0].selection=="scissors") {
        var winnerIndex; 
        selectionsArray.forEach(function(element,index) {
            (element.selection=='rock') ? winnerIndex=index : null
        })
        renderResults(selectionsArray[winnerIndex], playersData)     
    } else if (selectionsArray[0].selection=="rock" || selectionsArray[1].selection=="rock"
    &&
    selectionsArray[0].selection=="paper" || selectionsArray[1].selection=="paper") {
        var winnerIndex; 
        selectionsArray.forEach(function(element,index) {
            (element.selection=='paper') ? winnerIndex=index : null
        })
        renderResults(selectionsArray[winnerIndex], playersData)
    } else if (selectionsArray[0].selection=="paper" || selectionsArray[1].selection=="paper"
    && 
    selectionsArray[0].selection=="scissors" || selectionsArray[1].selection=="scissors") {
        var winnerIndex; 
        selectionsArray.forEach(function(element,index) {
            (element.selection=='scissors') ? winnerIndex=index : null
        })
        renderResults(selectionsArray[winnerIndex],playersData)
    }
}

function renderResults(winnerID, playersData) {
    var playerID = sessionStorage.getItem('ID');
    renderStats(playersData);
    if (winnerID=='tie') {
        for (var key in playersData) {
            if(key == playerID) {
                var ties = playersData[key].ties+1
                database.ref('players/'+playerID).update({
                    ties: ties,
                    selection: ""
                })
            }
        }
        $('#announcement-topic').text("TIE!");
        $('#announcement').text("Next Round comming up...");
        setTimeout(startGame,TIME_TO_NEXT_ROUND);
    } else if (winnerID.id == playerID) {
        incrementWins(playerID, playersData)
        $('#announcement-topic').text("You Won!");
        $('#announcement').text("Next Round comming up...");
        setTimeout(startGame,TIME_TO_NEXT_ROUND);
    } else if (winnerID.id != playerID) {
        incrementLosses(playerID, playersData)
        $('#announcement-topic').text("You Lost!");
        $('#announcement').text("Next Round comming up...");
        setTimeout(startGame,TIME_TO_NEXT_ROUND);
    }
}

function incrementWins(playerID, playersData) {
    for (var key in playersData) {
        if(key == playerID) {
            var wins = playersData[key].wins+1
            database.ref('players/'+playerID).update({
                wins: wins,
                selection: ""
            })
        }
    }
}

function incrementLosses(playerID, playersData) {
    for (var key in playersData) {
        if(key == playerID) {
            var losses = playersData[key].losses+1
            database.ref('players/'+playerID).update({
                losses: losses,
                selection: ""
            })
        }
    }
}

//This function displays the player's and opponent's stats
function renderStats(playersData) {
    var playerID = sessionStorage.getItem('ID');
    for (var key in playersData) {
        if(key == playerID) {
            var wins = playersData[key].wins
            var losses = playersData[key].losses
            var ties = playersData[key].ties
            
            $('#playerStats').html(wins+" - "+losses+" - "+ties)
        } else {
            var wins = playersData[key].wins
            var losses = playersData[key].losses
            var ties = playersData[key].ties
            
            $('#opponentStats').html(wins+" - "+losses+" - "+ties)
        }
    }
}

//This function pushed a passed message to the database
function sendMessage(message, name) {
    database.ref('chatHistory').push({
        name: name,
        message: message
    })
}


    