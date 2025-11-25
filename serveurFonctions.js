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

function swichPos(t,p1,p2){//échange la position de des éléments aux indices p1 et p2

    let e1 = t.splice(p1,1,t[p2])[0]//splice renvoie un tableau d'un élément
    t.splice(p2,1,e1);
}

//place l'élément le plus proche de l'élément à l'indice iFin juste avant lui
function plusProcheFin(tab,iFin){
    let pProche = 0;
    let dMin = distanceEntre2Gares(tab[0].coord,tab[iFin].coord);
    for(var i=1;i<iFin;i++){
        let d = distanceEntre2Gares(tab[i].coord,tab[iFin].coord)
        if(d < dMin){
            pProche = i;
            dMin = d;
        }
    }

    swichPos(tab, pProche,iFin-1);


}


//trie le tableau de gares lGares en mettant en dernier la destination et place avant la gare la plus proche, trie simimaire sur tout le tableau
function triGaresDist(lGares,destination){

    function prepare(){
        for(let ig in lGares){
            if(lGares[ig].id == destination.id){
                swichPos(lGares, ig,lGares.length-1);
                return true;
            }
        }
        return false;//lGares ne contient pas la destination, il y a un probleme
    }
    prepare()

    for(var iArriv = lGares.length -1; iArriv > 0; iArriv--){
         plusProcheFin(lGares, iArriv);
    }

}

module.exports = {
    dicoGaresProches,
    garePresente,
    triGaresDist
};