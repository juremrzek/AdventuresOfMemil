const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
export class Movement{
    constructor(){
        this.speed = 10;
        this.rotateSpeed = 1;
        this.cameraDist = 6;
        this.positionalOffsetAngle = Math.PI/2 + 0.02;
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backwards = false;
        this.rotate = false;
        this.node = null;
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.globalMatrix;
        let max = [0,0,0];
        let min = [0,0,0];

        for (let i = 0; i < node.mesh.primitives.length; i++) {
            if (max[0] < node.mesh.primitives[i].attributes.POSITION.max[0])
                max[0] = node.mesh.primitives[i].attributes.POSITION.max[0];

            if (max[1] < node.mesh.primitives[i].attributes.POSITION.max[1])
                max[1] = node.mesh.primitives[i].attributes.POSITION.max[1];
            
            if (max[2] < node.mesh.primitives[i].attributes.POSITION.max[2])
                max[2] = node.mesh.primitives[i].attributes.POSITION.max[2];

            if (min[0] > node.mesh.primitives[i].attributes.POSITION.min[0])
                min[0] = node.mesh.primitives[i].attributes.POSITION.min[0];
            
            if (min[1] > node.mesh.primitives[i].attributes.POSITION.min[1])
                min[1] = node.mesh.primitives[i].attributes.POSITION.min[1];
            
            if (min[2] > node.mesh.primitives[i].attributes.POSITION.min[2])
                min[2] = node.mesh.primitives[i].attributes.POSITION.min[2];
        }

        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollisions(player, scene) {
        //GET AABB FOR PLAYER
        const playerBox = this.getTransformedAABB(player)
        scene.traverse(node => {
            if (node.mesh != null && node != player) {
                //Get global space AABBs.
                const aBox = this.getTransformedAABB(node);

                //Check if there is collision.
                const isColliding = this.aabbIntersection(playerBox, aBox);
                console.log()
                if (!isColliding) {
                    return;
                }

                else if (node.extras != null && node.extras.Type != null && node.extras.Type == "Cage") {
                    for (let i = 0; i < scene.nodes.length; i++) {
                        if (scene.nodes[i] == node)
                            //scene.nodes.splice(i,1)
                            if (scene.nodes[i].mesh.primitives.length > 1)
                                scene.nodes[i].mesh.primitives.shift()

                    }
                    //scene.removeChild(node)
                }

                const diffa = vec3.sub(vec3.create(), aBox.max, playerBox.min);
                const diffb = vec3.sub(vec3.create(), playerBox.max, aBox.min);

                let minDiff = Infinity;
                let minDirection = [0, 0, 0];
                if (diffa[0] >= 0 && diffa[0] < minDiff) {
                    minDiff = diffa[0];
                    minDirection = [minDiff, 0, 0];
                }
                if (diffa[1] >= 0 && diffa[1] < minDiff) {
                    minDiff = diffa[1];
                    minDirection = [0, minDiff, 0];
                }
                if (diffa[2] >= 0 && diffa[2] < minDiff) {
                    minDiff = diffa[2];
                    minDirection = [0, 0, minDiff];
                }
                if (diffb[0] >= 0 && diffb[0] < minDiff) {
                    minDiff = diffb[0];
                    minDirection = [-minDiff, 0, 0];
                }
                if (diffb[1] >= 0 && diffb[1] < minDiff) {
                    minDiff = diffb[1];
                    minDirection = [0, -minDiff, 0];
                }
                if (diffb[2] >= 0 && diffb[2] < minDiff) {
                    minDiff = diffb[2];
                    minDirection = [0, 0, -minDiff];
                }
                minDirection[1] = 0
                vec3.add(player._translation, player._translation, minDirection);
                //console.log(minDirection)
                //console.log(minDirection)
                //vec3.rotateY(minDirection, minDirection, this.rotation)
                //mat4.translate(player._matrix, player._matrix, minDirection)
                player.updateTransformationMatrix();
            }
        });
    }
}