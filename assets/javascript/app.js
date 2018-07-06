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

function initDatabase(databaseRef) {
    database
        .ref()
        .once('value')
        .then(function(snapshot) {
            if (!snapshot.child('players').exists()) {
                database.ref().set({
                    numPlayers: 0
                })
            }
        })
}

//Declares a listener for the change of values in the players path of the database
database.ref().on("value", function(snapshot) {
    playerCount = snapshot.val().numPlayers;
})

//Declares a click listener for when the player name is submitted
$('#submitName').on('click', function() {
    var name = $('#playerName').val().trim();
    var count = playerCount;

    if (count < 2) {
        count++;
        database.ref('players').push({
            playerName: name,
            wins: 0,
            losses: 0,
            ties: 0,
            selection: ""
        })
        database.ref().update({
            numPlayers: count
        })
    }
})

initDatabase(database);