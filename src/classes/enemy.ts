import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { EVENTS_NAME } from '../consts';
import { Actor } from './Actor';
import { Player } from './Player';
import { Text } from './text';

export class Enemy extends Actor {
    private target: Player;
    private AGRESSOR_RADIUS = 200; // TODO: Always aggressive when in same room! 
    private SPEED = 1.5;
    private isDead = false;
    
    public health = 100;
    
    private hpBar: Phaser.GameObjects.Image;
    
    get deathSound(): Phaser.Sound.BaseSound {
        return this.scene?.sound.get('death');
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
        this.hpBar = scene.add.image(this.x - this.width / 2, this.y - this.height, 'ui_spr', 10);
        this.hpBar.setScale(0.8);
        
        // ADD TO SCENE
        scene.addEnemy(this);
        
        // PHYSICS MODEL
        this.getBody().setSize(32, 32);
        this.getBody().setOffset(0, 0);
        
        this.initAnimations();
    }
    
    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        
        if (this.isDead) {
            if (!this.anims.isPlaying) {
                this.destroy();
            }
            
            return;
        }
        
        if (
            Phaser.Math.Distance.BetweenPoints(
                { x: this.x, y: this.y },
                { x: this.target.x, y: this.target.y }
            ) < this.AGRESSOR_RADIUS
        ) {            
            const dir = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y).normalize();
            
            this.setVelocity(dir.x * delta * this.SPEED, dir.y * delta * this.SPEED);
            
            this.checkFlip();
            if (!this.anims.isPlaying) this.anims.play('enemy_run', true);
        } else {
            this.getBody().setVelocity(0);
            if (!this.anims.isPlaying) this.anims.play('enemy_idle', true);
        }
        
        this.hpBar.setX(this.x);
        this.hpBar.setY(this.y - 22);
    }
    
    public takeDamage(damage: integer)  {
        if (this.isDead) return;
        
        this.health -= damage;
        if (this.health <= 0) {
            this.onKill();
        } else {
            const frame = Math.round(this.health / 100 * 10);
            console.log('health', this.health, 'frame', frame);
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
        this.isDead = true;
        
        // Stop physics once we die
        this.disableBody();
        
        this.scene.game.events.emit(EVENTS_NAME.enemyDeath);
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
    }
}
