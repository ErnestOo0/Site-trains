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

function printListGares(dicoGares){

    GaresProches.eachLayer(function (layer) {
        map.removeLayer(layer);
        GaresProches.removeLayer(layer)
    });
    //devrait faire pareil mais ne marche pas
    //GaresProches.invoke(map.removeLayer);
    //GaresProches.clearLayers();
    
    for(let num in dicoGares){
        let infoGare = dicoGares[num];//contient le nom, l'id et les coord

        let newMark = L.marker(infoGare.coord);
        newMark.bindPopup("Gare de " + infoGare.name).openPopup();// onn affiche le nom de la gare lorque l'on clique sur le marker


        //quand on clique sur une gare on récupère son id pour pouvoir récupérer les gares accezssibles
        newMark.on("click", async ()=> {
            console.log("gare selectionnée :", infoGare.id);
            let ret = await garesAccessibles(infoGare.id);
            lienGares(infoGare,ret);
            console.log(ret);
        });
        GaresProches.addLayer(newMark);

    }
    GaresProches.addTo(map);



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

