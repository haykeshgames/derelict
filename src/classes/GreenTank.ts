import { Physics } from 'phaser';

export class GreenTank extends Physics.Arcade.Sprite {
    get physicsBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Offset the x pos a bit since we render on center and we get the top-left of the tile in world coords
        super(scene, x + 16, y, 'tank_spr', 72);
        
        scene.add.existing(this);
        
        // Render on top of everything else so the player goes 'behind' it when walking past the top half
        this.setDepth(100);
        
        // Scale it up a bit so it fills the tile it sits on
        this.setScale(1.4);
        
        this.initAnimations();
        
        this.anims.play({ key: Phaser.Math.Between(0, 1) === 0 ? 'green_tank' : 'green_tank_alt', repeat: -1 });
    }

    private initAnimations(): void {
        this.scene.anims.create({
            key: 'green_tank',
            frames: this.scene.anims.generateFrameNames('tank_spr', {
                start: 74,
                end: 76
            }),
            frameRate: 4
        });
        
        this.scene.anims.create({
            key: 'green_tank_alt',
            frames: this.scene.anims.generateFrameNames('tank_spr', {
                start: 98,
                end: 100
            }),
            frameRate: 4
        });
    }
}
