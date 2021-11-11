import { Level1 } from '../scenes';
import { Bullet } from './Bullet';
import { Weapon } from './Weapon';

export class Pistol extends Weapon {
    get fireRate() : number {
        return 600;
    }

    get name() : string {
        return 'Pistol';
    }

    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('pistolFire');
    }

    fire(x : number, y : number, dir : Phaser.Math.Vector2) : void { 
        this.fireSound?.play();

        // Spawn a bullet
        new Bullet(this.scene as Level1, x, y, dir, 'projectile_spr', 15)
            .setScale(0.7)
            .setName(`PistolBullet_${Date.now()}`);
    }
}