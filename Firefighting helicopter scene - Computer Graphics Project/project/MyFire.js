import { CGFobject, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyTriangle } from "./MyTriangle.js";

export class MyFire extends CGFobject {
    constructor(scene, x, z, scale = 1) {
        super(scene);
        this.x = x;
        this.z = z;
        this.y = 0;
        this.scale = scale;
        this.active = true;
        
        // Initialize shaders
        this.initShaders();
        this.initComponents();
    }

    initShaders() {
        this.fireShader = new CGFshader(this.scene.gl, 
            "shaders/fire.vert", 
            "shaders/fire.frag");
            
        // Set texture uniform
        this.fireShader.setUniformsValues({
            uSampler: 0
        });
    }

    initComponents() {
        this.triangles = [];
        for (let i = 0; i < 6; i++) {
            this.triangles.push(new MyTriangle(this.scene));
        }

        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(1.0, 0.4, 0.0, 1.0);
        this.material.setDiffuse(1.0, 0.5, 0.0, 1.0);
        this.material.setSpecular(1.0, 0.6, 0.2, 1.0);
        this.material.setShininess(20);
        this.material.loadTexture("images/fire_texture.jpg");
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }

    extinguish() {
        this.active = false;
    }

    display() {
        if (!this.active) return;
            
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.material.apply();
    
        // Activate fire shader
        this.scene.setActiveShader(this.fireShader);
        
        // Update shader time uniform
        const now = Date.now() * 0.001; // Convert to seconds
        this.fireShader.setUniformsValues({
            uTime: now
        });

        for (let i = 0; i < this.triangles.length; i++) {
            this.scene.pushMatrix();
            const angle = (2 * Math.PI * i) / this.triangles.length;
            const flameHeight = 2 + 0.5 * Math.abs(Math.sin(i + now * 2.0)); // Sync with shader time
            
            // Set per-flame uniform
            this.fireShader.setUniformsValues({
                uFlameIndex: i
            });
            
            this.scene.rotate(angle, 0, 1, 0);
            this.scene.translate(0.35, flameHeight / 2, 0);
            this.scene.scale(0.3, 2*flameHeight/3, this.scale);
            this.triangles[i].display();
            this.scene.popMatrix();
        }
    
        // Restore default shader
        this.scene.setActiveShader(this.scene.defaultShader);
        
        this.scene.popMatrix();
    }
}