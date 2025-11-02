console.log("ficiher js de la map")

let map;
let centerMarker;
let tabMarkersGaresProches = [];
let tabLinesGaresAccessibles = [];

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

function lienGares(start, lGares){

    while(tabLinesGaresAccessibles.length > 0){//on supprime les précédents markers de la carte et le tableau qui les contenais
        let line = tabLinesGaresAccessibles[0];
        map.removeLayer(line);
        tabLinesGaresAccessibles.shift()
    }

    let startCoord = start.coord
    console.log("start coord",startCoord)
    lGares.forEach(g =>{
        var gCoord = g.coord;
        var line = L.polygon([
            [startCoord.lat,startCoord.lon],
            [gCoord.lat,gCoord.lon],
        ]);
        line.addTo(map);
        tabLinesGaresAccessibles.push(line);
        console.log(line);
    });
}

function printListGares(dicoGares,idDiv){
    while(tabMarkersGaresProches.length > 0){//on supprime les précédents markers de la carte et le tableau qui les contenais
        let mark = tabMarkersGaresProches[0];
        map.removeLayer(mark);
        tabMarkersGaresProches.shift()
    }
    
    for(let num in dicoGares){
        let infoGare = dicoGares[num];
        //console.log(infoGare);//contient le nom, l'id et les coord

        let newMark = L.marker(infoGare.coord);
        newMark.bindPopup("Gare de " + infoGare.name).openPopup();// onn affiche le nom de la gare lorque l'on clique sur le marker
        newMark.addTo(map);

        //quand on clique sur une gare on récupère son id pour pouvoir récupérer les gares accezssibles
        newMark.on("click", async ()=> {
            console.log("gare selectionnée :", infoGare.id);
            let ret = await garesAccessibles(infoGare.id);
            lienGares(infoGare,ret);
            console.log(ret);
        });

        //console.log(typeof newMark);
        tabMarkersGaresProches.push(newMark);

    }
}

async function garesProches() {
    let center = map.getCenter();
    let bord = map.getBounds();
    let dist = distanceBord(center,bord);
    console.log("demande des gares proches");
    let dicoGares;
    dicoGares = await fetch("/gares/"+center.lat+"/"+center.lng+"/"+dist)
        .then((data)=> data.json());
    
    printListGares(dicoGares,"listGares");
    console.log(dicoGares);
}

window.addEventListener("load",()=>{
    garesProches();

    map.on("moveend",() => {
        garesProches();
    });

    map.on("move",()=>{
        printCoordo("coord");
        printBord("bord");
    });

    //map.on("move",updateCentermarker);//fonction de call back passé en parametre
});

