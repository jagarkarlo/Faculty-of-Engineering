import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";
import { MyCylinder } from "./MyCylinder.js";

export class MyHeli extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;

        // Dimensions
        this.bodyLength = 4;
        this.bodyRadius = 0.7;
        this.tailLength = 3;
        this.tailRadius = 0.2;
        this.mainRotorLength = 3.5;
        this.tailRotorLength = 1;
        this.cruiseAltitude =  this.scene.building.moduleCentralFloors * this.scene.building.floorHeight + 0.76 + 7;

        // Animation
        this.position = [0, 0, 0];
        this.rotation = 0;
        this.pitch = 0;
        this.velocity = [0, 0, 0];
        this.speed = 0;
        this.mainRotorAngle = 0;
        this.tailRotorAngle = 0;
        this.isFlying = false;
        this.landingGearDeployed = true;

        // Bucket
        this.bucketDeployed = false;
        this.bucketHeight = 1;
        this.bucketRadius = 0.5;
        this.bucketRopeLength = 3;
        this.bucketFull = false;

        // Maneuver states for heliport coordination
        this.isTakingOff = false;
        this.isLanding = false;
        this.isLandingToHeliport = false;
        this.takeoffFromHeliport = false;
        this.takeoffTimer = 0;
        this.landingTimer = 0;
        this.takeoffDuration = 3000; // 3 seconds
        this.landingDuration = 3000; // 3 seconds

        // Water animation properties - FIXED
        this.waterDroplets = [];
        this.isDropping = false;
        this.dropTimer = 0;
        this.dropDuration = 2000; // 2 seconds for water drop animation
        this.maxDroplets = 30;
        this.dropletCreationRate = 50; // Create droplets every 50ms
        this.targetAltitude = 0;

        this.initMaterials();
        this.initParts();
    }

    initMaterials() {
        this.bodyMaterial = new CGFappearance(this.scene);
        this.bodyMaterial.setAmbient(0.6, 0.1, 0.1, 1); 
        this.bodyMaterial.setDiffuse(0.9, 0.2, 0.2, 1);
        this.bodyMaterial.setSpecular(1, 1, 1, 1);    
        this.bodyMaterial.setShininess(100);           
        this.bodyMaterial.loadTexture("images/helicopter_body.jpg");

        this.glassMaterial = new CGFappearance(this.scene);
        this.glassMaterial.setAmbient(0.1, 0.1, 0.3, 0.8);
        this.glassMaterial.setDiffuse(0.1, 0.1, 0.3, 0.8);
        this.glassMaterial.setSpecular(0.9, 0.9, 1, 1);
        this.glassMaterial.setShininess(300);

        this.rotorMaterial = new CGFappearance(this.scene);
        this.rotorMaterial.setAmbient(0.2, 0.2, 0.2, 1);
        this.rotorMaterial.setDiffuse(0.2, 0.2, 0.2, 1);
        this.rotorMaterial.setSpecular(0.5, 0.5, 0.5, 1);
        this.rotorMaterial.setShininess(50);
        this.rotorMaterial.loadTexture("images/metal.jpg");

        this.landingGearMaterial = new CGFappearance(this.scene);
        this.landingGearMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.landingGearMaterial.setDiffuse(0.3, 0.3, 0.3, 1);
        this.landingGearMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.landingGearMaterial.setShininess(20);
        this.landingGearMaterial.loadTexture("images/skid_texture.jpg");

        this.bucketMaterial = new CGFappearance(this.scene);
        this.bucketMaterial.setAmbient(0.1, 0.1, 0.3, 1);
        this.bucketMaterial.setDiffuse(0.1, 0.1, 0.7, 1);
        this.bucketMaterial.setSpecular(0.5, 0.5, 0.8, 1);
        this.bucketMaterial.setShininess(80);
        this.bucketMaterial.loadTexture("images/bucket_texture.png");

        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0, 0.2, 0.4, 0.8);
        this.waterMaterial.setDiffuse(0, 0.4, 0.8, 0.8);
        this.waterMaterial.setSpecular(0.5, 0.8, 1, 0.8);
        this.waterMaterial.setShininess(20);

        // Water droplet material - ENHANCED
        this.dropletMaterial = new CGFappearance(this.scene);
        this.dropletMaterial.setAmbient(0.1, 0.4, 0.7, 0.8);
        this.dropletMaterial.setDiffuse(0.3, 0.6, 0.9, 0.8);
        this.dropletMaterial.setSpecular(0.8, 0.9, 1, 0.8);
        this.dropletMaterial.setShininess(200);

        this.ropeMaterial = new CGFappearance(this.scene);
        this.ropeMaterial.setAmbient(0.6, 0.5, 0.4, 1);
        this.ropeMaterial.setDiffuse(0.6, 0.5, 0.4, 1);
        this.ropeMaterial.setSpecular(0.1, 0.1, 0.1, 1);
        this.ropeMaterial.setShininess(5);
    }

    initParts() {
        this.body = new MySphere(this.scene, this.bodyRadius, 20, 20);
        this.cabin = new MySphere(this.scene, this.bodyRadius, 20, 20); // Fixed: was using undefined cabinRadius
        this.tailBoom = new MyCylinder(this.scene, this.tailRadius, this.tailRadius * 0.7, this.tailLength, 10);
        this.rotorBlade = new MyCylinder(this.scene, 0.05, 0.03, this.mainRotorLength, 8);
        this.tailRotorBlade = new MyCylinder(this.scene, 0.04, 0.02, this.tailRotorLength, 8);
        this.landingGearStrut = new MyCylinder(this.scene, 0.03, 0.03, 0.5, 8);
        this.landingGearSkid = new MyCylinder(this.scene, 0.03, 0.03, 1.7, 8);
        this.bucket = new MyCylinder(this.scene, this.bucketRadius, this.bucketRadius, this.bucketHeight, 16);
        this.rope = new MyCylinder(this.scene, 0.03, 0.03, this.bucketRopeLength, 8);
        this.dropletSphere = new MySphere(this.scene, 0.08, 10, 10);
    }

    // FIXED: Create water droplets when dropping water
    createWaterDroplets() {
        if (this.waterDroplets.length >= this.maxDroplets) return;
        
        const bucketX = this.position[0];
        const bucketY = this.position[1] - this.bodyRadius - this.bucketRopeLength - this.bucketHeight;
        const bucketZ = this.position[2];
        
        // Create more realistic water droplets
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 0.3;
            
            const droplet = {
                x: bucketX + Math.cos(angle) * distance,
                y: bucketY - 0.2,
                z: bucketZ + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.01 + (Math.random() - 0.5) * 0.005,
                vy: -0.02 - Math.random() * 0.01,
                vz: Math.sin(angle) * 0.01 + (Math.random() - 0.5) * 0.005,
                life: 1.0,
                scale: 0.5 + Math.random() * 0.8,
                gravity: 0.0001
            };
            this.waterDroplets.push(droplet);
        }
    }

    // FIXED: Update water droplets with better physics
    updateWaterDroplets(deltaTime) {
        for (let i = this.waterDroplets.length - 1; i >= 0; i--) {
            const droplet = this.waterDroplets[i];
            
            // Update position with proper scaling
            droplet.x += droplet.vx * deltaTime * 0.05;
            droplet.y += droplet.vy * deltaTime * 0.05;
            droplet.z += droplet.vz * deltaTime * 0.05;
            
            // Apply gravity acceleration
            droplet.vy -= droplet.gravity * deltaTime;
            
            // Update life (slower decay)
            droplet.life -= deltaTime * 0.0005;
            
            // Remove droplet if it's too old or hit the ground
            if (droplet.life <= 0 || droplet.y <= 0) {
                this.waterDroplets.splice(i, 1);
            }
        }
    }

    update(deltaTime) {
        if (this.isFlying || !this.isOverHeliport()) {
            const rotorSpeed = this.isFlying ? 0.1 : 0.02;
            this.mainRotorAngle += rotorSpeed * deltaTime;
            this.tailRotorAngle += rotorSpeed * 2 * deltaTime;
            this.mainRotorAngle %= (2 * Math.PI);
            this.tailRotorAngle %= (2 * Math.PI);
        }

        if (this.isFlying) {
            this.position[0] += this.velocity[0] * this.speed * deltaTime * 0.001;
            this.position[2] += this.velocity[2] * this.speed * deltaTime * 0.001;
        }

        if (this.takeoffFromHeliport) {
            if (this.position[1] < this.cruiseAltitude) {
                this.position[1] += 0.5; // velocidade subida
            } else {
                this.position[1] = this.cruiseAltitude;
                this.takeoffFromHeliport = false;
                this.isFlying = true;
                this.bucketDeployed = true;
                this.velocity = [0, 0, 0];
                this.speed = 0;
            }
            return; // impede controlo enquanto sobe
        }
        

        // Handle takeoff maneuver timing
        if (this.isTakingOff) {
            this.takeoffTimer += deltaTime;
            if (this.takeoffTimer >= this.takeoffDuration) {
                this.isTakingOff = false;
                this.takeoffTimer = 0;
                // Reset heliport state
                if (this.scene.building) {
                    this.scene.building.setHeliportState('normal');
                }
            }
        }

        // Handle landing maneuver timing
        if (this.isLanding) {
            this.landingTimer += deltaTime;
            if (this.landingTimer >= this.landingDuration) {
                this.isLanding = false;
                this.landingTimer = 0;
                // Reset heliport state
                if (this.scene.building) {
                    this.scene.building.setHeliportState('normal');
                }
            }
        }

        if (this.isLandingToHeliport) {
            this.velocity = [0, 0, 0];
            this.speed = 0;
            const targetY = this.scene.building.moduleCentralFloors * this.scene.building.floorHeight + 0.76;
            if (this.position[1] > targetY) {
                this.bucketDeployed = false;
                this.position[1] -= 0.4; // velocidade de descida
            } else {
                this.position[1] = targetY;
                this.isLandingToHeliport = false;
                this.reset();
            }
            return; // não atualiza mais nada durante a descida
        }        

        if (this.landingOnLake && this.position[1] > 4.3) {
            this.position[1] -= 0.3;
        }

        if (this.takeOffLake && this.position[1] < this.cruiseAltitude) {
            this.position[1] += 0.3;
        }
        else if (this.takeOffLake && this.position[1] >= this.cruiseAltitude){
            this.takeOffLake = false;
            this.isFlying = true;
        }

        if (this.retrievingWater) {
            if (this.position[1] > 1.5) {
                this.position[1] -= 0.2;
            } else {
                this.bucketFull = true;
                this.retrievingWater = false;
            }
        }

       /* if (this.releasingWater) {
            if (this.scene.fire) this.scene.fire.extinguish();
            this.bucketFull = false;
            this.releasingWater = false;
        }*/

        if (this.isFlying && this.position[1] < this.cruiseAltitude) {
            this.position[1] += 1.5 * deltaTime * 0.001; // Ajuste a velocidade
        }
        if (this.isFlying && this.position[1] >= this.cruiseAltitude && !this.bucketDeployed && !this.takeOffLake) {
            this.bucketDeployed = true;
        }
    
        if (this.position[1] >= this.cruiseAltitude) {
            this.position[1] = this.cruiseAltitude;
        }

        // FIXED: Handle water dropping animation with better timing
        if (this.isDropping) {
            this.dropTimer += deltaTime;
            
            // Create new droplets more frequently during drop
            if (this.dropTimer % this.dropletCreationRate < deltaTime) {
                this.createWaterDroplets();
            }
            
            if (this.dropTimer >= this.dropDuration) {
                this.isDropping = false;
                this.dropTimer = 0;
                this.bucketFull = false;
                
                // Extinguish fires in range
                if (this.scene.fires) {
                    for (const fire of this.scene.fires) {
                        if (fire.active && this.isOverFire(fire)) {
                            fire.extinguish();
                            this.isFlying = true;
                        }
                    }
                }
                
            }
        }

        // Update water droplets
        this.updateWaterDroplets(deltaTime);

    }

    turn(v) {
        this.rotation += v * (this.scene.speedFactor || 1);
        this.updateVelocityDirection();
    }

    accelerate(v) {
        this.speed += v * (this.scene.speedFactor || 1);
        this.updateVelocityDirection(); // Atualiza a direção quando a velocidade muda
    }

    updateVelocityDirection() {
        const forwardDirection = this.rotation + Math.PI/2;
        // A direção da frente é baseada na rotação (yaw) do helicóptero
        this.velocity[0] = Math.sin(forwardDirection);
        this.velocity[2] = Math.cos(forwardDirection);
        
        // Normaliza o vetor de velocidade
        const length = Math.sqrt(this.velocity[0]**2 + this.velocity[1]**2 + this.velocity[2]**2);
        if (length > 0) {
            this.velocity[0] /= length;
            this.velocity[1] /= length;
            this.velocity[2] /= length;
        }
    }

    reset() {
        this.landingOnLake = false;
        this.takeoffFromHeliport = false;
        this.isLandingToHeliport = false;
        this.takeOffLake = false;
        this.position = [-15, this.scene.building.moduleCentralFloors * this.scene.building.floorHeight + 0.76, -15];
        this.rotation = 0;
        this.pitch = 0;
        this.velocity = [0, 0, 0];
        this.speed = 0;
        this.isFlying = false;
        this.landingGearDeployed = true;
        this.bucketDeployed = false;
        this.bucketFull = false;
        this.retrievingWater = false;
        this.releasingWater = false;
        
        // Reset water animation
        this.isDropping = false;
        this.dropTimer = 0;
        this.waterDroplets = [];
        
        // Reset maneuver states
        this.isTakingOff = false;
        this.isLanding = false;
        this.takeoffTimer = 0;
        this.landingTimer = 0;
        
        // Reset heliport state
        if (this.scene.building) {
            this.scene.building.setHeliportState('normal');
        }
    }

    isOverLake() {
        const [x, y, z] = this.position;
        const lakeCenterX = -5; // Adjusted based on MyScene.js translation
        const lakeCenterZ = -5;
        const lakeRadius = 4;
        
        // Calculate distance from lake center
        const dx = x - lakeCenterX;
        const dz = z - lakeCenterZ;
        return Math.sqrt(dx*dx + dz*dz) <= lakeRadius;
    }
    
    isOverFire(fire) {
        if (!fire || !fire.active) return false; // Verifica se o fogo existe e está ativo
        
        const [x, y, z] = this.position;
        const dx = x - fire.x;
        const dz = z - fire.z;
        return Math.sqrt(dx*dx + dz*dz) <= 1.5; // Raio de 1.5 unidades
    }

    // Check if helicopter is over heliport
    isOverHeliport() {
        const [x, y, z] = this.position;
        const heliportX = -15;
        const heliportZ = -15;
        const heliportRadius = 2; // Approximate heliport size
        
        const dx = x - heliportX;
        const dz = z - heliportZ;
        return Math.sqrt(dx*dx + dz*dz) <= heliportRadius;
    }

    moveForward(speed = 0.2) {
        if (this.isFlying) {
            this.position[0] += Math.sin(this.rotation) * speed;
            this.position[2] += Math.cos(this.rotation) * speed;
        }
    }

    moveBackward(speed = 0.2) {
        if (this.isFlying) {
            this.position[0] -= Math.sin(this.rotation) * speed;
            this.position[2] -= Math.cos(this.rotation) * speed;
        }
    }

    ascend(speed = 0.2) {
        if (this.isFlying) {
            this.position[1] += speed;
        }
    }

    descend(speed = 0.2) {
        if (this.isFlying && this.position[1] > speed) {
            this.position[1] -= speed;
        } else if (this.isFlying && this.position[1] <= speed) {
            this.position[1] = 0;
            this.isFlying = false;
            this.landingGearDeployed = true;
        }
    }

    takeOff() {
        if (this.landingOnLake && this.position[1] <= 4.3) {
            // Collect water when taking off from lake
            this.bucketFull = true;
            this.landingOnLake = false;
            this.takeOffLake = true;
            this.landingGearDeployed = false;
            return;
        }
        
        if (!this.takeOffLake && !this.isFlying) {
            // Start takeoff maneuver - signal heliport
            this.isTakingOff = true;
            this.takeoffTimer = 0;
            if (this.scene.building && this.isOverHeliport()) {
                this.scene.building.setHeliportState('takeoff');
            }
            
            this.isFlying = true;
            this.landingGearDeployed = false;
            this.takeoffFromHeliport = true;
            //this.bucketDeployed = true;

        }
    }    

    land() {
        if (this.isOverLake() && !this.bucketFull && this.speed < 0.05 && this.speed > -0.05) {
            // Special landing sequence for water collection
            this.landingOnLake = true;
            this.landingGearDeployed = true;
            this.bucketDeployed = true;
            this.isFlying = false;
            return;
        }
        
        if (this.isFlying) {
            if (!this.isOverLake() && !this.bucketFull) {
                // Move toward heliport automatically
                if (this.speed > 0.5) {
                    this.speed *= 0.9; // Desaceleração suave (95% da velocidade atual)
                    return; // Aguardar até que a velocidade seja reduzida
                }
                const targetX = -15; // Heliport position
                const targetZ = -15;
                const dx = targetX - this.position[0];
                const dz = targetZ - this.position[2];
                const distance = Math.sqrt(dx*dx + dz*dz);
                
                if (distance > 0.5) {
                    // Move toward heliport
                    this.position[0] += dx/distance * 0.3;
                    this.position[2] += dz/distance * 0.3;
                    return; // Not ready to land yet
                }
                
                // Start landing maneuver when close to heliport
                if (!this.isLanding && this.isOverHeliport()) {
                    this.isLanding = true;
                    this.landingTimer = 0;
                    if (this.scene.building) {
                        this.scene.building.setHeliportState('landing');
                    }
                }

                if (!this.isLandingToHeliport && this.isOverHeliport()) {
                    if (this.speed > 0.5) {
                        this.speed *= 0.85; // Desaceleração suave (95% da velocidade atual)
                        return; // Aguardar até que a velocidade seja reduzida
                    }
                    this.bucketDeployed = false;
                    this.isLandingToHeliport = true;
                }                

            }
            
        }
    }

    toggleBucket() {
        this.bucketDeployed = !this.bucketDeployed;
    }

    fillBucket() {
        if (this.bucketDeployed && this.isOverLake() && this.position[1] < 5) {
            this.bucketFull = true;
        }
    }

    dropWater() {
        if (this.bucketDeployed && this.bucketFull && !this.isDropping) {
            let foundFire = false;
            if (this.scene.fires) {
                for (const fire of this.scene.fires) {
                    if (fire.active && this.isOverFire(fire)) {
                        this.isFlying = false;
                        foundFire = true;
                        this.isDropping = true;
                        this.dropTimer = 0;
                        return true;
                    }
                }
            }
 
        }
        return false;
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(...this.position);
        this.scene.rotate(this.rotation, 0, 1, 0);
        this.scene.rotate(this.pitch || 0, 0, 0, 1);

        // Body
        this.bodyMaterial.apply();
        this.scene.pushMatrix();
        this.scene.scale(this.bodyLength / 2, this.bodyRadius, this.bodyRadius * 1.2);
        this.body.display();
        this.scene.popMatrix();

        
        // Tail Boom
        this.bodyMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(-this.bodyLength / 3.2, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.tailBoom.display();
        this.scene.popMatrix();

        // Tail Fin
        this.scene.pushMatrix();
        this.scene.translate(-this.bodyLength / 2 - this.tailLength + 0.9, 0, 0);
        this.scene.rotate(-Math.PI / 2, 0, 0, 1);
        this.scene.scale(0.5, 0.05, 1.0);
        this.body.display();
        this.scene.popMatrix();

        // Main Rotor Hub
        this.rotorMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, this.bodyRadius - 0.1, 0);
        this.scene.scale(0.3, 0.2, 0.3);
        this.body.display();
        this.scene.popMatrix();

        // Main Rotor Blades (4)
        this.scene.pushMatrix();
        this.scene.translate(0, this.bodyRadius + 0.05, 0);
        this.scene.rotate(this.mainRotorAngle, 0, 1, 0);
        const bladeAngles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
        for (let angle of bladeAngles) {
            this.scene.pushMatrix();
            this.scene.rotate(angle, 0, 1, 0);
            this.scene.rotate(Math.PI / 2, 0, 0, 1);
            this.rotorBlade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        // Tail Rotor Hub
        this.scene.pushMatrix();
        this.scene.translate(-this.bodyLength / 2 - this.tailLength, -0.3, 0.4); // move to end of tail boom
        this.scene.translate(0.85, 0.3, 0.3); // lift and offset slightly right
        this.scene.scale(0.15, 0.15, 0.15);
        this.body.display();
        this.scene.popMatrix();

        // Tail Rotor Blades (2)
        this.scene.pushMatrix();
        this.scene.translate(-this.bodyLength / 3 - this.tailLength+0.2, 0, 0.8); // same spot as hub
        this.scene.rotate(this.tailRotorAngle, 0, 0, 1);
        const tailAngles = [0, Math.PI];
        for (let angle of tailAngles) {
            this.scene.pushMatrix();
            this.scene.rotate(angle, 0, 0, 1);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.tailRotorBlade.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        // Landing Gear
        if (this.landingGearDeployed) {
            this.landingGearMaterial.apply();
            const skidOffsetY = -this.bodyRadius - 0.6;
            const strutHeight = 0.5;
            for (let side of [-1, 1]) {
                // Front and rear struts
                for (let x of [-1, 1]) {
                    this.scene.pushMatrix();
                    this.scene.translate(x*0.5, skidOffsetY + strutHeight / 2 + 0.3, side * 0.3);
                    this.scene.scale(1, strutHeight*3, 1);
                    this.landingGearStrut.display();
                    this.scene.popMatrix();
                }
                // Skids
                this.scene.pushMatrix();
                this.scene.translate(0+1.3, skidOffsetY - 0.2 + 0.73, side * 0.3);
                this.scene.rotate(Math.PI / 2, 0, 0, 1);
                this.scene.scale(1, 1.5, 1);
                this.landingGearSkid.display();
                this.scene.popMatrix();
            }
        }

        // Bucket
        if (this.bucketDeployed) {
            this.ropeMaterial.apply();
            this.scene.pushMatrix();
            this.scene.translate(0, -this.bodyRadius+0.3, 0);
            this.scene.rotate(Math.PI, 0, 0, 1);
            this.rope.display();
            this.scene.popMatrix();

            this.bucketMaterial.apply();
            this.scene.pushMatrix();
            this.scene.translate(0, -this.bodyRadius - this.bucketRopeLength - this.bucketHeight / 2, 0);
            this.bucket.display();
            this.scene.popMatrix();

            if (this.bucketFull) {
                this.waterMaterial.apply();
                this.scene.pushMatrix();
                this.scene.translate(0, -this.bodyRadius - this.bucketRopeLength - this.bucketHeight * 0.4, 0);
                // Scale water based on drop progress
                let waterScale = 0.9;
                if (this.isDropping) {
                    const dropProgress = this.dropTimer / this.dropDuration;
                    waterScale = 0.9 * (1 - dropProgress);
                }
                
                this.scene.scale(waterScale, 0.6, waterScale)
                this.bucket.display();
                this.scene.popMatrix();
            }
        }

        this.scene.popMatrix();
        this.displayWaterDroplets();
    }

    // ENHANCED: Better water droplet rendering
    displayWaterDroplets() {
        if (this.waterDroplets.length === 0) return;

        this.dropletMaterial.apply();
        
        for (const droplet of this.waterDroplets) {
            this.scene.pushMatrix();
            this.scene.translate(droplet.x, droplet.y, droplet.z);
            
            // Scale based on life (shrink over time) and add some variation
            const scale = droplet.scale * droplet.life * 0.8;
            this.scene.scale(scale, scale * 1.2, scale); // Slightly elongated for water drop effect
            
            this.dropletSphere.display();
            this.scene.popMatrix();
        }
    }
}