import { Level1 } from '../scenes';
import { Actor } from './Actor';
import { Enemy } from './enemy';

export class Bullet extends Actor {
    private SPEED = 500;
    private MAX_TRAVEL = 350;
    private startPosition : Phaser.Math.Vector2;
    private sparksManager !: Phaser.GameObjects.Particles.ParticleEmitterManager;

    get hitWallSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('bulletHitWall');
    }

    constructor(
        scene: Level1,
        x: number, 
        y: number,
        direction: Phaser.Math.Vector2,
        texture: string,
        frame ?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.setRotation(direction.angle());

        this.startPosition = new Phaser.Math.Vector2(x, y);

        scene.addBullet(this);

        // Physics
        this.getBody().setSize(6, 6);
        // size of the sprite is 6x6, centered in a 32x32 image
        // TODO: make the bullet seem to hit the middle of northern walls rather than the bottom
        this.getBody().setOffset(13, 13);

        this.setVelocity(direction.x * this.SPEED, direction.y * this.SPEED);

        this.sparksManager = scene.add.particles('spark');
    }

    public onHitEnemy(enemy : Enemy) : void {
        enemy.onKill();
        this.destroy();
    }

    public onHitWall() : void {
        this.hitWallSound?.play();
        this.destroy();

        this.sparksManager.createEmitter({
          x: this.x,
          y: this.y,
          speed: 150,
          scale: 0.03,
          quantity: 10,
          maxParticles: 20,
          lifespan: 80,

          blendMode: Phaser.BlendModes.ADD
        });
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