class Player{
    constructor(){
        this.pos = [0,0,0];
        this.direction = [0,0,0];
        this.speed = 10;
        this.rotateSpeed = 8;
        this.rotation = 0;
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backwards = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.node = null;
    }
}