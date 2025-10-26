import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyDiamond } from "./MyDiamond.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyTriangleBig } from "./MyTriangleBig.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig2 } from "./MyTriangleBig2.js";
import { MyTriangleSmall2 } from "./MyTriangleSmall2.js";

export class MyTangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(this.scene);
        this.triangle = new MyTriangle(this.scene);
        this.triangleBig = new MyTriangleBig(this.scene);
        this.triangleBig2 = new MyTriangleBig2(this.scene);
        this.triangleSmall = new MyTriangleSmall(this.scene);
        this.triangleSmall2 = new MyTriangleSmall2(this.scene);
        this.parallelogram = new MyParallelogram(this.scene);
        this.initMaterial();
    }

    initMaterial() {
        // Material Verde para o Diamond
        this.diamondMat=new CGFappearance(this.scene);
        this.diamondMat.setAmbient(0, 1, 0, 1.0);
        this.diamondMat.setDiffuse(0, 1, 0, 1.0);
        this.diamondMat.setSpecular(1, 1, 1, 1.0);
        this.diamondMat.setShininess(50.0);

        // Material Roxo para o Small Triangle
        this.trianglePurpleMat=new CGFappearance(this.scene);
        this.trianglePurpleMat.setAmbient(0.5, 0, 0.5, 1.0);
        this.trianglePurpleMat.setDiffuse(0.5, 0, 0.5, 1.0);
        this.trianglePurpleMat.setSpecular(1, 1, 1, 1.0);
        this.trianglePurpleMat.setShininess(50.0);

        // Material Vermelho para o Small Triangle
        this.triangleRedMat=new CGFappearance(this.scene);
        this.triangleRedMat.setAmbient(1, 0, 0, 1.0);
        this.triangleRedMat.setDiffuse(1, 0, 0, 1.0);
        this.triangleRedMat.setSpecular(1, 1, 1, 1.0);
        this.triangleRedMat.setShininess(50.0);

        // Material Laranja para o Big Triangle
        this.triangleOrangeMat=new CGFappearance(this.scene);
        this.triangleOrangeMat.setAmbient(1, 0.5, 0, 1.0);
        this.triangleOrangeMat.setDiffuse(1, 0.5, 0, 1.0);
        this.triangleOrangeMat.setSpecular(1, 1, 1, 1.0);
        this.triangleOrangeMat.setShininess(50.0);

        // Material Rosa para o Triangle
        this.trianglePinkMat=new CGFappearance(this.scene);
        this.trianglePinkMat.setAmbient(1, 0.4, 0.75, 1.0);
        this.trianglePinkMat.setDiffuse(1, 0.4, 0.75, 1.0);
        this.trianglePinkMat.setSpecular(1, 1, 1, 1.0);
        this.trianglePinkMat.setShininess(50.0);

        // Material Azul para o Big Triangle
        this.triangleBlueMat=new CGFappearance(this.scene);
        this.triangleBlueMat.setAmbient(0.0, 0.5, 1.0, 1.0);
        this.triangleBlueMat.setDiffuse(0.0, 0.5, 1.0, 1.0);
        this.triangleBlueMat.setSpecular(1, 1, 1, 1.0);
        this.triangleBlueMat.setShininess(50.0);

        // Material Amarelo para o Parallelogram
        this.parallelogramMat=new CGFappearance(this.scene);
        this.parallelogramMat.setAmbient(1, 1, 0, 1.0);
        this.parallelogramMat.setDiffuse(1, 1, 0, 1.0);
        this.parallelogramMat.setSpecular(1, 1, 1, 1.0);
        this.parallelogramMat.setShininess(50.0);

        // Tangram texture
        this.texture = new CGFappearance(this.scene);
        this.texture.setAmbient(0.1, 0.1, 0.1, 1);
        this.texture.setDiffuse(0.9, 0.9, 0.9, 1);
        this.texture.setSpecular(0.1, 0.1, 0.1, 1);
        this.texture.setShininess(10.0);
        this.texture.loadTexture('images/tangram.png');
    }

    display() {
        // Green Diamond
        this.scene.pushMatrix();
        this.scene.translate(-3.5, 1.2, 0);
        //this.scene.setDiffuse(0, 1, 0, 1);
        this.diamondMat.apply();
        //this.scene.customMaterial.apply();
        this.texture.apply();
        this.diamond.display();
        this.scene.popMatrix();

        // Purple Small Triangle
        this.scene.pushMatrix();
        this.scene.translate(-2.5, 2.2, 0);
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        //this.scene.setDiffuse(1.5, 0, 1.5, 1);
        this.trianglePurpleMat.apply();
        this.texture.apply();
        this.triangleSmall.display();
        this.scene.popMatrix();

        // Red Small Triangle
        this.scene.pushMatrix();
        this.scene.translate(-4.5, 2.2, 0);
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        //this.scene.setDiffuse(1, 0, 0, 1);
        this.triangleRedMat.apply();
        this.texture.apply();
        this.triangleSmall2.display();
        this.scene.popMatrix();

        // Orange Big Triangle
        this.scene.pushMatrix();
        this.scene.translate(-2.9, -1.2, 0);
        //this.scene.setDiffuse(1, 0.5, 0, 1);
        this.triangleOrangeMat.apply();
        this.texture.apply();
        this.triangleBig.display();
        this.scene.popMatrix();

        // Pink Triangle
        this.scene.pushMatrix();
        this.scene.translate(-0.7, 0, 0);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);
        //this.scene.setDiffuse(1, 0.6, 0.8, 1);
        this.trianglePinkMat.apply();
        this.texture.apply();
        this.triangle.display();
        this.scene.popMatrix();

        // Blue Big Triangle
        this.scene.pushMatrix();
        this.scene.translate(0.7, -2, 0);
        //this.scene.setDiffuse(0, 0, 1, 1);
        this.triangleBlueMat.apply();
        this.texture.apply();
        this.triangleBig2.display();
        this.scene.popMatrix();

        // Yellow Parallelogram
        this.scene.pushMatrix();
        this.scene.translate(5.1, -2.4, 0);
        this.scene.scale(-1, 1, 1);
        //this.scene.setDiffuse(1.5, 1.5, 0, 1);
        this.parallelogramMat.apply();
        this.texture.apply();
        this.parallelogram.display();
        this.scene.popMatrix();
    }
}