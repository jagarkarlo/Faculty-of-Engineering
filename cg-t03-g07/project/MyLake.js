import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyCylinder } from "./MyCylinder.js";

export class MyLake extends CGFobject {
    constructor(scene, radius = 4) {
        super(scene);
        this.radius = radius;
        this.init();
    }

    init() {
        this.surface = new MyCylinder(this.scene, this.radius, this.radius, 0.1, 32);

        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.0, 0.3, 0.5, 1.0);
        this.material.setDiffuse(0.1, 0.4, 0.7, 1.0);
        this.material.setSpecular(0.5, 0.8, 1.0, 1.0);
        this.material.setShininess(100);
        this.material.loadTexture("images/lake_texture.jpg");
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();
        //this.scene.translate(0, 0.05, 0);
        this.material.apply();
        this.surface.display();
        this.scene.popMatrix();
    }
}
