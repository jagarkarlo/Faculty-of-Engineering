import { CGFobject } from '../lib/CGF.js';

export class MyPrism extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    // Helper function to calculate normal
    calculateNormal(x, y) {
        const magnitude = Math.sqrt(x * x + y * y);
        return [x / magnitude, y / magnitude, 0];
    }

    // Helper function to calculate vertices for each stack
    calculateVertices(i, j, angleStep, heightStep) {
        const angle = i * angleStep;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const z = j * heightStep;
        return { x, y, z };
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        let idx = 0;
        const angleStep = (2 * Math.PI) / this.slices;
        const heightStep = 1 / this.stacks;

        for (let i = 0; i < this.slices; i++) {
            const angleStart = i * angleStep;
            const angleEnd = (i + 1) * angleStep;

            // Calculate position and normal for the slice
            const x1 = Math.cos(angleStart);
            const y1 = Math.sin(angleStart);
            const x2 = Math.cos(angleEnd);
            const y2 = Math.sin(angleEnd);
            const normal = this.calculateNormal((x1 + x2) / 2, (y1 + y2) / 2); // Adjusted normal calculation

            for (let j = 0; j < this.stacks; j++) {
                const z1 = j * heightStep;
                const z2 = (j + 1) * heightStep;

                this.vertices.push(x1, y1, z1, x2, y2, z1, x1, y1, z2, x2, y2, z2);
                this.normals.push(...normal, ...normal, ...normal, ...normal);

                this.indices.push(
                    idx + 2, idx, idx + 1,
                    idx + 1, idx + 3, idx + 2
                );
                idx += 4;
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers() {
    }
}
