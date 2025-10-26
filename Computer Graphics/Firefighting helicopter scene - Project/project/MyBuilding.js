import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js"; 
import { MyWindow } from "./MyWindow.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyShaderHeliport } from "./MyShaderHeliport.js";
import { MyShaderLight } from "./MyShaderLight.js";

export class MyBuilding extends CGFobject {
    constructor(scene, totalWidth = 12, floors = 3, windowsPerFloor = 3, windowTexture = "images/window1.2.png", color = [0.6, 0.6, 0.6]) {
        super(scene);
        this.totalWidth = totalWidth;
        this.floors = floors;
        this.windowsPerFloor = windowsPerFloor;
        this.color = color;
        this.windowTexture = windowTexture;

        this.floorHeight = 1.5;
        this.depth = 4;

        this.moduleCentralFloors = floors + 1;
        this.moduleWidth = totalWidth / 3;
        this.sideModuleWidth = this.moduleWidth * 0.75;
        this.sideModuleDepth = this.depth * 0.75;

        // Heliport state tracking
        this.heliportState = 'normal'; // 'normal', 'takeoff', 'landing'

        this.initMaterials();
        this.initComponents();
        this.initShaderComponents();
    }

    initMaterials() {
        // Building material - grey
        this.buildingAppearance = new CGFappearance(this.scene);
        this.buildingAppearance.setAmbient(...this.color, 1);
        this.buildingAppearance.setDiffuse(...this.color, 1);
        this.buildingAppearance.setSpecular(0.1, 0.1, 0.1, 1);
        this.buildingAppearance.setShininess(5);

        this.signAppearance = new CGFappearance(this.scene);
        this.signAppearance.setAmbient(1, 1, 1, 1);
        this.signAppearance.setDiffuse(1, 1, 1, 1);
        this.signAppearance.setSpecular(0.3, 0.3, 0.3, 1);
        this.signAppearance.setShininess(10);
    }

    initComponents() {
        this.signTexture = new CGFtexture(this.scene, "images/bombeiros_sign.png");
        this.signAppearance.setTexture(this.signTexture);
        
        this.window = new MyWindow(this.scene, this.windowTexture);
        this.door = new MyWindow(this.scene, this.windowTexture);
        this.sign = new MyPlane(this.scene);
    }

    initShaderComponents() {
        // Initialize shader-based heliport and lights
        this.shaderHeliport = new MyShaderHeliport(this.scene);
        
        // Create four corner lights
        this.cornerLights = [];
        for (let i = 0; i < 4; i++) {
            this.cornerLights.push(new MyShaderLight(this.scene));
        }
    }

    // Method to set heliport state from helicopter
    setHeliportState(state) {
        if (this.heliportState !== state) {
            console.log(`Heliport state changed to: ${state}`);
            this.heliportState = state;
            
            // Update shader components
            this.shaderHeliport.setManeuverState(state);
            this.cornerLights.forEach(light => {
                light.setManeuverState(state);
            });
        }
    }

    // Get building bounds for collision detection
    getBounds() {
        const centerHeight = this.moduleCentralFloors * this.floorHeight;
        return {
            minX: -this.totalWidth / 2,
            maxX: this.totalWidth / 2,
            minY: 0,
            maxY: centerHeight,
            minZ: -this.depth / 2,
            maxZ: this.depth / 2,
            heliportY: centerHeight
        };
    }

    // Check if point is inside building
    isPointInsideBuilding(x, y, z) {
        const bounds = this.getBounds();
        return x >= bounds.minX && x <= bounds.maxX &&
               y >= bounds.minY && y <= bounds.maxY &&
               z >= bounds.minZ && z <= bounds.maxZ;
    }

    update(deltaTime) {
        // Update shader-based components
        this.shaderHeliport.update(deltaTime);
        this.cornerLights.forEach(light => {
            light.update(deltaTime);
        });
    }

    drawModule(width, height, depth) {
        this.scene.pushMatrix();
        this.scene.translate(0, height / 2, 0);
        this.scene.scale(width, height, depth);
        this.buildingAppearance.apply();
        this.scene.unitCube.display();
        this.scene.popMatrix();
    }

