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
    $.getJSON("/gares/garesAtteignables/"+gareID, data =>{
        console.log(data);
    });
}