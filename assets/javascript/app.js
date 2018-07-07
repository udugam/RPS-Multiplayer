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
            }

            //Else if player1 is missing, call missingPlayer(playerNum) function 

        })
}

function emptyGame() {
    $('#announcement-topic').text("Game Empty");
    $('#announcement').text("No one is here to play. Enter your name on either side and wait for another player.")
}

