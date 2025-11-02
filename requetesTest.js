fichierClef = "clefSNCF.json"

//permet de lire les fichiers
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

//récupération de la clef de l'API sncf
//elle est placé dans un autre fichier (clefSNCF.json) qui doit rester priver


const sncfToken = JSON.parse(fs.readFileSync(fichierClef)).SncfClefAPI;

console.log(sncfToken);

const urlApi = "https://api.sncf.com/v1/coverage/sncf/";

//fonctionnement : type/valeur de ce qu'on a (on peut en mettre plusieurs à la suite normalement)et /type de ce qu'on veut

server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

async function appelSncf(demande){
    console.log("traitement de la demande :",urlApi+demande);
    let dataSncf = await fetch(urlApi+demande,{
        headers:{
            "Authorization" : "basic "+btoa(sncfToken+":")//doit etre encodé en base 64
        }
    })

    if (!dataSncf.ok){
        console.log("valeur de ok =",dataSncf.ok,", erreur lors de la requette");
        console.log("Status :",dataSncf.status);

    }
    console.log("demande à l'api effectué");
    return await dataSncf.json();
}

async function garesProches(lat,lng,distance) {
    let strDemande = "coord/"+lng+"%3B"+lat+"/stop_areas?distance="+Math.trunc(distance)+"&";//la distance doit être entiere, comme elle est en metre, on a pas besoin d'une préscision en cm
    return await appelSncf(strDemande)
}

function presentDanslistDico(listDico,clef,val){
    for(d in listDico){
        dico = listDico[d];
        if(dico[clef] == val){
            return true;
        }
    }
    return false;
}

app.get('/', (request, response) => {
    response.sendFile('homePage/home.html', {root: __dirname});
    console.log("envoie de la page d'acceuil");
});

app.get('/file/:dirName/:fileName', (request, response) => {
    console.log("traitement du fichier:",request.params.fileName)
    response.sendFile(request.params.dirName+"/"+request.params.fileName, {root: __dirname});
    console.log("envoie du fichier :",request.params.dirName+"/"+request.params.fileName);
});

// app.get('/leafletCSS', (request, response) => {
//     response.sendFile('./node_modules/leaflet/dist/leaflet.css', {root: __dirname});
//     console.log("envoie du css pour leaflet");
// });

// app.get('/leafletJS', (request, response) => {
//     response.sendFile('./node_modules/leaflet/src/Leaflet.js', {root: __dirname});
//     console.log("envoie du js pour leaflet");
// });

app.get("/sncf/:req",async (request, response) => {//fonction asyncrone qui permet de faire await
    let jsonData = await appelSncf(request.params.req);
    response.json(jsonData);


    //doit se faire dans une fonction async pour faire le await car asyncrone
    //let req = await fetch("https://jsonplaceholder.typicode.com/users")
        //.then(r => console.log(r))//s'execute apres que la promesse soit résolu
        //.then(r => r.text())//récupère la valeur de la promesse sous forme de texte
        //.then(r => r.json())//le transforme en json
        //.then(r => console.log(r))
    // console.log("req :",req)
    //let jsonReq = await req.text()//promesse donc doit mettre await pour attendre qu'elle soit résolu
    //console.log("text :",jsonReq)
    // console.log("json :",req.json())
    //response.send(jsonReq)
    // if(req.ok == true){//si on a bien réussi à récupérer une valeure
    //     console.log(req.text())
    //     response.json(req.text())    
    // }
});

function dicoGaresProches(listGares){
    let dicoGares = [];
    for(num in listGares){
        gareInfo = listGares[num];
        if(!presentDanslistDico(dicoGares,"id",gareInfo.id)){
            dicoGares.push({"name":gareInfo.name,"coord":gareInfo.coord,"id":gareInfo.id});
        }
    }
    return dicoGares;
}

async function garesligne(idLine){
    let tabGaresLignes = [];
    let gares = await appelSncf("lines/"+idLine+"/stop_areas");
    
    gares.stop_areas.forEach(g => {
        tabGaresLignes.push({"id":g.id,"name":g.name,"label":g.label,"coord":g.coord})//difference entre name et label ???
    })
    return tabGaresLignes;
}

app.get('/gares/:centerLat/:centerLng/:dist',async (request, response) => {
    
    response.on("finish", () => {//pour savoir si le serveur à bien envoyé une réponse au client
        console.log("Réponse envoyée au client");
    });

    let jsonData = await garesProches(request.params.centerLat,request.params.centerLng,request.params.dist);
    console.log("gares :",jsonData.stop_areas);
    let dicoGares = dicoGaresProches(jsonData.stop_areas);
    //pas encore fait le cas où il y a plusieurs pages
    console.log("dico gares :",dicoGares);
    response.json(dicoGares);
});

app.get('/gares/garesAtteignables/:idGare',async (request, response) => {
    
    response.on("finish", () => {//pour savoir si le serveur à bien envoyé une réponse au client
        console.log("Réponse envoyée au client");
    });

    let idGare = request.params.idGare;
    //on récupère les lignes qui passent par la gare en parammetre
    let lignesJson = await appelSncf("stop_areas/"+idGare+"/lines");
    // pour chaque ligne on récupère les stops
    let listGaresAtteign = [];

    //comme async, il doit attendre la reponse et est effectué après. Le await ne resoult pas le probleme
    //console.log(lignesJson.lines);
    
    for (i in lignesJson.lines){//possibilité de mettre plusieurs lignes dans le meme requete donc double boucle pas necessaire, enfait si on met plusiseurs parametres, c'est un AND et pas un OR comme souhaité
        let ligne = lignesJson.lines[i];
        console.log("id de la ligne :",ligne.id);
        console.log("info ligne : ", ligne.name)

        let listGaresLine = await garesligne(ligne.id);
        listGaresLine.forEach(gare =>{
            listGaresAtteign.push(gare);
        });
    
    }

    console.log("gares atteignables :",listGaresAtteign);//listGaresAtteign car il est remplis dans une fonction async
    //enlever les doublons et trier
    //si possible le faire dans la requete à l'api, pas possible
    response.json(listGaresAtteign);

    // let jsonData = await garesProches(request.params.centerLat,request.params.centerLng,request.params.dist);
    // console.log("gares :",jsonData.stop_areas);
    // let dicoGares = dicoGaresProches(jsonData.stop_areas);
    // //pas encore fait le cas où il y a plusieurs pages
    // console.log("dico gares :",dicoGares);
    // response.json(dicoGares);
});