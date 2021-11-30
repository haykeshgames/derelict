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

    private tabHandler : (key : Phaser.Input.Keyboard.Key, event : KeyboardEvent) => void;
    private rHandler : (key : Phaser.Input.Keyboard.Key, event : KeyboardEvent) => void;

    // How fast we move
    private speed = 200;

    private pistol : Pistol;
    private autoRifle : AutoRifle;
    
    private _weapon : Weapon;
    get weapon() : Weapon {
        return this._weapon;
    }

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player_spr');
        
        this.pistol = new Pistol(scene, this);
        this.autoRifle = new AutoRifle(scene, this);
        this._weapon = this.autoRifle;
        
        // Keys
        this.keyW = this.scene.input.keyboard.addKey('W');
        this.keyA = this.scene.input.keyboard.addKey('A');
        this.keyS = this.scene.input.keyboard.addKey('S');
        this.keyD = this.scene.input.keyboard.addKey('D');
        this.keyTab = this.scene.input.keyboard.addKey('TAB', true, true);
        this.keyR = this.scene.input.keyboard.addKey('R');

        this.tabHandler = (key : Phaser.Input.Keyboard.Key, event : KeyboardEvent) => { 
            event.stopPropagation();
            this.swapWeapons();
        }

        this.rHandler = (key : Phaser.Input.Keyboard.Key, event : KeyboardEvent) => {
            event.stopPropagation();
            this.reloadWeapon();
        }

        this.keyTab.on('down', this.tabHandler);
        this.keyR.on('down', this.rHandler);
        

        // Physics
        this.getBody().setSize(12, 16);
        this.getBody().setOffset(10,16);

        this.setScale(1.4);
        this.initAnimations();

        setTimeout(() => {
            this.scene.game.events.emit(EVENTS_NAME.weaponSwap, this._weapon);
            this.scene.game.events.emit(EVENTS_NAME.playerHp, this.hp);
        }, 5);
    }

    public swapWeapons() : void {
        this._weapon = this._weapon === this.autoRifle ? this.pistol : this.autoRifle;
        this.scene.game.events.emit(EVENTS_NAME.weaponSwap, this._weapon);
        this.scene.sound.get('weaponSwap').play();
    }

    public reloadWeapon() : void {
        this._weapon.reloadWeapon();
        this.scene.game.events.emit(EVENTS_NAME.playerReload, this._weapon.clip);
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

        if (this._weapon.update()) {
            this.anims.play('attack');
        }
    }

    public getDamage(value?: number): void {
        super.getDamage(value);
        
        this.scene.game.events.emit(EVENTS_NAME.playerHp, this.hp);

        if (this.hp <= 0) {
            this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
        }
    }

    addAmmo(count : number) : void {
        this._weapon.addAmmo(count);
    }

    destroy() : void {
        this.keyR.removeListener('down');
        this.keyR.destroy();

        this.keyTab.removeListener('down');
        this.keyTab.destroy();

        super.destroy();
    }
}