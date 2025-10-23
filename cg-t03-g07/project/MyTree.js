import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyCylinder } from "./MyCylinder.js";
import { MyPyramid } from "./MyPyramid.js";

export class MyTree extends CGFobject {
    constructor(scene, rotationDeg, rotationAxis, trunkRadius, treeHeight, foliageColor, trunkTexture, foliageTexture) {
        super(scene);
        this.rotationDeg = rotationDeg;
        this.rotationAxis = rotationAxis.toUpperCase();
        this.trunkRadius = trunkRadius;
        this.treeHeight = treeHeight;
        this.foliageColor = foliageColor;

        this.trunkHeight = treeHeight * 0.2;
        this.foliageHeight = treeHeight * 0.8;

        this.numLayers = Math.max(2, Math.round(this.foliageHeight / 1)); // ex: 5 camadas
        this.initMaterials(trunkTexture, foliageTexture);
        this.initObjects();
    }

    initMaterials(trunkTex, foliageTex) {
        this.trunkMaterial = new CGFappearance(this.scene);
        this.trunkMaterial.setAmbient(0.4, 0.25, 0.1, 1);
        this.trunkMaterial.setDiffuse(0.4, 0.25, 0.1, 1);
        this.trunkMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.trunkMaterial.setShininess(5);
        if (trunkTex) this.trunkMaterial.setTexture(new CGFtexture(this.scene, trunkTex));

        this.foliageMaterial = new CGFappearance(this.scene);
        const [r, g, b] = this.foliageColor;
        this.foliageMaterial.setAmbient(r, g, b, 1);
        this.foliageMaterial.setDiffuse(r, g, b, 1);
        this.foliageMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.foliageMaterial.setShininess(5);
        if (foliageTex) this.foliageMaterial.setTexture(new CGFtexture(this.scene, foliageTex));
    }

    initObjects() {
        this.trunk = new MyCylinder(this.scene, this.trunkRadius, 0.8 * this.trunkRadius, this.trunkHeight, 20);
        this.foliageLayers = [];
        const baseRadius = this.trunkRadius * 2.5;
        const step = this.foliageHeight / this.numLayers;

        for (let i = 0; i < this.numLayers; i++) {
            const radius = baseRadius * (1 - i / this.numLayers);
            const height = step;
            this.foliageLayers.push({
                pyramid: new MyPyramid(this.scene, radius, height, 4),
                height,
                radius
            });
        }
    }

    display() {
        this.scene.pushMatrix();

        // Inclinação
        const angleRad = this.rotationDeg * Math.PI / 180;
        if (this.rotationAxis === 'X') {
            this.scene.rotate(angleRad, 1, 0, 0);
        } else if (this.rotationAxis === 'Z') {
            this.scene.rotate(angleRad, 0, 0, 1);
        }

        // Tronco
        this.trunkMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, this.trunkHeight / 4, 0);
        this.trunk.display();
        this.scene.popMatrix();

        // Copas
        this.foliageMaterial.apply();
        let y = this.trunkHeight;
        for (const layer of this.foliageLayers) {
            this.scene.pushMatrix();
            this.scene.translate(0, y, 0);
            layer.pyramid.display();
            this.scene.popMatrix();
            y += layer.height * 0.7; // overlap das pirâmides
        }

        this.scene.popMatrix();
    }
}
