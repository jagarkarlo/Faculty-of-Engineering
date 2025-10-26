import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyWindow extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();

		this.windowAppearance = new CGFappearance(scene);
		this.windowAppearance.setAmbient(0.7, 0.7, 0.7, 1);
		this.windowAppearance.setDiffuse(0.8, 0.8, 0.8, 1);
		this.windowAppearance.setSpecular(0, 0, 0, 1);
		this.windowAppearance.setShininess(10.0);
		this.windowAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
		this.windowAppearance.setTexture(new CGFtexture(scene, "images/window1.2.png"));
	}
	
    initBuffers() {
        this.vertices = [
            -1, -1, 0,   // 0
             1, -1, 0,   // 1
            -1,  1, 0,   // 2
             1,  1, 0,   // 3
        ];
    
        this.indices = [
            0, 1, 2,    // frente
            1, 3, 2,
    
            2, 3, 0,    // verso (inverter a ordem)
            3, 1, 0
        ];
    
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];
    
        this.texCoords = [
            0, 1,
            1, 1,
            0, 0,
            1, 0
        ];
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }    

	display() {
	this.scene.pushMatrix();
	this.windowAppearance.apply();
	super.display();
	this.scene.popMatrix();
}

}
