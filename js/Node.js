const mat4 = glMatrix.mat4;
export class Node{
    constructor(){
        this.matrix = mat4.create();
        this.children = [];
        this.parent = null;
    }
    getGlobalTransform(){
        //if this is a root node, just return its local transformation
        if (this.parent == null)
            return mat4.clone(this.matrix);
        //if it has a parent, we need to multiply it by its parent's matrix
        const parentMatrix = this.parent.getGlobalTransform();
        mat4.mul(parentMatrix, parentMatrix, this.matrix);
        return parentMatrix;
    }
    addChild(node){
        this.children.push(node);
        node.parent = this;
    }
    removeChild(node){
        const index = this.children.indexOf(node);
        if(index >= 0){
            this.children.splice(index, 1);
            node.parent = null;
        }
    }
    traverse(before, after){
        // This method is a helper that is useful for all kinds of tasks.
        // We are going to use it for rendering.
        if(before)
            before(this);
        this.children.forEach(child => child.traverse(before, after));
        if(after)
            after(this);
    }
}