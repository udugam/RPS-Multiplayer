var config = {
    apiKey: "AIzaSyAZbpkdIHFWLpui315shwOre7Kkpnn_7B4",
    authDomain: "rps-multiplayer-30b7b.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-30b7b.firebaseio.com",
    projectId: "rps-multiplayer-30b7b",
    storageBucket: "",
    messagingSenderId: "496452426059"
};
  
firebase.initializeApp(config);

var database = firebase.database();

//Declares a listener for the a change of values in the root directory of the firebase
database.ref().on("value", function(snapshot) {    

})

//Declares a click listener for when the player name is submitted
$('#submitName').on('click', function() {
    var name = $('#playerName').val().trim();

    database.ref().set({
        playerName: name
    })
})