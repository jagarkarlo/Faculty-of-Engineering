import { CGFobject } from '../lib/CGF.js';
import { MyDiamond } from "./MyDiamond.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyTriangleBig } from "./MyTriangleBig.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";

export class MyTangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(this.scene);
        this.triangle = new MyTriangle(this.scene);
        this.triangleBig = new MyTriangleBig(this.scene);
        this.triangleSmall = new MyTriangleSmall(this.scene);
        this.parallelogram = new MyParallelogram(this.scene);
    }

    display() {
        // Green Diamond
        this.scene.pushMatrix();
        this.scene.translate(-3.5, 1.2, 0);
        this.scene.setDiffuse(0, 1, 0, 1);
        this.diamond.display();
        this.scene.popMatrix();

        // Purple Small Triangle
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 2.2, 0);
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        this.scene.setDiffuse(1.5, 0, 1.5, 1);
        this.triangleSmall.display();
        this.scene.popMatrix();

        // Red Small Triangle
        this.scene.pushMatrix();
        this.scene.translate(-4.5, 2.2, 0);
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        this.scene.setDiffuse(1, 0, 0, 1);
        this.triangleSmall.display();
        this.scene.popMatrix();

        // Orange Big Triangle
        this.scene.pushMatrix();
        this.scene.translate(-2.9, -1.2, 0);
        this.scene.setDiffuse(1, 0.5, 0, 1);
        this.triangleBig.display();
        this.scene.popMatrix();

        // Pink Triangle
        this.scene.pushMatrix();
        this.scene.translate(-0.7, 0, 0);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);
        this.scene.setDiffuse(1, 0.6, 0.8, 1);
        this.triangle.display();
        this.scene.popMatrix();

        // Blue Big Triangle
        this.scene.pushMatrix();
        this.scene.translate(0.7, -2, 0);
        this.scene.setDiffuse(0, 0, 1, 1);
        this.triangleBig.display();
        this.scene.popMatrix();

        // Yellow Parallelogram
        this.scene.pushMatrix();
        this.scene.translate(5.1, -2.4, 0);
        this.scene.scale(-1, 1, 1);
        this.scene.setDiffuse(1.5, 1.5, 0, 1);
        this.parallelogram.display();
        this.scene.popMatrix();
    }
}