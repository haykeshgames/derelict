import { EVENTS_NAME } from '../consts';
import { Bullet } from './Bullet';
import { Weapon } from './Weapon';
import { Scene } from 'phaser';
import { Player } from './Player';
import { DungeonScene } from '../scenes';

export class AutoRifle extends Weapon {
    get fireRate() : number {
        return 100;
    }

    get name() : string {
        return 'AutoRifle';
    }

    get clipSize() : number {
        return 30;
    }

    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('fireAutoRifle');
    }

    constructor(scene: Scene, player : Player) {
        super(scene, player);
        this._clip = 30;
        this._ammo = 120;
    }

    fire(x : number, y : number, dir : Phaser.Math.Vector2) : void {
        if (this._clip > 0) {
            // Fire a bullet!
            this.fireSound?.play();

            // Spawn a bullet!
            new Bullet(this.scene as DungeonScene, x, y, dir, 10, 500, false, 'projectile_spr', 5)
                .setScale(0.6)
                .setName(`bullet_${Date.now()}`);

            this._ammo = Math.max(0, this._ammo - 1);
            this.scene.game.events.emit(EVENTS_NAME.ammoCount, this._ammo);

            this._clip = Math.max(0, this._clip - 1);
            this.scene.game.events.emit(EVENTS_NAME.playerFire, this._clip);
        } else {
            // No ammo!
            this.noAmmoSound?.play();                    
        }
    }
}