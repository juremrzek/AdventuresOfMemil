export class Application{
    constructor(canvas){
        this.callUpdate = this.callUpdate.bind(this);
        this.canvas = canvas;
        this.gl = null;
        try {
            this.gl = this.canvas.getContext('webgl2');
        } catch (error) {console.log(error)}
        if (!this.gl) {
            console.log('Error - Cannot create WebGL 2.0 context');
        }
    }
    async init() {
        await this.start();
        requestAnimationFrame(this.callUpdate);
    }
    start(){
        
    }
    update(){
        
    }
    render(){
        
    }
    callUpdate(){
        this.update();
        this.render();
        requestAnimationFrame(this.callUpdate);
    }
}