import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyUnitCube } from "./MyUnitCube.js";
import { MyTree } from "./MyTree.js";
import { MyForest } from "./MyForest.js";
import { MyHeli } from "./MyHeli.js";
import { MyFire } from "./MyFire.js";
import { MyLake } from "./MyLake.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    this.lastUpdateTime = 0;
  }
  
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color 
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    
    // GUI settings
    this.showTestSphere = false; // Toggle for test sphere visibility
    this.fov = 75; // Default FOV in degrees (good for panoramas)
    this.speedFactor = 1; // sensibilidade padrão

    this.showBuilding = true;
    this.showForest = true;
    this.showHelicopter = true;
    
    this.initObjects();
    this.setUpdatePeriod(50);
  }
  
  initObjects() {
    try {
      this.ground = new MyPlane(this, 15, 0, 1, 0, 1); // 100 divisões para suavidade
      this.groundTexture = new CGFtexture(this, "images/ground.jpg"); // Adicione uma textura apropriada
      this.groundMaterial = new CGFappearance(this);
      this.groundMaterial.setTexture(this.groundTexture);
      this.groundMaterial.setDiffuse(0.7, 0.8, 0.7, 1.0);
      this.groundMaterial.setSpecular(0.1, 0.1, 0.1, 1);
      this.groundMaterial.setShininess(10);
      // Regular sphere for testing (smaller radius)
      this.testSphere = new MySphere(this, 3, 30, 30, false);
      this.building = new MyBuilding(this, 12, 3, 3, "images/window1.2.png", [0.137, 0.239, 0.196]);
      this.unitCube = new MyUnitCube(this);
      //this.tree = new MyTree(this, 10, "X", 0.4, 6, [0.2, 0.6, 0.2]);
      this.forest = new MyForest(this, 5, 4);
      this.fires = [
        new MyFire(this, -25, -5, 1.2),
        new MyFire(this, -15, 0, 0.2),
        new MyFire(this, -20, 2, 3)
      ];
      this.lake = new MyLake(this, 4);

      // Create helicopter and position it on the heliport
      this.helicopter = new MyHeli(this);
      // Position the helicopter on the heliport (adjust as needed based on your building dimensions)
      if (this.building){
        const centerFloors = this.building.moduleCentralFloors;
        const floorHeight = this.building.floorHeight;
        const heliportY = centerFloors * floorHeight + 0.76;
        this.helicopter.setPosition(-15, heliportY, -15);
      }      

      // Load the panorama texture
      console.log("Loading panorama texture...");
      this.panoramaTexture = new CGFtexture(this, 'images/panorama.jpg');
      console.log("Panorama texture loaded successfully");
      
      // Create the panorama with the loaded texture
      this.panorama = new MyPanorama(this, this.panoramaTexture);
      console.log("Panorama created successfully");
    } catch (error) {
      console.error("Error initializing objects:", error);
    }
  }
  
  // Update camera's field of view
  updateCameraFOV() {
    // Convert degrees to radians
    const fovRadians = this.fov * Math.PI / 180;
    this.camera.fov = fovRadians;
    this.updateProjectionMatrix();
  }
  
  initLights() {
    this.lights[0].setPosition(15, 15, 15, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }
  
  initCameras() {
    // Position camera to see the helicopter on the heliport
    this.camera = new CGFcamera(
      75 * Math.PI / 180, // 75 degrees in radians
      0.1,
      2000,
      vec3.fromValues(-25, 10, -25),  // Position camera to see helicopter
      vec3.fromValues(-15, 6, -15)    // Look at heliport
    );
  }
  
  // Set up GUI elements
  setupGUI(gui) {
    // Add FoV slider for panorama adjustment
    gui.add(this, 'fov', 30, 120).name('Field of View (°)').onChange(() => this.updateCameraFOV());
    gui.add(this, 'speedFactor', 0.1, 3).name('Speed Factor');
    
    // Add test sphere toggle
    gui.add(this, 'showTestSphere').name('Show Test Sphere');
    gui.add(this, 'showBuilding').name('Show Building');
    gui.add(this, 'showForest').name('Show Forest');
    gui.add(this, 'showHelicopter').name('Show Helicopter');
    
    // Add Helicopter controls folder
    const heliFolder = gui.addFolder('Helicopter Status');
    heliFolder.add(this.helicopter, 'isFlying').name('Is Flying').listen();
    heliFolder.add(this.helicopter, 'bucketDeployed').name('Bucket Deployed').listen();
    heliFolder.add(this.helicopter, 'bucketFull').name('Bucket Full').listen();
    heliFolder.add(this.helicopter, 'speed').name('Current Speed').listen().step(0.1);
    
    // Add manual control buttons
    const controlsFolder = heliFolder.addFolder('Manual Controls');
    controlsFolder.add({ takeOff: () => this.helicopter.takeOff() }, 'takeOff').name('Take Off');
    controlsFolder.add({ land: () => this.helicopter.land() }, 'land').name('Land');
    controlsFolder.add({ reset: () => this.helicopter.reset() }, 'reset').name('Reset');
    controlsFolder.add({ dropWater: () => this.helicopter.dropWater() }, 'dropWater').name('Drop Water');
    
    // Add heliport state testing buttons
    const heliportFolder = gui.addFolder('Heliport Testing');
    heliportFolder.add({ normal: () => this.building.setHeliportState('normal') }, 'normal').name('Normal State');
    heliportFolder.add({ takeoff: () => this.building.setHeliportState('takeoff') }, 'takeoff').name('Takeoff State');
    heliportFolder.add({ landing: () => this.building.setHeliportState('landing') }, 'landing').name('Landing State');
    
    heliFolder.open();
  }
  
  checkKeys() {
    // Camera movement controls
    const cameraSpeed = 0.5;
    
    // Forward/Backward
    if (this.gui.isKeyPressed("KeyC")) {
      vec3.add(
        this.camera.position,
        this.camera.position,
        vec3.scale(vec3.create(), this.camera.direction, cameraSpeed)
      );
    }
    if (this.gui.isKeyPressed("KeyZ")) {
      vec3.add(
        this.camera.position,
        this.camera.position,
        vec3.scale(vec3.create(), this.camera.direction, -cameraSpeed)
      );
    }

    if (!this.helicopter) return;

    const factor = this.speedFactor || 1;
    
    // Helicopter controls - only if helicopter exists
    if (this.helicopter) {
      // Take off / land with heliport signaling
      if (this.gui.isKeyPressed("KeyP")) {
        if (!this.helicopter.isFlying) {
          this.building.setHeliportState('takeoff');
          this.helicopter.takeOff();
          // Reset heliport state after takeoff animation
          setTimeout(() => {
            this.building.setHeliportState('normal');
          }, 3000); // 3 seconds
        }
      }


      if (this.gui.isKeyPressed("KeyL")) {
        if (this.helicopter.isFlying) {
          this.building.setHeliportState('landing');
          this.helicopter.land();
          // Reset heliport state after landing
          setTimeout(() => {
            this.building.setHeliportState('normal');
          }, 3000); // 3 seconds
        }
      }

      if (this.gui.isKeyPressed("KeyR")) {
        this.helicopter.reset();
        this.building.setHeliportState('normal'); // Reset heliport state too
      }

      // Drop water
      if (this.gui.isKeyPressed("KeyO")) {
        this.helicopter.dropWater();
      }

      const isHeliRestingOnHeliport = 
      this.helicopter && 
      !this.helicopter.isFlying && 
      this.helicopter.isOverHeliport() && 
      Math.abs(this.helicopter.speed) < 0.01;

      const isHeliInSpecialState = this.helicopter && 
      (this.helicopter.landingOnLake || this.helicopter.takeOffLake || 
       this.helicopter.isLandingToHeliport || this.helicopter.takeoffFromHeliport);
      if (isHeliInSpecialState || isHeliRestingOnHeliport) return;
        
      // Movimento
      if (this.gui.isKeyPressed("KeyW")) {
        this.helicopter.accelerate(0.01 * factor);
        this.helicopter.pitch = -0.1; // inclinação para a frente
      } else if (this.gui.isKeyPressed("KeyS")) {
        this.helicopter.accelerate(-0.01 * factor);
        this.helicopter.pitch = 0.1;  // inclinação para trás
      } else {
        this.helicopter.pitch = 0;    // sem inclinação
      }

    
      // Left/Right
      if (this.gui.isKeyPressed("KeyA")) {
        this.helicopter.turn(0.07 * factor);
      }
      if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(-0.07 * factor);
      }
        
      // Movement
   /*   if (this.gui.isKeyPressed("ArrowLeft")) {
        this.helicopter.moveForward();
      }
      if (this.gui.isKeyPressed("ArrowRight")) {
        this.helicopter.moveBackward();
      }
      if (this.gui.isKeyPressed("ArrowUp")) {
        this.helicopter.ascend();
      }
      if (this.gui.isKeyPressed("ArrowDown")) {
        this.helicopter.descend();
      }*/

      /*// Bucket controls
      if (this.gui.isKeyPressed("KeyB")) {
        // Toggle bucket only on key press (not hold)
        if (!this.bKeyPressed) {
          this.helicopter.toggleBucket();
          this.bKeyPressed = true;
        }
      } else {
        this.bKeyPressed = false;
      }*/
      
      /*// Fill bucket
      if (this.gui.isKeyPressed("KeyF")) {
        this.helicopter.fillBucket();
      }*/
      
    }
  }

  update(t) {
    // Calculate delta time in milliseconds
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = t;
    }
    const deltaTime = t - this.lastUpdateTime;
    this.lastUpdateTime = t;
    
    // Update helicopter animations
    if (this.helicopter) {
      this.helicopter.update(deltaTime);
    }
    
    // Update building animations (heliport signaling)
    if (this.building) {
      this.building.update(deltaTime);
    }
    
    this.checkKeys();
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.2, 0.2, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.3, 0.3, 0.3, 1.0);
    this.setShininess(10.0);
  }
  
  display() {
    // Clear buffers
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Initialize Model-View matrix
    this.updateProjectionMatrix();
    this.loadIdentity();
    
    // Apply view matrix
    this.applyViewMatrix();
    
    // Draw axis
    this.axis.display();

    this.setDefaultAppearance();
    
    try {
      // Draw panorama (if created successfully)
      if (this.panorama) {
        this.panorama.display();
      }

      if (this.ground){
        // Draw ground (base de tudo)
        this.pushMatrix();
        this.translate(-25, 0, 0); // Posiciona 1 unidade abaixo da origem (y = -1)
        this.scale(50, 50, 50);  // Escala para cobrir toda a cena
        this.rotate(-Math.PI/2, 1, 0, 0); // Rotaciona para ficar horizontal
        this.groundMaterial.apply();
        this.ground.display();
        this.popMatrix();
      }

      if (this.showBuilding) { 
        // Draw building with heliport
        this.pushMatrix();
        this.translate(-15, -0.8, -15); // canto da cena
        this.building.display();
        this.popMatrix();
      }

      // Draw helicopter
      if (this.showHelicopter && this.helicopter) {
        this.helicopter.display();
      }

      if (this.showForest){
        // Draw forest
        this.pushMatrix();
        this.translate(-20, -0.2, 1);
        this.forest.display();
        this.popMatrix();
      }

      if (this.fires) {
        for (const fire of this.fires) {
          this.pushMatrix();
          this.translate(0,0,0); //lado, cima, tras 
          fire.display();
          this.popMatrix();
        }
      }

      if (this.lake) {
        this.pushMatrix();
        this.translate(-5, 0, -5);
        this.lake.display();
        this.popMatrix();
      }

      // Draw test sphere at a distance from the origin only if toggle is on
      if (this.testSphere && this.showTestSphere) {
        this.pushMatrix();
        this.translate(10, 0, 0);
        this.testSphere.display();
        this.popMatrix();
      }
    } catch (error) {
      console.error("Error in display:", error);
    }
  }
}