//Vars
var recSEmail = document.getElementById("recSEmail");
var btRec = document.getElementById("btRecS");
var back = document.getElementById("back");

//Configurações do Firebase
var firebaseConfig = {
    apiKey: "api-key",
    authDomain: "project-id.firebaseapp.com",
    databaseURL: "https://project-id.firebaseio.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "sender-id",
    appID: "app-id",
};
firebase.initializeApp(firebaseConfig);

//Cliques
back.onclick = function () {window.location.href = "index.html";}
btRec.onclick = function () {
    var auth = firebase.auth();
    auth.sendPasswordResetEmail(recSEmail.value).then(function () {
        alert("Um e-mail para a redefinição de senha foi enviado para: " + recSEmail.value)
    }).catch(function (error) {
        console.log(error.code)
        if (error.code == "auth/invalid-email") {
            alert("Email Inválido")
        }
        if (error.code == "auth/user-not-found") {
            alert("Usuário Não Cadastrado")
        }
    });
}