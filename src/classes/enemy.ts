import { EVENTS_NAME } from '../consts';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { Actor } from './Actor';
import { Bullet } from './Bullet';
import { Player } from './Player';

enum EnemyState {
    IDLE,
    MOVING,
    ATTACKING,
    DEAD
}

export class Enemy extends Actor {
    private target: Player;
    private AGRESSOR_RADIUS = 300; // TODO: Always aggressive when in same room!
    private ATTACK_RADIUS = 150;
    private SPEED = 1.5;
    
    public health = 100;
    
    private hpBar: Phaser.GameObjects.Image;
    
    private curState: EnemyState = EnemyState.IDLE;
    
    private lastFireTime: number = 0;
    private fireRate = 800;
    
    get deathSound(): Phaser.Sound.BaseSound {
        return this.scene?.sound.get('death');
    }
    
    get fireSound() : Phaser.Sound.BaseSound {
        return this.scene?.sound.get('pistolFire');
    }
    
    get isDead() {
        return this.curState === EnemyState.DEAD;
    }

    constructor(
        scene: DungeonScene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
        this.target = scene.player;

        //this.hpBar = new Text(scene, this.x, this.y - this.height, this.health.toString());
        this.hpBar = scene.add.image(
            this.x - this.width / 2,
            this.y - this.height,
            'ui_spr',
            10
        );
        this.hpBar.setScale(0.8);

        // PHYSICS MODEL
        this.getBody().setSize(32, 32);
        this.getBody().setOffset(0, 0);
        this.setImmovable(true);

        this.initAnimations();
    }

    private getDistanceToPlayer() {
        return Phaser.Math.Distance.BetweenPoints(
            { x: this.x, y: this.y },
            { x: this.target.x, y: this.target.y }
        );
    }
    
    private getPlayerDir() {
        return new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();
    }
    
    protected checkFlip() : void {        
        // Always face the player
        const dir = this.getPlayerDir();
        if (dir.x < 0) {
            this.flipX = true;
        } else if (dir.x > 0) {
            this.flipX = false;
        }
    }
    
    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        switch (this.curState) {
            case EnemyState.IDLE: {
                // Looking for the player ...
                const d = this.getDistanceToPlayer();
                if (d <= this.AGRESSOR_RADIUS) {
                    // Player is within aggresor range - transition to moving state
                    this.curState = EnemyState.MOVING;
                } else {
                    this.getBody().setVelocity(0);
                    if (!this.anims.isPlaying) {
                        this.anims.play('enemy_idle', true);
                    }
                }
                
                break;
            }
            case EnemyState.MOVING: {
                // Move toward the player
                const dir = this.getPlayerDir();                    
                this.setVelocity(
                    dir.x * delta * this.SPEED,
                    dir.y * delta * this.SPEED
                );
                
                this.checkFlip();
                this.anims.play('enemy_run', true);
                
                // Check for state transitions
                const d = this.getDistanceToPlayer();
                if (d <= this.ATTACK_RADIUS) {
                    // Transition to attack state
                    this.curState = EnemyState.ATTACKING;
                    this.getBody().setVelocity(0);
                } else if (d > this.AGRESSOR_RADIUS) {
                    // Player moved out of agressor range, back to idle state
                    this.curState = EnemyState.IDLE;
                }
                
                break;
            }
            case EnemyState.ATTACKING: {
                // Shooting at the player ...
                
                if (Date.now() - this.lastFireTime >= this.fireRate) {
                    // Fire a bullet at the player
                    
                    this.fireSound?.play();
                    new Bullet(this.scene as DungeonScene, this.x, this.y, this.getPlayerDir(), 10, 150, true, 'projectile_spr', 10)
                        .setScale(1.0)
                        .setName(`EnemyBullet_${Date.now()}_${this.name}`);
                    
                    this.lastFireTime = Date.now();
                    
                    this.anims.play('enemy_shoot');
                }
                
                this.checkFlip();
                
                const d = this.getDistanceToPlayer();
                if (d > this.ATTACK_RADIUS) {
                    this.curState = EnemyState.MOVING;
                }
                
                break;
            }
            case EnemyState.DEAD: {
                if (!this.anims.isPlaying) {
                    this.destroy();
                }
                
                break;
            }
        }

        this.hpBar.setX(this.x);
        this.hpBar.setY(this.y - 22);
    }

    public takeDamage(damage: integer) {
        if (this.isDead) return;

        this.health -= damage;
        if (this.health <= 0) {
            this.onKill();
        } else {
            const frame = Math.round((this.health / 100) * 10);
            this.hpBar.setFrame(frame);
        }
    }

    public onKill(): void {
        if (this.isDead) {
            return;
        }

        this.hpBar.destroy();
        this.anims.play('enemy_death');
        this.deathSound.play({ delay: 0.5 });
        this.curState = EnemyState.DEAD;

        // Stop physics once we die
        this.disableBody();

        this.scene.game.events.emit(EVENTS_NAME.enemyDeath, this);
    }

    public setTarget(target: Player): void {
        this.target = target;
    }

    private initAnimations(): void {
        this.scene.anims.create({
            key: 'enemy_idle',
            frames: this.scene.anims.generateFrameNames('enemy_spr', {
                start: 60,
                end: 63
            }),
            frameRate: 8
        });

        this.scene.anims.create({
            key: 'enemy_run',
            frames: this.scene.anims.generateFrameNames('enemy_spr', {
                start: 80,
                end: 83
            }),
            frameRate: 8
        });

        this.scene.anims.create({
            key: 'enemy_death',
            frames: this.scene.anims.generateFrameNames('enemy_spr', {
                start: 100,
                end: 107
            }),
            frameRate: 8
        });
        
        this.scene.anims.create({
            key: 'enemy_shoot',
            frames: this.scene.anims.generateFrameNames('enemy_spr', {
                start: 90,
                end: 93
            }),
            frameRate: 8
        });
    }
}
