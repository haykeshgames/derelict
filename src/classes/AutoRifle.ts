import { Level1 } from '../scenes';
import { Bullet } from './Bullet';
import { Weapon } from './Weapon';

export class AutoRifle extends Weapon {

    // How often a bullet can be fired by this weapon
    private fireRate = 100;

    // Time the rifle was last fired - so we can limit by the fireRate
    private lastFireTime : number = 0;

    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('fireAutoRifle');
    }

    update() : boolean {
        const {activePointer} = this.scene.input;
        if (activePointer.leftButtonDown() && (Date.now() - this.lastFireTime) >= this.fireRate) {
            const {worldX, worldY} = activePointer,
                {x, y} = this.player,
                startVec = new Phaser.Math.Vector2(x, y),
                targetVec = new Phaser.Math.Vector2(worldX, worldY),
                dir = targetVec.subtract(startVec).normalize();

            // Pew Pew!
            this.fireSound.play();

            // Spawn a bullet!
            new Bullet(this.scene as Level1, x, y, dir, 'projectile_spr', 15)
                .setScale(0.8)
                .setName(`bullet_${Date.now()}`);

            this.lastFireTime = Date.now();
            return true;
        }

        return false;
    }
}