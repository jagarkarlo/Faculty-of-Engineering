import { CGFobject } from '../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, radius, numSlices, numStacks, inverted = false) {
        super(scene);
        this.radius = radius;
        this.numSlices = numSlices;
        this.numStacks = numStacks;
        this.inverted = inverted;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        // Step angle for slices and stacks
        let stackStep = Math.PI / this.numStacks;
        let sliceStep = 2 * Math.PI / this.numSlices;
        
        // Generate vertices, normals, and texture coordinates
        for (let i = 0; i <= this.numStacks; i++) {
            let stackAngle = -Math.PI / 2 + i * stackStep;
            let sinStack = Math.sin(stackAngle);
            let cosStack = Math.cos(stackAngle);
            
            for (let j = 0; j <= this.numSlices; j++) {
                let sliceAngle = j * sliceStep;
                let sinSlice = Math.sin(sliceAngle);
                let cosSlice = Math.cos(sliceAngle);
                
                // Vertex coordinates
                let x = this.radius * cosStack * cosSlice;
                let y = this.radius * sinStack;  // Y is the central axis
                let z = this.radius * cosStack * sinSlice;
                
                this.vertices.push(x, y, z);
                
                // Normal vector
                let nx = cosStack * cosSlice;
                let ny = sinStack;
                let nz = cosStack * sinSlice;
                
                // Invert normal if needed
                if (this.inverted) {
                    this.normals.push(-nx, -ny, -nz);
                } else {
                    this.normals.push(nx, ny, nz);
                }
                
                // Texture coordinates mapped for equirectangular projection
                // For an equirectangular texture, we map:
                // - longitude (sliceAngle) from 0 to 2π to texture U from 0 to 1
                // - latitude (stackAngle) from -π/2 to π/2 to texture V from 1 to 0
                let u = 1 - (j / this.numSlices);  // Flip U for proper equirectangular mapping
                let v = 1 - (i / this.numStacks);  // Flip V to match equirectangular format
                this.texCoords.push(u, v);
            }
        }
        
        // Generate indices for triangles
        for (let i = 0; i < this.numStacks; i++) {
            for (let j = 0; j < this.numSlices; j++) {
                let first = i * (this.numSlices + 1) + j;
                let second = first + this.numSlices + 1;
                
                if (this.inverted) {
                    // Reversed order (for viewing from inside)
                    this.indices.push(first, first + 1, second);
                    this.indices.push(second, first + 1, second + 1);
                } else {
                    // Standard order (for viewing from outside)
                    this.indices.push(first, second, first + 1);
                    this.indices.push(second, second + 1, first + 1);
                }
            }
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}