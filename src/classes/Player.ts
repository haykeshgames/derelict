import { Level1 } from '../scenes';
import { Actor } from "./Actor";
import { Bullet } from './Bullet';
import { Text } from './text';
import { EVENTS_NAME, GameStatus } from '../consts';

export class Player extends Actor {
    private keyW : Phaser.Input.Keyboard.Key;
    private keyA : Phaser.Input.Keyboard.Key;
    private keyS : Phaser.Input.Keyboard.Key;
    private keyD : Phaser.Input.Keyboard.Key;

    // Time the last bullet was fired
    private lastFireTime : number;

    // How often we can fire (ms)
    private fireRate = 100;

    // How fast we move
    private speed = 250;

    private hpValue: Text;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player_spr');

        this.lastFireTime = Date.now();

        // Keys
        this.keyW = this.scene.input.keyboard.addKey('W');
        this.keyA = this.scene.input.keyboard.addKey('A');
        this.keyS = this.scene.input.keyboard.addKey('S');
        this.keyD = this.scene.input.keyboard.addKey('D');

        // Physics
        this.getBody().setSize(30, 30);
        this.getBody().setOffset(8, 0);

        this.initAnimations();

        this.hpValue = new Text(this.scene, this.x, this.y - this.height, this.hp.toString())
            .setFontSize(12)
            .setOrigin(0.8, 0.5);
    }

    private initAnimations() : void {
        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNames('player_spr', {start: 24, end: 27}),
            frameRate: 8
        });

        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNames('player_spr', {start: 32, end: 35}),
            frameRate: 32
        });
    }

    update() : void {
        this.getBody().setVelocity(0);

        let xDir = 0, yDir = 0;
        if (this.keyW?.isDown) {
            yDir = -1;
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        if (this.keyA?.isDown) {
            xDir = -1;
            this.checkFlip();
            this.getBody().setOffset(48, 15);
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        if (this.keyS?.isDown) {
            yDir = 1;
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        if (this.keyD?.isDown) {
            xDir = 1;
            this.checkFlip();
            this.getBody().setOffset(15, 15);
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        const velocity = new Phaser.Math.Vector2(xDir, yDir).normalize().scale(this.speed);
        this.getBody().setVelocity(velocity.x, velocity.y);

        // Pew Pew!
        const {activePointer} = this.scene.input;
        if (activePointer.leftButtonDown() && (Date.now() - this.lastFireTime) >= this.fireRate) {
            this.anims.play('attack', true);
            const {worldX, worldY} = activePointer,
                {x, y} = this,
                startVec = new Phaser.Math.Vector2(x, y),
                targetVec = new Phaser.Math.Vector2(worldX, worldY),
                dir = targetVec.subtract(startVec).normalize();

            // Spawn a bullet!
            // TODO: We need a base scene class for managing our game objects
            const scene = this.scene as Level1;
            scene.spawnBullet(x, y, dir);
            

            this.lastFireTime = Date.now();
        }

        this.hpValue.setPosition(this.x, this.y - this.height * 0.4);
        this.hpValue.setOrigin(0.8, 0.5);
    }

    public getDamage(value?: number): void {
        super.getDamage(value);
        this.hpValue.setText(this.hp.toString());

        if (this.hp <= 0) {
            this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
        }
    }
}