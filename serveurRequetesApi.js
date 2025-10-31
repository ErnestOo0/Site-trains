//permet de lire les fichiers
const fs = require('fs');
//récupération de la clef de l'API sncf
//elle est placé dans un autre fichier (clefSNCF.json) qui doit rester priver
const sncfToken = JSON.parse(fs.readFileSync(fichierClef)).SncfClefAPI;

//fonctionnement : type/valeur de ce qu'on a (on peut en mettre plusieurs à la suite normalement)et /type de ce qu'on veut
const urlApi = "https://api.sncf.com/v1/coverage/sncf/";

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

async function garesligne(idLine){
    let tabGaresLignes = [];
    let gares = await appelSncf("lines/"+idLine+"/stop_areas");
    
    gares.stop_areas.forEach(g => {
        tabGaresLignes.push({"id":g.id,"name":g.name,"label":g.label,"coord":g.coord})//difference entre name et label ???
    })
    return tabGaresLignes;
}

//fonctions à exporter
module.exports = {
    appelSncf,
    garesProches,
    garesligne
}