import { EVENTS_NAME } from '../consts';
import { Level1 } from '../scenes';
import { Bullet } from './Bullet';
import { Weapon } from './Weapon';

export class AutoRifle extends Weapon {
    get fireRate() : number {
        return 100;
    }

    get name() : string {
        return 'AutoRifle';
    }

    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('fireAutoRifle');
    }

    get noAmmoSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('noAmmo');
    }

    fire(x : number, y : number, dir : Phaser.Math.Vector2) : void {
        if (this.player.clip > 0) {
            // Fire a bullet!
            this.fireSound?.play();

            // Spawn a bullet!
            new Bullet(this.scene as Level1, x, y, dir, 'projectile_spr', 5)
                .setScale(0.6)
                .setName(`bullet_${Date.now()}`);

            this.player.useAmmo(1);
        } else {
            // No ammo!
            this.noAmmoSound?.play();                    
        }
    }
}