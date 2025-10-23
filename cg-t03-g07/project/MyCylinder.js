import { CGFobject } from '../lib/CGF.js';

export class MyCylinder extends CGFobject {
    constructor(scene, baseRadius, topRadius, height, slices) {
        super(scene);
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.slices = slices;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const angleStep = 2 * Math.PI / this.slices;

        // Corpo lateral
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            // Base vertex
            this.vertices.push(this.baseRadius * cos, 0, this.baseRadius * sin);
            this.normals.push(cos, 0, sin);
            this.texCoords.push(i / this.slices, 1);

            // Top vertex
            this.vertices.push(this.topRadius * cos, this.height, this.topRadius * sin);
            this.normals.push(cos, 0, sin);
            this.texCoords.push(i / this.slices, 0);
        }

        for (let i = 0; i < this.slices; i++) {
            const base = i * 2;
            this.indices.push(base, base + 1, base + 2);
            this.indices.push(base + 1, base + 3, base + 2);
        }

        // Base inferior
        const baseCenter = this.vertices.length / 3;
        this.vertices.push(0, 0, 0);
        this.normals.push(0, -1, 0);
        this.texCoords.push(0.5, 0.5);
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.baseRadius * Math.cos(angle);
            const z = this.baseRadius * Math.sin(angle);
            this.vertices.push(x, 0, z);
            this.normals.push(0, -1, 0);
            this.texCoords.push(0.5 + x / (2 * this.baseRadius), 0.5 - z / (2 * this.baseRadius));
        }
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(baseCenter, baseCenter + i, baseCenter + i + 1);
        }

        // Base superior
        const topCenter = this.vertices.length / 3;
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.topRadius * Math.cos(angle);
            const z = this.topRadius * Math.sin(angle);
            this.vertices.push(x, this.height, z);
            this.normals.push(0, 1, 0);
            this.texCoords.push(0.5 + x / (2 * this.topRadius), 0.5 - z / (2 * this.topRadius));
        }
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(topCenter, topCenter + i + 1, topCenter + i);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}