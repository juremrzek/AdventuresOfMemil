class Player{
    constructor(){
        this.pos = [0,0,0];
        this.direction = [0,0,0];
        this.angle = 0;
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backwards = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.speed = 30;
        this.rotateSpeed = 8;
    }
}