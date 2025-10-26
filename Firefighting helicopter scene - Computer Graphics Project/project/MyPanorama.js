import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';

export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        
        // Store the scene and texture
        this.scene = scene;
        this.texture = texture;
        
        // Create a sphere with inverted faces for viewing from inside
        // Using large radius (200) for immersive panorama effect
        this.sphere = new MySphere(scene, 200, 30, 30, true);
        
        // Create material with emissive component only (for consistent lighting)
        this.material = new CGFappearance(scene);
        this.material.setAmbient(0, 0, 0, 1);
        this.material.setDiffuse(0, 0, 0, 1);
        this.material.setSpecular(0, 0, 0, 1);
        this.material.setEmission(1, 1, 1, 1);  // Full emission for consistent visibility
        this.material.setTexture(texture);
        this.material.setTextureWrap('REPEAT', 'CLAMP_TO_EDGE');
    }
    
    display() {
        // Save current matrix
        this.scene.pushMatrix();
        
        // Position the panorama sphere at the camera position exactly
        const cameraPos = this.scene.camera.position;
        this.scene.translate(cameraPos[0], cameraPos[1], cameraPos[2]);
        
        // Apply the material with texture
        this.material.apply();
        
        // Disable depth testing to ensure the panorama is always drawn
        // This ensures the sphere is always rendered as the background
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);
        
        // Display the sphere
        this.sphere.display();
        
        // Re-enable depth testing for other objects
        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
        
        // Restore matrix
        this.scene.popMatrix();
    }
}