    drawShaderCornerLights() {
        const centerHeight = this.moduleCentralFloors * this.floorHeight;
        const heliportHeight = centerHeight + 0.84; //+0.08
        
        // Position lights at the four corners of the heliport
        const lightRadius = 1.8;
        const lightPositions = [
            [-lightRadius, heliportHeight + 0.05, -lightRadius], // Front-left
            [lightRadius, heliportHeight + 0.05, -lightRadius],  // Front-right
            [-lightRadius, heliportHeight + 0.05, lightRadius],  // Back-left
            [lightRadius, heliportHeight + 0.05, lightRadius]    // Back-right
        ];

        lightPositions.forEach((pos, index) => {
            this.scene.pushMatrix();
            this.scene.translate(...pos);
            this.cornerLights[index].display();
            this.scene.popMatrix();
        });
    }

    drawShaderHeliport() {
        const centerHeight = this.moduleCentralFloors * this.floorHeight;

        // Draw shader-based heliport on top of the central module
        this.scene.pushMatrix();
        this.scene.translate(0, centerHeight + 0.76, 0);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(4, 4, 1);
        
        this.shaderHeliport.display();
        this.scene.popMatrix();
    }
    
    display() {
        const centerHeight = this.moduleCentralFloors * this.floorHeight;
        const sideHeight = this.floors * this.floorHeight;

        const centerX = 0;
        const centerZ = 0;

        const centerHalfWidth = this.moduleWidth / 2;
        const sideHalfWidth = this.sideModuleWidth / 2;
        const sideDepthOffset = (this.depth - this.sideModuleDepth) / 2;

        const baseY = (this.moduleCentralFloors * this.floorHeight) / 2 - (this.floors * this.floorHeight) / 2;

        // LEFT MODULE
        this.scene.pushMatrix();
        this.scene.translate(
            centerX - centerHalfWidth - sideHalfWidth,
            baseY,
            sideDepthOffset
        );
        this.drawModule(this.sideModuleWidth, sideHeight, this.sideModuleDepth);
        this.drawWindows(this.sideModuleWidth, sideHeight, this.sideModuleDepth, this.floors, true);
        this.scene.popMatrix();

        // CENTER MODULE
        this.scene.pushMatrix();
        this.scene.translate(centerX, baseY, centerZ);
        this.drawModule(this.moduleWidth, centerHeight, this.depth);
        this.drawWindows(this.moduleWidth, centerHeight, this.depth, this.moduleCentralFloors, false);

        // Door
        this.scene.pushMatrix();
        this.scene.translate(0, this.floorHeight / 2 + 0.2, this.depth / 2 + 0.01);
        this.scene.scale(1, 0.9, 1);
        this.door.display();
        this.scene.popMatrix();

        // Sign
        this.scene.pushMatrix();
        this.signAppearance.apply();
        this.scene.translate(0, this.floorHeight * 1.5, this.depth / 2 + 0.02);
        this.scene.scale(2, 0.6, 1);
        this.sign.display();
        this.scene.popMatrix();

        this.scene.popMatrix();

        // RIGHT MODULE
        this.scene.pushMatrix();
        this.scene.translate(
            centerX + centerHalfWidth + sideHalfWidth,
            baseY,
            sideDepthOffset
        );
        this.drawModule(this.sideModuleWidth, sideHeight, this.sideModuleDepth);
        this.drawWindows(this.sideModuleWidth, sideHeight, this.sideModuleDepth, this.floors, true);
        this.scene.popMatrix();

        // Shader-based Heliport with texture blinking
        this.drawShaderHeliport();

        // Shader-based pulsating corner lights
        this.drawShaderCornerLights();
    }

    drawWindows(width, height, depth, floors, hasGroundFloor = true) {
        const spacingX = width / (this.windowsPerFloor + 1);
        const spacingY = this.floorHeight;
        const offsetY = this.floorHeight / 2;
        const windowSpacing = 0.1;
    
        const startY = hasGroundFloor ? 0 : 2;
        for (let y = startY; y < floors; y++) {
            for (let x = 0; x < this.windowsPerFloor; x++) {
                this.scene.pushMatrix();
                
                const xPos = -width / 2 + (x + 1) * spacingX;
                const adjustedXPos = x === 0 ? xPos + windowSpacing : 
                                   x === this.windowsPerFloor - 1 ? xPos - windowSpacing : xPos;
                
                this.scene.translate(
                    adjustedXPos,
                    y * spacingY + offsetY,
                    depth / 2 + 0.01
                );
                this.scene.scale(0.4 - windowSpacing, 0.4, 5);
                this.window.display();
                this.scene.popMatrix();
            }
        }
    }
}