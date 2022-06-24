export default class Cell{
    constructor(){
        this.status = 0; // revealed or not
        if(Math.random(1) < 0.5){
            this.type = 0; // safe
        }
        else{
            this.type = 1; // has bomb
        }
        this.flagged = false;
        this.type = 0;
        this.value = -1;
    }
}