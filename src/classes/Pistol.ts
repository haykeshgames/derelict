import { EVENTS_NAME } from '../consts';
import { Level1 } from '../scenes';
import { Bullet } from './Bullet';
import { Weapon } from './Weapon';
import { Scene } from 'phaser';
import { Player } from './Player';

export class Pistol extends Weapon {
    get fireRate() : number {
        return 600;
    }

    get name() : string {
        return 'Pistol';
    }

    get clipSize() : number {
        return 8;
    }
    
    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('pistolFire');
    }
    
    constructor(scene: Scene, player : Player) {
        super(scene, player);
        this._clip = 8;
        this._ammo = -1;
    }
    
    fire(x : number, y : number, dir : Phaser.Math.Vector2) : void { 
        if (this._clip > 0) {
            this.fireSound?.play();
            
            // Spawn a bullet
            new Bullet(this.scene as Level1, x, y, dir, 25, 'projectile_spr', 15)
                .setScale(0.7)
                .setName(`PistolBullet_${Date.now()}`);
            
            this._clip = Math.max(0, this._clip - 1);
            this.scene.game.events.emit(EVENTS_NAME.playerFire, this._clip);
        } else {
            // No ammo!
            this.noAmmoSound?.play();                    
        }
    }
}