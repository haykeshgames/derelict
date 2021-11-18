import { Physics } from 'phaser';

export class Chest extends Physics.Arcade.Sprite {
    get physicsBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'item_spr', 155);
        
        scene.add.existing(this);
    }
}
