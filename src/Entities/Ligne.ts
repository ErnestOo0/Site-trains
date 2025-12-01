class Ligne{
    id: string;
    name: string;
    listGares: Gare[] = [];

    constructor(id: string, name: string){
        this.id = id;
        this.name = name;
    }
    //rien devant les methodes
    ajoutGare(tabGare: Gare[]): void{//peut être renvoyer une valeur pour savoir si l'opération à fonctionnée
        for(let gare of tabGare) {
            this.listGares.push(gare);
        }
    }
}

