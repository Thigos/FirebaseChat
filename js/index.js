//vars
var body = document.getElementById('body');
var emailLG = document.getElementById('lgEmail');
var senhaLG = document.getElementById('lgSenha');
var nomeRG = document.getElementById('rgNome');
var emailRG = document.getElementById('rgEmail');
var senhaRG = document.getElementById('rgSenha');
var btLG = document.getElementById('btLG');
var btRG = document.getElementById('btRG');
var btRecSenha = document.getElementById('btRecSenha'); 

//CONFIGURAÇÕES DO FIREBASE
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

if(localStorage.getItem("uidUser") != null){
    window.location.href = "principal.html";
}

//Cliques
btRG.onclick = function () {registro()};
btRecSenha.onclick = function () {window.location.href = "recSenha.html";};
btLG.onclick = function () {login()};

//Firebase
function registro() {
    if (senhaRG.value != "" && emailRG.value != "" && nomeRG.value != "") {
        firebase.auth().createUserWithEmailAndPassword(emailRG.value, senhaRG.value)
            .then(function (response) {
                var user = firebase.auth().currentUser;
                if (user) {
                    escreverDATA(user.uid, nomeRG.value, emailRG.value, senhaRG.value);
                } else {
                    alert("Algo de errado não está certo\n:(")
                }
            }).catch(error => {
                const errorCode = error.code;
                if (errorCode.valueOf() == "auth/email-already-in-use") {
                    alert("Usuário Já Cadastrado!")
                    emailRG.value = "";
                    senhaRG.value = "";
                }
                if (errorCode.valueOf() == "auth/weak-password") {
                    alert("Tente Uma Senha Mais Forte!")
                    emailRG.value = "";
                    senhaRG.value = "";
                }
                if (errorCode.valueOf() == "auth/invalid-email") {
                    alert("Email Invalido!")
                    emailRG.value = "";
                    senhaRG.value = "";
                }
                const errorMessage = error.message;
            });
    }
}

function escreverDATA(userId, name, email, password) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        password: password,
        profile_picture: ""
    }).then(function (response) {
        firebase.database().ref('users/' + userId + "/msgs/").set({
            size: 0
        }).then(function (response) {
            nomeRG.value = "";
            emailRG.value = "";
            senhaRG.value = "";
            alert("Usuário Cadastrado!\nPor favor faça login!")
        });
    });

}

function login() {
    if (emailLG != "" && senhaLG != "") {
        firebase.auth().signInWithEmailAndPassword(emailLG.value, senhaLG.value)
            .then(function (response) {
                //TELA PRINCIPAL
                console.log("TELA PRINCIPAL")
                localStorage.setItem("emailUser", emailLG.value);
                localStorage.setItem("senhaUser", senhaLG.value);
                localStorage.setItem("uidUser", firebase.auth().currentUser.uid)
                //OBS.: TROCAR KEY DO setItem POR UMA MAIS FORTE ;)
        
                window.location.href = "principal.html";
            
                
            })
            .catch(function (error) {
                if (error.code == "auth/invalid-email") {
                    alert("Email Inválido");
                }
                if (error.code == "auth/user-disabled") {
                    alert("Usuário Desabilitado");
                };
                if (error.code == "auth/user-not-found") {
                    alert("Usuário Não Cadastrado");
                };
                if (error.code == "auth/wrong-password") {
                    alert("Senha Inválida");
                };
            });
    }
}
