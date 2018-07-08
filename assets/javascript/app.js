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
var playerCount = 0; 

//On pageload, check database for players
checkDatabase(database);


//Event Declarations
$('body').on("keypress", "input", function(event) {
    if(event.which==13) {
        var name = $(this).val()
        var id = randomID();

        //Store id in session storage to keep player unique to instance of page
        storeID(id);

        //Assign player a random ID and setup player data structure in database
        database.ref($(this).attr('id')).set({
            id: id,
            name: name,
            selection: "",
            wins: 0,
            losses: 0,
            ties: 0
        })
    }
})

//Function Declarations
function checkDatabase() {
    database
        .ref()
        .on('value', function(snapshot) {
            //If there are no players in the database, call emptyGame function
            if(snapshot.val()===null) {
                emptyGame();
            } else if (snapshot.child('player1').exists() && !snapshot.child('player2').exists())  { //Else if player1 exists and player2 does not, call playerWaiting(playerNum) and missingPlayer(playerNum) functions 
                playerWaiting('player1', snapshot.val().player1)
                playerMissing('player2');
            } else if (snapshot.child('player2').exists() && !snapshot.child('player1').exists()) { //Else if player2 exists and player1 does not, call playerWaiting(playerNum) and missingPlayer(playerNum) functions 
                playerWaiting('player2', snapshot.val().player2)
                playerMissing('player1');
            } else if (snapshot.child('player1').exists() && snapshot.child('player2').exists()) { //Else if both players exist, call gameInProgress
                populatePlayerData('player1',snapshot.val().player1);
                populatePlayerData('player2',snapshot.val().player2);
                startGame();
            }
        })
}

function emptyGame() {
    $('#announcement-topic').text("Game Empty");
    $('#announcement').text("No one is here to play. Enter your name on either side and wait for another player.")
    $('#player1').html("<input id='player1'>");
    $('#player2').html("<input id='player2'>");
}

function playerWaiting(player, data) {
    if(sessionStorage.getItem("ID")) {
        $('#'+player).text(data.name);
    } else {
        $('#announcement-topic').text("Oponent Ready");
        $('#announcement').text("Enter your name to start playing");
        $('#'+player).text(data.name+" is ready to play");
        hidePlayerSelections(player);
    }
}

function playerMissing(player) {
    //If the user has entered the game, the missing player's box should be empty
    if(sessionStorage.getItem("ID")) {
        $('#announcement-topic').text("Waiting For Opponent");
        $('#announcement').text("Once an opponent joins, their name will be displayed");
        $('#'+player).html("<input id="+player+" disabled placeholder='TBD'>");
        hidePlayerSelections(player);
    } else { //Else if the user has not entered the game, both spots are available to choose
        $('#announcement-topic').text("Opponent Ready");
        $('#announcement').text("Enter your name to start playing");
        $('#'+player).html("<input id="+player+">");
    }
}

function populatePlayerData(player, data) {
    $('#'+player).text(data.name);
}

function startGame() {
    addSelectionButtons();
    $('#announcement-topic').text("Choose Rock, Paper, or Scissors");
    $('#announcement').text("Use the left and right arrows to make your selection, then press Submit");
}

function randomID() {
    return Math.floor(Math.random()*1000)
}

function storeID(id) {
    sessionStorage.setItem("ID", id);
}

function hidePlayerSelections(player) {
    $('#'+player+'Options').css('visibility', 'hidden')
}

function addSelectionButtons() {
    $('#player1Options').append("<button type='button' class='btn btn-outline-secondary'>Select!</button>")
    $('#player2Options').append("<button type='button' class='btn btn-outline-secondary'>Select!</button>")
}
