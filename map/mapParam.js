console.log("ficiher js de la map")

let map;
let centerMarker;
let tabMarkersGaresProches = [];

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

function printListGares(dicoGares,idDiv){
    while(tabMarkersGaresProches.length > 0){//on supprime les précédents markers de la carte et le tableau qui les contenais
        let mark = tabMarkersGaresProches[0];
        map.removeLayer(mark);
        tabMarkersGaresProches.shift()
    }
    
    for(let num in dicoGares){
        let infoGare = dicoGares[num];
        //console.log(infoGare);//contient le nom, l'id et les coord

        //let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        //layer.addTo(map);
        let newMark = L.marker(infoGare.coord);
        newMark.bindPopup("Gare de " + infoGare.name).openPopup();// onn affiche le nom de la gare lorque l'on clique sur le marker
        newMark.addTo(map);

        //quand on clique sur une gare on récupère son id pour pouvoir récupérer les gares accezssibles
        newMark.on("click", ()=> {
            console.log(infoGare.id);
        });

        //console.log(typeof newMark);
        tabMarkersGaresProches.push(newMark);

    }
    //console.log(tabMarkersGaresProches)

    //$(idDiv).html(html);//marche pas
    //document.getElementById(idDiv).innerHTML = html;
}

async function garesProches() {
    let center = map.getCenter();
    let bord = map.getBounds();
    let dist = distanceBord(center,bord);
    console.log("demande des gares proches");
    let dicoGares;
    dicoGares = await fetch("/gares/"+center.lat+"/"+center.lng+"/"+dist,)
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

