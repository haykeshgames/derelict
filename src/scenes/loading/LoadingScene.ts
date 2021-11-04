import { GameObjects, Scene } from 'phaser';

export class LoadingScene extends Scene {

    constructor() {
        super('loading-scene');
    }

    preload(): void {
        this.load.baseURL = 'assets/';
        
        // First param is the key for looking up the asset, second param is the relative path
        // from the baseURL we set above.
        this.load.image('king', 'sprites/king.png');
    }

    // Called when the scene is created
    create(): void {
        this.scene.start('level-1-scene');
    }
}
