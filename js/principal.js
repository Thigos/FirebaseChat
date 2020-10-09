//Vars
var bodyMsg = document.getElementById('bodyMsg');
var divMsg = document.getElementById('divMsg');
var body = document.getElementById('body');
var nmUser = document.getElementById('nmUser');
var inputMsg = document.getElementById('inputMsg');
var emailUser = localStorage.getItem("emailUser");
var senhaUser = localStorage.getItem("senhaUser");
var sair = document.getElementById('sair');
var msgCX = document.getElementById("msgCX");
var enviarFt = document.getElementById('enviarFt');
var dialogFileUp = document.getElementById('dialogFileUp');
var trocarPerfil = document.getElementById('trocarPerfil');
var dialogFtPerfil = document.getElementById("dialogFtPerfil");
var inputFileUp = document.getElementById('inputFileUp');
var btFileUpload = document.getElementById('btFileUpload');
var backFileUp = document.getElementById('backFileUp');
var textFileUp = document.getElementById("textFileUp");
var cxProgressBar = document.getElementById('cxProgressBar');
var progressBar = document.getElementById('progressBar');
var uidUser = localStorage.getItem("uidUser");
var sizeCarregar = 1;

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
var database = firebase.database();

database.ref('users/' + uidUser + '/username/').once('value', function (snapshot) {
    nomeUser = snapshot.val();
    nmUser.innerHTML = '<img src="img/person.png" id="ftPerfil" width="48px" height="48px" class="logo d-inline-block align-top rounded-circle"alt="" style="margin-right:10px;">' + nomeUser;
    var ftPerfil = document.getElementById("ftPerfil");
    baixarImg(uidUser, ftPerfil);
});



//Cliques
btEnviar.onclick = function () { eviarMsg(inputMsg.value); }
btEnviar.keypress = function (e) {
    if (e.which == 13) {
        enviarMsg(inputMsg.value);
    }
}
trocarPerfil.onclick = function () {
    dialogFtPerfil.showModal();
}
back.onclick = function () {
    dialogFtPerfil.close();
}
btFileUpload.onclick = function () {
    dialogFileUp.showModal();
    cxProgressBar.style.visibility = "hidden";
}
backFileUp.onclick = function () {
    dialogFileUp.close();
}
sair.onclick = function () {
    localStorage.removeItem('emailUser');
    localStorage.removeItem('senhaUser');
    localStorage.removeItem('uidUser');
    localStorage.removeItem('ftPerfil');
    window.location.href = "index.html";
}


enviarFt.onchange = function () {
    enviarFtPerfil();
}
inputFileUp.onchange = function () {
    enviarArquivo();
}

carregar1();

setInterval(function () {
    carregar2();
}, 2000)


function baixarImg(uid, img) {
    var storage = firebase.storage().ref(uid + '/fotoPerfil.jpg');
    storage.getDownloadURL().then(function (url) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function (event) {
            var blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();

        console.log(url)
        img.src = url;
    }).catch(function (error) {


        switch (error.code) {
            case 'storage/object-not-found':
                img.src = "img/person.png";
                break;
        }
    });
}

function enviarFtPerfil() {
    const file = enviarFt.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = function () {
        ftDialog.setAttribute('src', fileReader.result);
        localStorage.setItem("ftPerfil", fileReader.result)
        ftPerfil.setAttribute('src', fileReader.result);
        var storage = firebase.storage().ref(uidUser + '/fotoPerfil.jpg');
        storage.put(file).then(function (snapshot) {
            storage.getDownloadURL().then(function (url) {
                firebase.database().ref('users/' + uidUser + '/profile_picture').set({
                    url
                }).then(function (response) {

                }).catch(error => {
                    console.log(error.code);
                });
            })
        });
    }
    fileReader.readAsDataURL(file);
}


