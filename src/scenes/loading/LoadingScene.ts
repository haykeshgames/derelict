import { GameObjects, Scene } from 'phaser';

export class LoadingScene extends Scene {
    private king!: GameObjects.Sprite;

    constructor() {
        super('loading-scene');
    }

    // Called when the scene is created
    create(): void {
        console.log('Loading scene was created!');

        // Instantiate the player sprite
        this.king = this.add.sprite(100, 100, 'king');
    }

    preload(): void {
        this.load.baseURL = 'assets/';
        
        // First param is the key for looking up the asset, second param is the relative path
        // from the baseURL we set above.
        this.load.image('king', 'sprites/king.png');
    }
}
