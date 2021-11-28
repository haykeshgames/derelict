import { DungeonScene } from '../scenes';
import { Actor } from './Actor';
import { Enemy } from './enemy';
import { Player } from './Player';

export class Bullet extends Actor {
    private speed: number;
    private MAX_TRAVEL = 350;
    private startPosition: Phaser.Math.Vector2;
    private sparksManager!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private enemySparksManager!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private playerSparksManager!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    
    private damage: integer;
    
    public isEnemyBullet: boolean;
    
    get hitWallSound(): Phaser.Sound.BaseSound {
        return this.scene?.sound.get('bulletHitWall');
    }
    
    get hitEnemySound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('bulletHitEnemy');
    }
    
    get hitPlayerSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('bulletHitEnemy');
    }
    
    constructor(
        scene: DungeonScene,
        x: number,
        y: number,
        direction: Phaser.Math.Vector2,
        damage: integer,
        speed = 500,
        isEnemyBullet = false,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
        
        this.speed = speed;
        this.damage = damage;
        this.isEnemyBullet = isEnemyBullet;
        
        this.setRotation(direction.angle());
        
        this.startPosition = new Phaser.Math.Vector2(x, y);
        
        scene.addBullet(this);

        // Physics
        this.getBody().setSize(6, 6);
        // size of the sprite is 6x6, centered in a 32x32 image
        // TODO: make the bullet seem to hit the middle of northern walls rather than the bottom
        this.getBody().setOffset(13, 13);
        
        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
        
        this.sparksManager = scene.add.particles('spark');
        this.enemySparksManager = scene.add.particles('enemyHitSpark');
        this.playerSparksManager = scene.add.particles('playerHitSpark');
    }

    public onHitEnemy(enemy: Enemy): void {
        enemy.takeDamage(this.damage);
        
        this.hitWallSound?.play();
        this.destroy();
        
        this.enemySparksManager.createEmitter({
            x: this.x,
            y: this.y,
            speed: 150,
            scale: 0.03,
            quantity: 0.5 * this.damage,
            maxParticles: 1 * this.damage, 
            lifespan: 80,
            
            blendMode: Phaser.BlendModes.ADD
        });
    }
    
    public onHitPlayer(player: Player) {
        player.getDamage(this.damage);
        
        this.hitPlayerSound?.play();
        this.destroy();
        
        this.playerSparksManager.createEmitter({
            x: this.x,
            y: this.y,
            speed: 150,
            scale: 0.03,
            quantity: 0.5 * this.damage,
            maxParticles: 1 * this.damage, 
            lifespan: 80,
            
            blendMode: Phaser.BlendModes.ADD
        });
    }

    public onHitWall(): void {
        this.hitWallSound?.play();
        this.destroy();
        
        this.sparksManager.createEmitter({
            x: this.x,
            y: this.y,
            speed: 150,
            scale: 0.03,
            quantity: 0.5 * this.damage,
            maxParticles: 1 * this.damage, 
            lifespan: 80,
            
            blendMode: Phaser.BlendModes.ADD
        });
    }

    preUpdate(): void {
        // Check if we hit an enemy!

        // Check if we've traveled too far from our start, and if so destroy us
        const { position } = this.getBody(),
            distance = position.distance(this.startPosition); // TODO: Inefficient - use distance squared

        if (distance >= this.MAX_TRAVEL) {
            this.destroy();
        }
    }
}
