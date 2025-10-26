import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        // Set up GUI elements from the scene
        if (this.scene.setupGUI) {
            this.scene.setupGUI(this.gui);
        }

        this.initKeys();
        
        // Add mouse controls for looking around
        this.setActiveCamera(this.scene.camera);

        // Add help section with keyboard controls
        this.addHelp();

        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;

        // disable the processKeyboard function
        this.processKeyboard = function () { };

        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }
    
    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code] = true;
        
        // Prevent default behavior for arrow keys and page up/down to avoid page scrolling
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.code)) {
            event.preventDefault();
        }
    }

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        // returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }
    
    // Add a help panel to show key controls
    addHelp() {
        const helpFolder = this.gui.addFolder('Keyboard Controls');
        
        // Camera controls
        const cameraFolder = helpFolder.addFolder('Camera Navigation');
        this.addReadOnly(cameraFolder, 'C/Z', 'Move Front/Back');
        
        // Helicopter controls
        const heliControlsFolder = helpFolder.addFolder('Helicopter Controls');
        this.addReadOnly(heliControlsFolder, 'W/S', 'Speed up/Slow down');
        this.addReadOnly(heliControlsFolder, 'P', 'Start flying');
        this.addReadOnly(heliControlsFolder, 'L', 'Go to heliport/Get water');
        this.addReadOnly(heliControlsFolder, 'O', 'Put out fire');
        this.addReadOnly(heliControlsFolder, 'A/D', 'Turn Left/Right');
        this.addReadOnly(heliControlsFolder, 'R', 'Reset');
        
        // Open help folder by default
        helpFolder.open();
    }
    
    // Helper method to add read-only text fields to GUI
    addReadOnly(folder, key, description) {
        const obj = {};
        obj[key] = description;
        folder.add(obj, key);
    }
}