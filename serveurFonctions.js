const rayonT = 6371;//rayon de la Terre en km

function presentDanslistDico(listDico,clef,val){
    for(d in listDico){
        dico = listDico[d];
        if(dico[clef] == val){
            return true;
        }
    }
    return false;
}

function dicoGaresProches(listGares){

    let dicoGares = [];
    for(num in listGares){
        gareInfo = listGares[num];
        if(!presentDanslistDico(dicoGares,"id",gareInfo.id)){
            dicoGares.push({"name":gareInfo.name,"coord":gareInfo.coord,"id":gareInfo.id});
        }
    }
    return dicoGares;
}

function garePresente(gare,garesTab){
    return presentDanslistDico(garesTab,'id',gare.id)
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

//applique la formule de haversine sur les valeurs en radiant de l1 et l2
function haversine(l1,l2){
    return Math.pow(Math.sin((l2-l1)/180),2);
}

//prend les coord de 2 points en parametre et renvoie la distance qui sépare ces 2 points
function distanceEntre2Gares(g1,g2){

    //on commence par convertir les degres en radians
    let dlat1 = deg2rad(Number(g1.lat));
    let dlat2 = deg2rad(Number(g2.lat));
    let dlon1 = deg2rad(Number(g1.lon));
    let dlon2 = deg2rad(Number(g2.lon));
    let a = haversine(dlat1,dlat2)+Math.cos(dlat1)*Math.cos(dlat2)*haversine(dlon1,dlon2);

    return 2*rayonT*Math.asin(Math.sqrt(a));
}

function triGaresDist(lGares,destination){

    function prepare(){
        for(let ig in lGares){
            if(lGares[ig].id == destination.id){
                lGares.splice(ig, ig)
                lGares.unshift(destination);
                return true;
            }
        }
        return false;//lGares ne contient pas la destination, il y a un probleme
    }
    prepare()
    console.log(destination);
    console.log(lGares)
    console.log(distanceEntre2Gares(lGares[0].coord,lGares[2].coord));
}

module.exports = {
    dicoGaresProches,
    garePresente,
    triGaresDist
};