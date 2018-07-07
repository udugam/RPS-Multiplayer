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
    $('#player1').html("<input>");
    $('#player2').html("<input>");
}

function playerWaiting(player, data) {
    $('#announcement-topic').text("Oponent Ready");
    $('#announcement').text("Enter your name to start playing");
    $('#'+player).text(data.name+" is ready to play");
}

function playerMissing(player) {
    $('#announcement-topic').text("Oponent Ready");
    $('#announcement').text("Enter your name to start playing");
    $('#'+player).html("<input>");
}

function populatePlayerData(player, data) {
    $('#'+player).text(data.name);
}

function startGame() {
    $('#announcement-topic').text("Choose Rock, Paper, or Scissors");
    $('#announcement').text("Use the left and right arrows to make you selection, then press Submit");
}



