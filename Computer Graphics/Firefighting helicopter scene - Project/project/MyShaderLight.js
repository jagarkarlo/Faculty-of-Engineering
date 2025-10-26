import { CGFobject, CGFshader } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";

export class MyShaderLight extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        
        // Light state
        this.maneuverState = 0; // 0=normal, 1=takeoff, 2=landing
        this.timeFactor = 0;
        
        // Animation parameters
        this.pulseFrequency = 2.0; // 2 Hz pulsation
        this.lightColor = [1.0, 0.8, 0.2]; // Amber color when active
        this.inactiveColor = [0.3, 0.3, 0.3]; // Grey when inactive
        
        this.initShaders();
        this.initGeometry();
    }
    
    initShaders() {
        // Create pulsating light shader
        this.lightShader = new CGFshader(
            this.scene.gl,
            "shaders/light.vert",
            "shaders/light.frag"
        );
        
        // Set initial shader uniform values
        this.lightShader.setUniformsValues({
            uTimeFactor: 0,
            uManeuverState: 0,
            uPulseFrequency: this.pulseFrequency,
            uLightColor: this.lightColor,
            uInactiveColor: this.inactiveColor
        });
    }
    
    initGeometry() {
        this.lightGeometry = new MySphere(this.scene, 0.15, 15, 15);
    }
    
    setManeuverState(state) {
        // Convert string state to integer for shader
        switch(state) {
            case 'normal': this.maneuverState = 0; break;
            case 'takeoff': this.maneuverState = 1; break;
            case 'landing': this.maneuverState = 2; break;
            default: this.maneuverState = 0;
        }
    }
    
    update(deltaTime) {
        // Update time factor for shader animation
        this.timeFactor += deltaTime * 0.001; // Convert to seconds
    }
    
    display() {
        // Set the shader
        this.scene.setActiveShader(this.lightShader);
        
        // Update shader uniforms
        this.lightShader.setUniformsValues({
            uTimeFactor: this.timeFactor,
            uManeuverState: this.maneuverState,
            uPulseFrequency: this.pulseFrequency,
            uLightColor: this.lightColor,
            uInactiveColor: this.inactiveColor
        });
        
        // Display the light geometry
        this.lightGeometry.display();
        
        // Reset to default shader
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}