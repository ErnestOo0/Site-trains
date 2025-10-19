console.log("le js marche nickel")

function getGares(){
    $.getJSON("/sncf/stop_areas?",data => {
        console.log(data);
    });
}

function getLines(){
    $.getJSON("/sncf/garesAtteignables/stop_area:SNCF:87413542",data => {
        console.log(data);
    });  
}

function garesAccessibles(gareID){
    console.log("gares depuis :",gareID);
    let htmlTabGares = "<table><tr>"
    let tabResGares;
    $.getJSON("/gares/garesAtteignables/"+gareID, dataGaresAcces =>{//dataGaresAcces ne peut pas etre vide car une garere ne peut pas être isollée
        //a mettre dans une fonction
        //on met les entetes dans l'ellement table
        //console.log(dataGaresAcces[0]);
        let htmlTabGares = "<table><tr>";
        for (var clef of Object.keys(dataGaresAcces[0])) {//il doit y avoir plus simple
            htmlTabGares += `<td>${clef}</td>`;// ` pour avoi les variables dans la string
        }
        htmlTabGares += "</tr>";

        for(var gare of dataGaresAcces){
            htmlTabGares += "<tr>"
            for (var info of Object.values(gare)){
                htmlTabGares += `<td>${info}</td>`
            }
            htmlTabGares += "</tr>"
        }//il y a des doublons à enlever et les coordonnées ne s'affichent pas bien car c'est un dico

        htmlTabGares += "</table>";
        document.getElementById("tableauGares").innerHTML = htmlTabGares
    });
}