fichierClef = "clefSNCF.json"

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// const controller = require("./serveurController.js");

// app.use("/serv",controller);

const utils = require("./serveurFonctions.js");
const appelApi = require("./serveurRequetesApi.js");

server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

app.get('/', (request, response) => {
    response.sendFile('homePage/home.html', {root: __dirname});
    console.log("envoie de la page d'acceuil");
});

app.get('/file/:dirName/:fileName', (request, response) => {
    console.log("traitement du fichier:",request.params.fileName)
    response.sendFile(request.params.dirName+"/"+request.params.fileName, {root: __dirname});
    console.log("envoie du fichier :",request.params.dirName+"/"+request.params.fileName);
});

app.get("/sncf/:req",async (request, response) => {//fonction asyncrone qui permet de faire await
    let jsonData = await appelApi.appelSncf(request.params.req);
    response.json(jsonData);

});

app.get('/gares/:centerLat/:centerLng/:dist',async (request, response) => {
    
    response.on("finish", () => {//pour savoir si le serveur à bien envoyé une réponse au client
        console.log("Réponse envoyée au client");
    });

    let jsonData = await appelApi.garesProches(request.params.centerLat,request.params.centerLng,request.params.dist);
    console.log("gares :",jsonData.stop_areas);
    let dicoGares = utils.dicoGaresProches(jsonData.stop_areas);
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
    let lignesJson = await appelApi.appelSncf("stop_areas/"+idGare+"/lines");
    // pour chaque ligne on récupère les stops
    let listGaresAtteign = [];

    //comme async, il doit attendre la reponse et est effectué après. Le await ne resoult pas le probleme
    //console.log(lignesJson.lines);
    
    for (i in lignesJson.lines){//possibilité de mettre plusieurs lignes dans le meme requete donc double boucle pas necessaire, enfait si on met plusiseurs parametres, c'est un AND et pas un OR comme souhaité
        let ligne = lignesJson.lines[i];
        console.log("id de la ligne :",ligne.id);

        let listGaresLine = await appelApi.garesligne(ligne.id);
        listGaresLine.forEach(gare =>{
            if(! utils.garePresente(gare,listGaresAtteign)){
                listGaresAtteign.push(gare);
            }
            
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