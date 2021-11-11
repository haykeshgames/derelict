import { Scene } from 'phaser';
import { Player } from './Player';

// Base class for weapons
export class Weapon {
    protected scene : Scene;
    protected player : Player;

    // Time the rifle was last fired - so we can limit by the fireRate
    private lastFireTime : number = 0;

    get fireRate() : number {
        return 0;
    }

    get name() : string {
        return 'BaseWeapon';
    }

    constructor(scene: Scene, player : Player) {
        this.scene = scene;
        this.player = player;
    }

    // Called by the player update
    // Returns true if we are firing the weapon
    update() : boolean {
        const {activePointer} = this.scene.input;
        if (activePointer.leftButtonDown()) {
            const {worldX, worldY} = activePointer,
                {x, y} = this.player,
                startVec = new Phaser.Math.Vector2(x, y),
                targetVec = new Phaser.Math.Vector2(worldX, worldY),
                dir = targetVec.subtract(startVec).normalize();

            // Make sure the player is facing the direction they are shooting
            if (dir.x > 0) {
                this.player.setFlipX(false);
            } else if (dir.x < 0) {
                this.player.setFlipX(true);
            }

            if ((Date.now() - this.lastFireTime) >= this.fireRate) {
                this.fire(x, y, dir);
                this.lastFireTime = Date.now();
                return true;
            }
        }

        return false;
    }

    fire(x : number, y : number, dir : Phaser.Math.Vector2) : void {

    }
}