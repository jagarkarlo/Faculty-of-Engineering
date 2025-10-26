import { CGFobject } from "../lib/CGF.js";
import { MyTree } from "./MyTree.js";

export class MyForest extends CGFobject {
    constructor(scene, rows, cols, areaWidth = 20, areaDepth = 20) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.trees = [];

        this.initForest();
    }

    initForest() {
        const cellWidth = this.areaWidth / this.cols;
        const cellDepth = this.areaDepth / this.rows;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // Aleatoriedade nos parâmetros
                const rotDeg = Math.random() * 10 - 5; // -5º a +5º
                const axis = Math.random() < 0.5 ? "X" : "Z";
                const trunkRadius = 0.3 + Math.random() * 0.2; // 0.3 a 0.5
                const height = 4 + Math.random() * 3; // 4 a 7
                const green = 0.4 + Math.random() * 0.4; // verde variável

                const offsetX = (Math.random() - 0.5) * 0.4; // ligeiro desvio
                const offsetZ = (Math.random() - 0.5) * 0.4;

                const x = -this.areaWidth / 2 + j * cellWidth + cellWidth / 2 + offsetX;
                const z = -this.areaDepth / 2 + i * cellDepth + cellDepth / 2 + offsetZ;

                const tree = new MyTree(
                    this.scene,
                    rotDeg,
                    axis,
                    trunkRadius,
                    height,
                    [0.1, green, 0.1],
                    "images/trunk.jpg",
                    "images/leaves.jpg"
                );

                this.trees.push({ tree, x, z });
            }
        }
    }

    display() {
        for (const { tree, x, z } of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(x, 0, z);
            tree.display();
            this.scene.popMatrix();
        }
    }
}