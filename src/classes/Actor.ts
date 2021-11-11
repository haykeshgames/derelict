import { Physics } from "phaser";

export class Actor extends Physics.Arcade.Sprite {
    protected hp = 100;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number)  {
        super(scene, x, y, texture, frame);

        // Add the actor to the scene
        scene.add.existing(this);

        // Enable physics on the actor
        scene.physics.add.existing(this);

        // Don't let them go outside of the world bounds
        this.getBody().setCollideWorldBounds(true);
    }

    public getDamage(value ?: number) : void {
        // Add a programmatic animation to flicker the sprite when taking damage
        this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: 3,
            yoyo: true,
            alpha: 0.5,
            onStart: () => {
                if (value) this.hp = this.hp - value;
            },
            onComplete: () => {
                this.setAlpha(1);
            }
        });
    }

    public getHPValue() : number {
        return this.hp;
    }

    protected checkFlip() : void {
        // Flip the texture when moving left
        if (this.body.velocity.x < 0) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }
    }

    protected getBody() : Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
}