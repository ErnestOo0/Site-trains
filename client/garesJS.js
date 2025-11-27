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

function json2Table(jsonData, idTable){

    function tab2str(tab){
        strvtab = "";
        for(v of Object.values(tab)){
            strvtab += `${v},`
        }

        return strvtab ;
    }

    //on met les entetes dans l'element table
    let htmlTabGares = "<table><tr>";
    for (var clef of Object.keys(jsonData[0])) {//il doit y avoir plus simple
        htmlTabGares += `<td>${clef}</td>`;// ` pour avoi les variables dans la string
    }
    htmlTabGares += "</tr>";

    for(var gare of jsonData){
        htmlTabGares += "<tr>"
        for (var info of Object.values(gare)){
            if (typeof(info) == "object"){
                htmlTabGares+= `<td>${tab2str(info)}</td>`;
            } else{
                htmlTabGares += `<td>${info}</td>`;
            }
        }
        htmlTabGares += "</tr>"
    }//il y a des doublons à enlever et les coordonnées ne s'affichent pas bien car c'est un dico

    htmlTabGares += "</table>";
    document.getElementById(idTable).innerHTML = htmlTabGares
}

function garesAccessibles(gareID){
    console.log("gares depuis :",gareID);

    $.getJSON("/gares/garesAtteignables/"+gareID, dataGaresAcces =>{//dataGaresAcces ne peut pas etre vide car une garere ne peut pas être isollée
        json2Table(dataGaresAcces, "tableauGares")
    });
}