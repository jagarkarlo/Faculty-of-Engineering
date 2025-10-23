import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            -1, 1, 0,    //0
            -1, -1, 0,   //1
            1, -1, 0,    //2
            -1, 1, 0,    //3 (mesmo que 0)
            1, -1, 0,    //4 (mesmo que 2)
            -1, -1, 0    //5 (mesmo que 1)
        ];
    
        this.indices = [
            0, 1, 2,  // frente
            3, 4, 5   // verso (inverso)
        ];
    
        this.normals = [
            0, 0, 1,   // frente
            0, 0, 1,
            0, 0, 1,
            0, 0, -1,  // verso
            0, 0, -1,
            0, 0, -1
        ];
    
        this.texCoords = [
            0, 0,
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            0, 1
        ];

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

