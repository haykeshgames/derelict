import { Scene } from 'phaser';

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

        this.load.spritesheet('projectile_spr', 'spritesheets/projectiles-32-32.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        
        this.load.spritesheet('enemy_spr', 'spritesheets/enemies-32-32.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        
        this.load.spritesheet('item_spr', 'spritesheets/items-32-32.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        
        this.load.spritesheet('tank_spr', 'spritesheets/items-32-32.png', {
            frameWidth: 32,
            frameHeight: 64
        });
        
        this.load.image({key: 'space-tiles-32-32', url: 'tilemaps/tiles/space-tiles-32-32.png'});
        this.load.image({key: 'items-tiles-32-32', url: 'tilemaps/tiles/items-tiles-32-32.png'});
        this.load.image({key: 'space-tiles-32-32-updated', url: 'tilemaps/tiles/space-tiles-32-32-updated.png'});
        this.load.image({key: 'items-tiles-32-32-updated', url: 'tilemaps/tiles/items-tiles-32-32-updated.png'});
        this.load.tilemapTiledJSON('ship', 'tilemaps/json/ship-level-1.json');
        
        this.load.image('spark', 'particles/yellow.png');
        
        this.load.audio('bgmusic', 'music/bg.mp3');
        this.load.audio('death', 'sfx/death.wav');
        this.load.audio('pickup', 'sfx/pickup.wav');
        this.load.audio('fireAutoRifle', 'sfx/laser.wav');
        this.load.audio('bulletHitWall', 'sfx/hit.wav');
        this.load.audio('noAmmo', 'sfx/noammo.wav');
        this.load.audio('pistolFire', 'sfx/pistolfire.wav');
        this.load.audio('weaponSwap', 'sfx/weaponswap.wav');
    }

    // Called when the scene is created
    create(): void {
        this.sound.add('fireAutoRifle');
        this.sound.add('bulletHitWall');
        this.sound.add('death');
        this.sound.add('noAmmo');
        this.sound.add('pistolFire');
        this.sound.add('weaponSwap');
        
        this.scene.start('dungeon-scene');
        this.scene.start('ui-scene');

        // Play some bg music
        this.sound.play('bgmusic', {loop: true, volume: 0.5})
    }
}
