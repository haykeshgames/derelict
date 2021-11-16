import { Actor } from "./Actor";
import { EVENTS_NAME, GameStatus } from '../consts';
import { AutoRifle } from './AutoRifle';
import { Weapon } from './Weapon';
import { Pistol } from './Pistol';

export class Player extends Actor {
    private keyW : Phaser.Input.Keyboard.Key;
    private keyA : Phaser.Input.Keyboard.Key;
    private keyS : Phaser.Input.Keyboard.Key;
    private keyD : Phaser.Input.Keyboard.Key;
    private keyTab : Phaser.Input.Keyboard.Key;
    private keyR : Phaser.Input.Keyboard.Key;

    // How fast we move
    private speed = 250;

    private pistol : Pistol;
    private autoRifle : AutoRifle;

    private weapon : Weapon;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player_spr');

        this.pistol = new Pistol(scene, this);
        this.autoRifle = new AutoRifle(scene, this);
        this.weapon = this.autoRifle;

        // Keys
        this.keyW = this.scene.input.keyboard.addKey('W');
        this.keyA = this.scene.input.keyboard.addKey('A');
        this.keyS = this.scene.input.keyboard.addKey('S');
        this.keyD = this.scene.input.keyboard.addKey('D');
        this.keyTab = this.scene.input.keyboard.addKey('TAB', true, true);
        this.keyR = this.scene.input.keyboard.addKey('R');

        this.keyTab.on('down', () => this.swapWeapons());
        this.keyR.on('down', () => this.reloadWeapon());
        

        // Physics
        this.getBody().setSize(12, 16);
        this.getBody().setOffset(10,16);

        this.initAnimations();

        setTimeout(() => {
            this.scene.game.events.emit(EVENTS_NAME.weaponSwap, this.weapon);
            this.scene.game.events.emit(EVENTS_NAME.playerHp, this.hp);
        }, 5);
    }

    private swapWeapons() {
        this.weapon = this.weapon === this.autoRifle ? this.pistol : this.autoRifle;
        this.scene.game.events.emit(EVENTS_NAME.weaponSwap, this.weapon);
        this.scene.sound.get('weaponSwap').play();
    }

    private reloadWeapon() {
        this.weapon.reloadWeapon();
        this.scene.game.events.emit(EVENTS_NAME.playerReload, this.weapon.clip);
        this.scene.sound.get('weaponSwap').play();
        this.anims.play('attack');
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
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        if (this.keyS?.isDown) {
            yDir = 1; 
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        if (this.keyD?.isDown) {
            xDir = 1;
            if (!this.anims.isPlaying) this.anims.play('run', true)
        }

        const velocity = new Phaser.Math.Vector2(xDir, yDir).normalize().scale(this.speed);
        this.getBody().setVelocity(velocity.x, velocity.y);
        this.checkFlip();

        if (this.weapon.update()) {
            this.anims.play('attack');
        }
    }

    public getDamage(value?: number): void {
        super.getDamage(value);
        
        this.scene.game.events.emit(EVENTS_NAME.weaponSwap, this.hp);

        if (this.hp <= 0) {
            this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
        }
    }

    addAmmo(count : number) {
        this.weapon.addAmmo(count);
    }
}