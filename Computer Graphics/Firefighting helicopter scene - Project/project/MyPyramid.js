import { CGFobject } from '../lib/CGF.js';

export class MyPyramid extends CGFobject {
    constructor(scene, baseRadius, height, sides = 4) {
        super(scene);
        this.baseRadius = baseRadius;
        this.height = height;
        this.sides = sides;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const angleStep = 2 * Math.PI / this.sides;

        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0);

        for (let i = 0; i <= this.sides; i++) {
            const angle = i * angleStep;
            const x = this.baseRadius * Math.cos(angle);
            const z = this.baseRadius * Math.sin(angle);
            this.vertices.push(x, 0, z);
            this.normals.push(x, this.height / 2, z);
            this.texCoords.push((Math.cos(angle) + 1) / 2, (Math.sin(angle) + 1) / 2);
        }

        for (let i = 1; i <= this.sides; i++) {
            this.indices.push(0, i, i + 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display() {
        this.scene.pushMatrix();
        this.scene.gl.disable(this.scene.gl.CULL_FACE); // desativa face culling
        super.display();
        this.scene.gl.enable(this.scene.gl.CULL_FACE);  // reativa
        this.scene.popMatrix();
    }
}