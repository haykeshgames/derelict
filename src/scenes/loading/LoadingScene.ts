import { GameObjects, Scene } from 'phaser';
import { Player } from 'src/classes/Player';

export class LoadingScene extends Scene {

    constructor() {
        super('loading-scene');
    }

    preload(): void {
        this.load.baseURL = 'assets/';
        
        this.load.spritesheet('player_spr', 'spritesheets/player-32-32.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.image({key: 'tiles', url: 'tilemaps/tiles/dungeon-16-16.png'});
        this.load.tilemapTiledJSON('dungeon', 'tilemaps/json/level1.json');
        this.load.spritesheet('tiles_spr', 'tilemaps/tiles/dungeon-16-16.png', {
            frameWidth: 16,
            frameHeight: 16,
        });

        this.load.audio('bgmusic', 'music/bg.mp3');
        this.load.audio('fire', 'sfx/laser.wav');
        this.load.audio('death', 'sfx/death.wav');
        this.load.audio('pickup', 'sfx/pickup.wav');
    }

    // Called when the scene is created
    create(): void {
        this.scene.start('level-1-scene');
        this.scene.start('ui-scene');

        // Play some bg music
        this.sound.play('bgmusic', {loop: true, volume: 0.5})
    }
}
