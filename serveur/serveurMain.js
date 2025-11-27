fichierClef = "clefSNCF.json"

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// const controller = require("./serveurController.js");

// app.use("/serv",controller);

const utils = require("./serveur/serveurFonctions.js");
const appelApi = require("./serveur/serveurRequetesApi.js");

server.listen(8888, () => {console.log('Le serveur écoute sur le port 8888');});

app.get('/', (request, response) => {
    response.sendFile('homePage/home.html', {root: __dirname});
    console.log("envoie de la page d'acceuil");
});

app.get('/file/:dirName/:fileName', async (request, response) => {
    console.log("traitement du fichier:",request.params.fileName)
    response.sendFile(request.params.dirName+"/"+request.params.fileName, {root: __dirname});
    console.log("envoie du fichier :",`${request.params.dirName}/${request.params.fileName}`);
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
    let jsonGaresAtteign = {"ligne":[],"gare":[],"dessert":[]};

    //pour chaque ligne on ajoute les gares par lesquelles elles passent
    for(let l of lignesJson.lines){
        jsonGaresAtteign.ligne.push({"id":l.id, "name":l.name});
        let listGaresLine = await appelApi.garesligne(l.id);

        let dest = l.routes[0].direction.stop_area;
        utils.triGaresDist(listGaresLine,dest);
        listGaresLine.forEach(gare =>{

            if(! utils.garePresente(gare,jsonGaresAtteign.gare)){
                jsonGaresAtteign.gare.push(gare);
            }
            jsonGaresAtteign.dessert.push({"idLigne":l.id,"idGare":gare.id});
        });
    }
    response.json(jsonGaresAtteign);

});