import { Actor } from './Actor';
import { Player } from './Player';

export class Bullet extends Actor {
    private SPEED = 150;
    private MAX_TRAVEL = 350;
    private startPosition : Phaser.Math.Vector2;

    constructor(
        scene: Phaser.Scene,
        x: number, 
        y: number,
        direction: Phaser.Math.Vector2,
        texture: string,
        frame ?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.startPosition = new Phaser.Math.Vector2(x, y);

        // Get it in the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics
        this.getBody().setSize(4, 4);
        this.getBody().setOffset(0, 0);

        this.setVelocity(direction.x * this.SPEED, direction.y * this.SPEED);
    }

    preUpdate() : void {
        // Check if we hit an enemy!

        // Check if we've traveled too far from our start, and if so destroy us
        const {position} = this.getBody(),
            distance = position.distance(this.startPosition); // TODO: Inefficient - use distance squared

        if (distance >= this.MAX_TRAVEL) {
            this.destroy();
        }
    }
}