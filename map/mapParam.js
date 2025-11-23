console.log("ficiher js de la map")

let map;
let centerMarker;
let GaresProches = L.layerGroup();
let LiensGaresAccessibles =  L.layerGroup();

function initMap(mapName,x,y,zoom){
    map = L.map(mapName).setView([x,y], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    //centerMarker = L.marker([x,y],title = "center").addTo(map);
}

function addMarker(x,y){
    let marker = L.marker([x,y]).addTo(map);
    return marker;
}

function printCoordo(id){
    let coordo = map.getCenter();
    document.getElementById(id).innerHTML = "lat ="+coordo.lat+", longitude ="+coordo.lng;
}
function printBord(id){
    let bord = map.getBounds();
    let ne = bord._northEast;
    let sw = bord._southWest;
    document.getElementById(id).innerHTML = "northEast = "+ne.lat+","+ne.lng+"<br> southWest = "+sw.lat+","+sw.lng;
}

function updateCentermarker(){
    let coordo = map.getCenter();
    centerMarker.setLatLng([coordo.lat,coordo.lng]);
}

function distanceBord(center,bord){
    return map.distance(center,bord._northEast);
}

async function garesAccessibles(gareID){
    let tabInfoGares = await fetch("/gares/garesAtteignables/"+gareID)
        .then((data)=> data.json());

    return tabInfoGares;
}

//généraliser les 2 foonctions avec une fonction qui prend une focntions de callback en param
function lienGares(start, jsonAtteing){

    function coordGaresLigne(idL){//avec l'id d'une ligne renvoie toutes les coord des gares qui sont sur cette ligne

        function findCoordGareById(idG){
            for(g of jsonAtteing.gare){//froEach ne permet pas de quitter avec un return
                if(g.id == idG){
                    return g.coord;
                }
            }
        }

        let coordGare = [];
        jsonAtteing.dessert.forEach(d =>{
            if(d.idLigne == idL){
                coordGare.push(findCoordGareById(d.idGare));
            }
        })
        return coordGare;
    }

    LiensGaresAccessibles.eachLayer(function (layer) {
        map.removeLayer(layer);
        LiensGaresAccessibles.removeLayer(layer)
    });

    let startCoord = start.coord

    jsonAtteing.ligne.forEach( ligneTrain =>{

        let debCoord = startCoord;
        coordGaresLigne(ligneTrain.id).forEach(g =>{

            var line = L.polygon([
                [debCoord.lat,debCoord.lon],
                [g.lat,g.lon],
            ]);

            LiensGaresAccessibles.addLayer(line);
            debCoord = g;//les lignes doivent aller d'une gare à l'autre donc on décale le début
        })
    })
    LiensGaresAccessibles.addTo(map);
}

function printListGares(dicoGares) {

    GaresProches.eachLayer(function (layer) {
        map.removeLayer(layer);
        GaresProches.removeLayer(layer)
    });
    //devrait faire pareil mais ne marche pas
    //GaresProches.invoke(map.removeLayer);
    //GaresProches.clearLayers();

    for (let num in dicoGares) {
        let infoGare = dicoGares[num];//contient le nom, l'id et les coord

        let newMark = L.marker(infoGare.coord);
        newMark.bindPopup("Gare de " + infoGare.name).openPopup();// onn affiche le nom de la gare lorque l'on clique sur le marker


        //quand on clique sur une gare on récupère son id pour pouvoir récupérer les gares accezssibles
        newMark.on("click", async () => {
            console.log("gare selectionnée :", infoGare.id);
            let ret = await garesAccessibles(infoGare.id);
            lienGares(infoGare, ret);
            tabGare(infoGare, ret,'Tab_Gares');
            //json2Table2(ret, "Tab_Gares");
            console.log(ret);
        });
        GaresProches.addLayer(newMark);

    }
    GaresProches.addTo(map);
}

function htmlElem(nomElem,htmlString, idAttrib = '', classAttrib = ''){
    let deb =  `<${nomElem} `;
    if(idAttrib != ''){
        deb += `id = ${idAttrib} `;
    }
    if(classAttrib != ''){
        deb += `class = ${classAttrib} `;
    }
    return `${deb}>${htmlString}</ ${nomElem}>`;
}

function htmlDiv(htmlString, idAttrib = '', classAttrib = ''){//fonction qui permet de mettre des élément dans une div html
    return htmlElem('div',htmlString,idAttrib= idAttrib,idAttrib= classAttrib);
}

function tableHtml(Jsondico, cols = [], idAttrib = '', classAttrib = ''){
    let htmlString;
    //Si rien n'est précisé, on met tous les atributs du dico en titre de colone
    if(cols.length <= 0){
        cols = Object.keys(Jsondico[0]);
    }
    //on fait la premiere colone avec les noms
    let thTable = "";
    for(let clef of cols){
        thTable += htmlElem('th',clef);
    }
    htmlString = htmlElem('tr',thTable)

    let valColones = "";
    for(var val of Jsondico){
        thTable = "";
        for(var attrib of cols){
            thTable += htmlElem('td',val[attrib]);
        }
        valColones += htmlElem('tr',thTable);
    }
    htmlString += valColones;

    return htmlElem('table',htmlString,idAttrib= idAttrib,idAttrib= classAttrib);
}



function clickButton(idB,tab){

    function domOuStr(x){//renvoie l'element du dom qui a L'id x ou x si c'est un élément du dom
        //les parametres sont censé etre des strings mais ils devienent des éléments du dom quand ils sont appelés dans onclik mais quand ils sont dans une fonction Element.on("event,...) ils restent une string
        let elem = document.getElementById(x);
        if(elem == null){
            elem = x;
        }
        return elem;
    }

    function affichMasqu(){

        let elem = document.getElementById(tab);
        if(elem == null){
            elem = tab;
        }
        elem.hidden = !elem.hidden;
        return elem.hidden;
    }

    let button = domOuStr(idB)
    let table = domOuStr(tab)
    //On ajoute l'evenement qui permet d'affichier le tableau et de modifier le boutton quand on clique dessus
    if(affichMasqu(table)){//on change sa valeure et on la récupère
        button.setAttribute("value",">");
        console.log("masqué");
    }
    else{
        button.setAttribute("value","v");
        console.log("démasqué");
    }
}

function caseTab(titre,dicoVal,idElem,idEmplacement,colones=[],classElem=''){

    htmlRes = "";
    //On ajoute le titre et le bouton de sélection
    let idButton = idElem+'Button';
    let idTable = idElem + `tab`//id de la table
    let htmlTitre = titre;
    htmlTitre += ` <input type="button" value=">" id="${idButton}" onclick="clickButton('${idButton}','${idTable}')"></input>`
    htmlListGares = htmlDiv(htmlTitre,idAttrib = idElem+'Titre')

    //On ajoute le tableau

    htmlListGares += tableHtml(dicoVal,cols = colones,idAttrib=idTable)

    htmlListGares = htmlDiv(htmlListGares,idAttrib = idElem);
    htmlRes += htmlListGares

    //on ajoute le tout dans la div qui est donnée en parametre
    document.getElementById(idEmplacement).innerHTML += htmlRes;
    //on masque le tableau
    console.log(idElem);
    document.getElementById(idTable).hidden = true;

}

function tabGare(gareOrigine,dicoGaresAcces,idDiv){

    //similaire à coordGaresLigne mais revoie tout les éléments, il faudrait faire une fonction plus générique
    function garesSurLigne(idL){//avec l'id d'une ligne renvoie toutes les coord des gares qui sont sur cette ligne

        function findGareById(idG){
            for(g of dicoGaresAcces.gare){//froEach ne permet pas de quitter avec un return
                if(g.id == idG){
                    return g;
                }
            }
        }

        let lGare = [];
        dicoGaresAcces.dessert.forEach(d =>{
            if(d.idLigne == idL){
                lGare.push(findGareById(d.idGare));
            }
        })
        return lGare;
    }

    document.getElementById(idDiv).innerHTML = ""
    let titre1 = `${dicoGaresAcces.gare.length} Gares accessibles`;
    caseTab(titre1,dicoGaresAcces.gare,'listGaresAccessibles',idDiv,colones=["name"]);

    for(var li of dicoGaresAcces.ligne){
        caseTab(`Ligne ${li.name}`,garesSurLigne(li.id),`ligne_${li.id}`,idDiv,colones=["name"]);
    }



}

async function getGaresProches() {
    let center = map.getCenter();
    let bord = map.getBounds();
    let dist = distanceBord(center,bord);
    console.log("demande des gares proches");
    let dicoGares;
    dicoGares = await fetch("/gares/"+center.lat+"/"+center.lng+"/"+dist)
        .then((data)=> data.json());
    
    printListGares(dicoGares);
    console.log(dicoGares);
}



window.addEventListener("load",()=>{
    getGaresProches();

    map.on("moveend",() => {
        getGaresProches();
    });

    map.on("move",()=>{
        printCoordo("coord");
        printBord("bord");
    });

    //map.on("move",updateCentermarker);//fonction de call back passé en parametre
});

