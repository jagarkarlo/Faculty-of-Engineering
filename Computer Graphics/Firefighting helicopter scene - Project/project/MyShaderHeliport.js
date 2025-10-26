import { CGFobject, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";

export class MyShaderHeliport extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        
        // Heliport state
        this.maneuverState = 0; // 0=normal, 1=takeoff, 2=landing
        this.timeFactor = 0;
        
        // Animation parameters
        this.blinkFrequency = 2.0; // 2 Hz blinking
        
        this.initShaders();
        this.initTextures();
        this.initGeometry();
    }
    
    initShaders() {
        // Create heliport texture blinking shader
        this.heliportShader = new CGFshader(
            this.scene.gl,
            "shaders/heliport.vert",
            "shaders/heliport.frag"
        );
        
        // Set shader uniform locations
        this.heliportShader.setUniformsValues({
            uSampler1: 0,           // Texture unit 0 for normal texture
            uSampler2: 1,           // Texture unit 1 for special texture
            uTimeFactor: 0,
            uManeuverState: 0,
            uBlinkFrequency: this.blinkFrequency
        });
    }
    
    initTextures() {
        // Load heliport textures
        this.normalTexture = new CGFtexture(this.scene, "images/heliport_H.png");
        this.upTexture = new CGFtexture(this.scene, "images/heliport_UP.png");
        this.downTexture = new CGFtexture(this.scene, "images/heliport_DOWN.png");
    }
    
    initGeometry() {
        this.heliportPlane = new MyPlane(this.scene);
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
        this.scene.setActiveShader(this.heliportShader);
        
        // Bind textures
        this.normalTexture.bind(0);
        
        // Bind appropriate special texture based on maneuver state
        if (this.maneuverState === 1) {
            this.upTexture.bind(1);
        } else if (this.maneuverState === 2) {
            this.downTexture.bind(1);
        } else {
            this.normalTexture.bind(1); // Use normal texture as fallback
        }
        
        // Update shader uniforms
        this.heliportShader.setUniformsValues({
            uTimeFactor: this.timeFactor,
            uManeuverState: this.maneuverState,
            uBlinkFrequency: this.blinkFrequency
        });

        
        // Display the heliport plane
        this.heliportPlane.display();
    }
}