function enviarArquivo() {
    cxProgressBar.style.visibility = "";
    progressBar.style.width = "0%";
    progressBar.innerHTML = ' 0%';
    backFileUp.style.cursor = "progress";
    textFileUp.innerText = "Carregando...";
    backFileUp.onclick = function () { };
    backFileUp.id = "j";
    const file = inputFileUp.files[0];
    var name = file.name;
    var dNow = new Date();
    var localdate = "File: " + dNow.getDate() + ':' + (dNow.getMonth() + 1) + ':' + dNow.getFullYear() + '-' +
        dNow.getHours() + ':' + dNow.getMinutes() + ":" + dNow.getSeconds() + ":" + dNow.getMilliseconds();
    console.log(uidUser + "/" + localdate + "." + name.split('.').pop())
    var storage = firebase.storage().ref(uidUser + "/" + localdate + "." + name.split('.').pop());
    var uploadTask = storage.put(file);
    uploadTask.on('state_changed', function (snapshot) {
        
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = progress + "%";
        progressBar.innerHTML = Math.trunc(progress) + '%';
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: 
                break;
            case firebase.storage.TaskState.RUNNING: 
                break;
        }
    }, function (error) {

    }, function () {

        uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
            var size = 0;
            database.ref('chat/size/size').once('value', function (snapshot) {
                size = snapshot.val();
                console.log('size: ' + size)


                size++;
                console.log("size++" + size)
                var dNow = new Date();
                var localdate = dNow.getDate() + '/' + (dNow.getMonth() + 1) + '/' + dNow.getFullYear() + '-' + dNow.getHours() + ':' + dNow.getMinutes();
                var valor = "§dt" + localdate + "§dt" + "§tpfile§tp" + "§nf" + name + "§nf" + '§ms' + url + '§ms' + '§nm' + nomeUser + '§nm' + '§id' + uidUser + "§id";
                database.ref('chat/msg' + size).set({
                    valor
                }).then(function (response) {
                    database.ref('chat/size/').set({
                        size
                    });
                    if (name.split(".").pop() == "jpeg" || name.split(".").pop() == "jpg" || name.split(".").pop() == "png") {
                        carregarFoto(name, 'balaoUser', nomeUser, localdate, url);
                    } else {
                        carregarTelaArquivoUser(url);
                    }
                });
            });
        });
    });

}
function carregar1() {
    database.ref('chat/size/size').once('value', function (snapshot) {

        for (var i = sizeCarregar; i <= snapshot.val(); i++) {
            console.log("i" + i)
            database.ref('chat/msg' + i + "/valor").once('value', function (snapshot) {
                var mensagem = snapshot.val();
                sizeCarregar = i;
                var dtAmigo = mensagem.substring(mensagem.indexOf("§dt") + 3, mensagem.lastIndexOf("§dt"));
                var mensagemRefinada = mensagem.substring(mensagem.indexOf("§ms") + 3, mensagem.lastIndexOf("§ms"));
                var nomeAmigo = mensagem.substring(mensagem.indexOf("§nm") + 3, mensagem.lastIndexOf("§nm"));
                var uidAmigo = mensagem.substring(mensagem.indexOf("§id") + 3, mensagem.lastIndexOf("§id"));
                var type = mensagem.substring(mensagem.indexOf("§tp") + 3, mensagem.lastIndexOf("§tp"));

                if (uidAmigo != uidUser) { //MENSAGENS DO AMIGO
                    if (type == "file") {
                        var name = mensagem.substring(mensagem.indexOf("§nf") + 3, mensagem.lastIndexOf("§nf"));
                        if (name.split(".").pop() == "jpeg" || name.split(".").pop() == "jpg" || name.split(".").pop() == "png") {
                            carregarFoto(name, 'balaoAmigo', nomeAmigo, dtAmigo, mensagemRefinada);
                        } else {
                            //ARQUIVOS SEM SER IMGS
                            loadMSG("balaoAmigo", nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, "arq")
                        }
                    } else {
                        //MENSAGENS COMUNS
                        loadMSG("balaoAmigo", nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, "comum")
                    }
                } else { //MENSAGENS DO PRÓPRIO USER
                    if (type == "file") {
                        var name = mensagem.substring(mensagem.indexOf("§nf") + 3, mensagem.lastIndexOf("§nf"));
                        if (name.split(".").pop() == "jpeg" || name.split(".").pop() == "jpg" || name.split(".").pop() == "png") {
                            carregarFoto(name, 'balaoUser', nomeAmigo, dtAmigo, mensagemRefinada);
                        } else {
                            //ARQUIVOS SEM SER IMGS
                            loadMSG("balaoUser", nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, "arq")
                        }
                    } else {
                        //MSG SIMPLES
                        loadMSG("balaoUser", nomeAmigo, dtAmigo, mensagemRefinada, uidAmigo, "simples")
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                }
            });
        }
    });

}



function carregar2() {
    database.ref('chat/size/size').once('value', function (snapshot) {

        for (var i = sizeCarregar; i <= snapshot.val(); i++) {
            console.log("i" + i)
            database.ref('chat/msg' + i + "/valor").once('value', function (snapshot) {
                var mensagem = snapshot.val();
                sizeCarregar = i;
                var dtAmigo = mensagem.substring(mensagem.indexOf("§dt") + 3, mensagem.lastIndexOf("§dt"));
                var mensagemRefinada = mensagem.substring(mensagem.indexOf("§ms") + 3, mensagem.lastIndexOf("§ms"));
                var nomeAmigo = mensagem.substring(mensagem.indexOf("§nm") + 3, mensagem.lastIndexOf("§nm"));
                var uidAmigo = mensagem.substring(mensagem.indexOf("§id") + 3, mensagem.lastIndexOf("§id"));
                var type = mensagem.substring(mensagem.indexOf("§tp") + 3, mensagem.lastIndexOf("§tp"));
                if (uidAmigo != uidUser) {
                    if (type == "file") {
                        var name = mensagem.substring(mensagem.indexOf("§nf") + 3, mensagem.lastIndexOf("§nf"));

                        if (name.split(".").pop() == "jpeg" || name.split(".").pop() == "jpg" || name.split(".").pop() == "png") {
                            carregarFoto(name, 'balaoAmigo', nomeAmigo, dtAmigo, mensagemRefinada);
                        } else {
                            //ARQUIVOS SEM SER IMGS
                            loadMSG("balaoAmigo", nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, "arq")
                            document.title = "NOVA MENSAGEM!!!!"
                        }
                    } else {
                        //MENSAGENS COMUNS
                        loadMSG("balaoAmigo", nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, "comum")
                        document.title = "NOVA MENSAGEM!!!!"
                    }
                }
            });
        }
    });

}

function loadMSG(classe, nomeAmigo, dtAmigo, mensagemRefinada,uidAmigo, tipo) {
    if (tipo == "simples") {
        var nome = document.createElement("p");
        var dt = document.createElement("p");
        var ms = document.createElement('p');
        var balao = document.createElement('div')
        balao.classList.add(classe);
        nome.innerText = nomeAmigo;
        dt.innerText = dtAmigo;
        ms.innerText = mensagemRefinada;
        ms.style.marginBottom = '0px';
        dt.style.fontSize = '12px';
        dt.style.marginTop = '0px';
        dt.style.marginBottom = '0px';
        dt.style.fontStyle = 'italic';
        dt.style.textAlign = 'right';
        balao.appendChild(nome);
        balao.appendChild(ms);
        balao.appendChild(dt);
        msgCX.appendChild(balao);
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        if (tipo == "arq") {
            var nome = document.createElement("p");
            var dt = document.createElement("p");
            var img = document.createElement('img');
            var a = document.createElement('a');
            var balao = document.createElement('div')
            var ms = document.createElement("p");
            ms.innerText = name;
            a.style.color = "white";
            balao.classList.add(classe);
            nome.innerText = nomeAmigo;
            dt.innerText = dtAmigo;
            img.src = "img/pasta.png"
            img.style.borderRadius = "50%";
            img.style.width = "50px";
            img.style.height = "50px";
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function (event) {
                var blob = xhr.response;
            };
            xhr.open('GET', mensagemRefinada);
            xhr.send();
            a.href = mensagemRefinada;
            a.download = "true";
            a.target = "_blank";
            dt.style.fontSize = '12px';
            dt.style.marginTop = '0px';
            dt.style.marginBottom = '0px';
            dt.style.fontStyle = 'italic';
            dt.style.textAlign = 'right';
            a.appendChild(img);
            a.appendChild(ms);
            balao.appendChild(nome);
            balao.appendChild(a)
            balao.appendChild(dt);
            msgCX.appendChild(balao);
            window.scrollTo(0, document.body.scrollHeight);
        }else{
            if(tipo == "comum"){
                var nome = document.createElement("p");
                        var divFlex = document.createElement("div");
                        var img = document.createElement("img");
                        var dt = document.createElement("p");
                        var ms = document.createElement('p');
                        var balao = document.createElement('div')
                        balao.classList.add(classe);
                        nome.innerText = nomeAmigo;
                        dt.innerText = dtAmigo;
                        ms.innerText = mensagemRefinada;
                        ms.style.marginBottom = '0px';
                        divFlex.style.display = "flex";
                        img.style.borderRadius = '50%';
                        img.style.width = '44px';
                        img.style.marginRight = "10px"
                        img.style.height = "44px";
                        dt.style.fontSize = '12px';
                        dt.style.marginTop = '0px';
                        dt.style.marginBottom = '0px';
                        dt.style.fontStyle = 'italic';
                        dt.style.textAlign = 'right';
                        baixarImg(uidAmigo, img);
                        balao.onmouseover = function () {
                            img.style.width = '64px';
                            img.style.height = "64px";
                        }
                        balao.onmouseout = function () {
                            img.style.width = '44px';
                            img.style.height = "44px";
                        }
                        divFlex.appendChild(img)
                        divFlex.appendChild(nome);
                        balao.appendChild(divFlex)
                        balao.appendChild(ms);
                        balao.appendChild(dt);
                        msgCX.appendChild(balao);
                        window.scrollTo(0, document.body.scrollHeight);
            }
        }
    }
}

function eviarMsg(msg) {
    var size = 0;
    database.ref('chat/size/size').once('value', function (snapshot) {
        size = snapshot.val();
        console.log('size: ' + size)


        size++;
        console.log("size++" + size)
        var dNow = new Date();
        var localdate = dNow.getDate() + '/' + (dNow.getMonth() + 1) + '/' + dNow.getFullYear() + '-' + dNow.getHours() + ':' + dNow.getMinutes();
        var valor = "§dt" + localdate + "§dt" + "§tptext§tp" + '§ms' + msg + '§ms' + '§nm' + nomeUser + '§nm' + '§id' + uidUser + "§id";
        database.ref('chat/msg' + size).set({
            valor
        }).then(function (response) {
            database.ref('chat/size/').set({
                size
            });
            var nome = document.createElement("p");
            var dt = document.createElement("p");
            var ms = document.createElement('p');
            var balao = document.createElement('div')
            balao.classList.add("balaoUser");
            nome.innerText = nomeUser;
            dt.innerText = localdate;
            ms.innerText = msg;
            ms.style.marginBottom = '0px';
            dt.style.fontSize = '12px';
            dt.style.marginTop = '0px';
            dt.style.marginBottom = '0px';
            dt.style.fontStyle = 'italic';
            dt.style.textAlign = 'right';
            balao.appendChild(nome);
            balao.appendChild(ms);
            balao.appendChild(dt);
            msgCX.appendChild(balao);
            inputMsg.value = "";
            window.scrollTo(0, document.body.scrollHeight);
        });
    });


}
enviarFt.onchange = function () {
    const file = enviarFt.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = function () {
        ftDialog.setAttribute('src', fileReader.result);
        localStorage.setItem("ftPerfil", fileReader.result)
        ftPerfil.setAttribute('src', fileReader.result);
        var storage = firebase.storage().ref(uidUser + '/fotoPerfil.jpg');
        storage.put(file).then(function (snapshot) {
            storage.getDownloadURL().then(function (url) {
                firebase.database().ref('users/' + uidUser + '/profile_picture').set({
                    url
                }).then(function (response) {

                }).catch(error => {
                    console.log(error.code);
                });
            })
        });
    }
    fileReader.readAsDataURL(file);
}

function carregarTelaArquivoUser(url) {
    var dNow = new Date();
    var localdate = dNow.getDate() + '/' + (dNow.getMonth() + 1) + '/' + dNow.getFullYear() + '-' + dNow.getHours() + ':' + dNow.getMinutes();
    //ARQUIVOS SEM SER IMGS
    loadMSG("balaoUser", nomeUser, localdate, url,uidUser, "arq")
    backFileUp.style.cursor = "pointer";
    textFileUp.innerText = "Envie Seu Arquivo";
    backFileUp.onclick = function () {
        dialogFileUp.close();
        window.scrollTo(0, document.body.scrollHeight);
    };
}
function carregarFoto(name, clase, nomeAmigo, dtAmigo, mensagemRefinada) {
    var nome = document.createElement("p");
    var dt = document.createElement("p");
    var img = document.createElement('img');
    var a = document.createElement('a');
    var balao = document.createElement('div')
    var ms = document.createElement("p");
    ms.innerText = name;
    a.style.color = "white";
    balao.classList.add(clase);
    nome.innerText = nomeAmigo;
    dt.innerText = dtAmigo;
    img.style.width = "330px";
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function (event) {
        var blob = xhr.response;
    };
    xhr.open('GET', mensagemRefinada);
    xhr.send();
    img.src = mensagemRefinada;
    a.href = mensagemRefinada;
    a.download = "true";
    a.target = "_blank";
    dt.style.fontSize = '12px';
    dt.style.marginTop = '0px';
    dt.style.marginBottom = '0px';
    dt.style.fontStyle = 'italic';
    dt.style.textAlign = 'right';
    a.appendChild(img);
    a.appendChild(ms);
    balao.appendChild(nome);
    balao.appendChild(a)
    balao.appendChild(dt);
    msgCX.appendChild(balao);
    window.scrollTo(0, document.body.scrollHeight);
    backFileUp.style.cursor = "pointer";
    textFileUp.innerText = "Envie Seu Arquivo";
    backFileUp.onclick = function () {
        dialogFileUp.close();
        window.scrollTo(0, document.body.scrollHeight);
    };

}