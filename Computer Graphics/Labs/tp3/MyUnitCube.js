import {CGFobject} from '../lib/CGF.js';

export class MyUnitCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            -0.5, -0.5, -0.5, //0
            -0.5, -0.5, 0.5,  //1
            -0.5, 0.5, -0.5,  //2
            -0.5, 0.5, 0.5,   //3
            0.5, -0.5, -0.5,  //4
            0.5, -0.5, 0.5,   //5
            0.5, 0.5, -0.5,   //6
            0.5, 0.5, 0.5,    //7
            -0.5, -0.5, -0.5, //0
            -0.5, -0.5, 0.5,  //1
            -0.5, 0.5, -0.5,  //2
            -0.5, 0.5, 0.5,   //3
            0.5, -0.5, -0.5,  //4
            0.5, -0.5, 0.5,   //5
            0.5, 0.5, -0.5,   //6
            0.5, 0.5, 0.5,    //7
            -0.5, -0.5, -0.5, //0
            -0.5, -0.5, 0.5,  //1
            -0.5, 0.5, -0.5,  //2
            -0.5, 0.5, 0.5,   //3
            0.5, -0.5, -0.5,  //4
            0.5, -0.5, 0.5,   //5
            0.5, 0.5, -0.5,   //6
            0.5, 0.5, 0.5     //7
        ];

		this.normals = [
            0, 0, -1,			//0
            0, 0, 1,			//1
            0, 0, -1,			//2
            0, 0, 1,            //3
            0, 0, -1,			//4
            0, 0, 1,			//5
            0, 0, -1,			//6
            0, 0, 1,			//7
            0, -1, 0,			//0
            0, -1, 0,			//1
            0, 1, 0,			//2
            0, 1, 0,			//3
            0, -1, 0,			//4
            0, -1, 0,			//5
            0, 1, 0,			//6
            0, 1, 0,			//7
            -1, 0, 0,			//0
            -1, 0, 0,			//1
            -1, 0, 0,			//2
            -1, 0, 0,			//3
            1, 0, 0,			//4
            1, 0, 0,			//5
            1, 0, 0,			//6
            1, 0, 0				//7
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
                //Face frontal
                0, 1, 2,
                1, 3, 2,

                //Face traseira
                4, 6, 5,
                5, 6, 7,

                //Face esquerda
                0, 2, 4,
                4, 2, 6,

                //Face direita
                1, 5, 3,
                5, 7, 3,

                //Face superior
                2, 3, 6,
                3, 7, 6,

                //Face inferior
                0, 4, 1,
                1, 4, 5
        ];

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

