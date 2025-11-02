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

module.exports = {
    dicoGaresProches,
    garePresente
};