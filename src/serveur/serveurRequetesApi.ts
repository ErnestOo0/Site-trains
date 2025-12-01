//permet de lire les fichiers
const fs = require('fs');
//récupération de la clef de l'API sncf
//elle est placé dans un autre fichier (clefSNCF.json) qui doit rester priver
const fichierClef: string = "clefSNCF.json"
const sncfToken: string = JSON.parse(fs.readFileSync(fichierClef)).SncfClefAPI;

//fonctionnement : type/valeur de ce qu'on a (on peut en mettre plusieurs à la suite normalement)et /type de ce qu'on veut
const urlApi: string = "https://api.sncf.com/v1/coverage/sncf/";

async function appelSncf(demande: string) {//il faut regarder le type de retour de
    console.log("traitement de la demande :",urlApi+demande);
    let dataSncf: Response = await fetch(urlApi+demande,{
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