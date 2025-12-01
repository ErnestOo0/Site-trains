import {Request, Response} from 'express';
import * as utils from "./serveurFonctions.ts";
import * as API from "./serveurRequetesApi.ts";

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port: number = 8888;

server.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);});

app.get('/', (request: Request, response: Response) => {
    response.sendFile('homePage/home.html', {root: __dirname});
    console.log("envoie de la page d'acceuil");
});

app.get('/file/:dirName/:fileName', async (request: Request, response: Response) => {
    console.log("traitement du fichier:",request.params.fileName)
    response.sendFile(request.params.dirName+"/"+request.params.fileName, {root: __dirname});
    console.log("envoie du fichier :",request.params.dirName+"/"+request.params.fileName);
});

app.get("/sncf/:req",async (request: Request, response: Response) => {//fonction asyncrone qui permet de faire await
    let jsonData = await API.appelSncf(request.params.req);
    response.json(jsonData);

});

app.get('/gares/:centerLat/:centerLng/:dist',async (request: Request, response: Response) => {

    response.on("finish", () => {//pour savoir si le serveur à bien envoyé une réponse au client
        console.log("Réponse envoyée au client");
    });

    let jsonData = await API.garesProches(request.params.centerLat,request.params.centerLng,request.params.dist);
    let dicoGares = utils.dicoGaresProches(jsonData.stop_areas);
    //pas encore fait le cas où il y a plusieurs pages
    console.log("dico gares :",dicoGares);
    response.json(dicoGares);
});

app.get('/gares/garesAtteignables/:idGare',async (request: Request, response: Response) => {

    response.on("finish", () => {//pour savoir si le serveur à bien envoyé une réponse au client
        console.log("Réponse envoyée au client");
    });

    let idGare = request.params.idGare;
    //on récupère les lignes qui passent par la gare en parammetre
    let lignesJson = await API.appelSncf("stop_areas/"+idGare+"/lines");
    // pour chaque ligne on récupère les stops
    let jsonGaresAtteign:{ligne: string[],gare : string[],dessert: string[]} = {"ligne":[],"gare":[],"dessert":[]};
    //faire une classe

    //pour chaque ligne on ajoute les gares par lesquelles elles passent
    for(let l: number of lignesJson.lines){
        console.log("id de la ligne :",l.id);
        jsonGaresAtteign.ligne.push({"id":l.id, "name":l.name});
        let listGaresLine = await API.garesligne(l.id);

        let dest = l.routes[0].direction.stop_area;
        utils.triGaresDist(listGaresLine,dest);
        listGaresLine.forEach(gare =>{

            if(! utils.garePresente(gare,jsonGaresAtteign.gare)){
                jsonGaresAtteign.gare.push(gare);
            }
            jsonGaresAtteign.dessert.push({"idLigne":l.id,"idGare":gare.id});
        });
    }
    console.log("gares atteignables :",jsonGaresAtteign);
    response.json(jsonGaresAtteign);

});