import { CGFobject } from '../lib/CGF.js';

export class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        
        const stepAngle = (2 * Math.PI) / this.slices;
        const stepHeight = 1 / this.stacks;

        for (let i = 0; i <= this.slices; i++) {
            const angle = i * stepAngle;
            const nx = Math.cos(angle);
            const ny = Math.sin(angle);

            for (let j = 0; j <= this.stacks; j++) {
                const z = j * stepHeight;
                this.vertices.push(nx, ny, z);
                this.normals.push(nx, ny, 0);
            }
        }

        for (let i = 0; i < this.slices; i++) {
            for (let j = 0; j < this.stacks; j++) {
                let a = i * (this.stacks + 1) + j;
                let b = a + 1;
                let c = (i + 1) * (this.stacks + 1) + j;
                let d = c + 1;

                this.indices.push(a, c, d, a, d, b);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
    }
}