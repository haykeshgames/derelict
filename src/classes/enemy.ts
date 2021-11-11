import { Math, Scene } from 'phaser';
import { Level1 } from '../scenes';

import { Actor } from './Actor';
import { Player } from './Player';

export class Enemy extends Actor {
  private target: Player;
  private AGRESSOR_RADIUS = 100;
  private destroyOnUpdate = false;

  constructor(
    scene: Level1,
    x: number,
    y: number,
    texture: string,
    target: Player,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);
    this.target = target;

    // ADD TO SCENE
    scene.addEnemy(this);

    // Add to enemies group

    // PHYSICS MODEL
    this.getBody().setSize(32, 32);
    this.getBody().setOffset(0, 0);

    this.initAnimations();
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // FIXME this is definitely not the best way to do this, but it works
    if(this.destroyOnUpdate && !this.anims.isPlaying) {
        this.destroy();
        return;
    }

    if (
      Phaser.Math.Distance.BetweenPoints(
        { x: this.x, y: this.y },
        { x: this.target.x, y: this.target.y },
      ) < this.AGRESSOR_RADIUS
    ) {
      this.getBody().setVelocityX(this.target.x - this.x);
      this.getBody().setVelocityY(this.target.y - this.y);

      this.checkFlip();
      if (!this.anims.isPlaying) this.anims.play('enemy_run', true);
    } else {
      this.getBody().setVelocity(0);
      if (!this.anims.isPlaying) this.anims.play('enemy_idle', true);
    }
  }

  public onKill(): void {
      this.anims.play('enemy_death');
      this.destroyOnUpdate = true;
  }

  public setTarget(target: Player): void {
    this.target = target;
  }

  private initAnimations() : void {
    this.scene.anims.create({
        key: 'enemy_idle',
        frames: this.scene.anims.generateFrameNames('enemy_spr', {start: 60, end: 63}),
        frameRate: 8
    });

    this.scene.anims.create({
        key: 'enemy_run',
        frames: this.scene.anims.generateFrameNames('enemy_spr', {start: 80, end: 83}),
        frameRate: 8
    });

    this.scene.anims.create({
        key: 'enemy_death',
        frames: this.scene.anims.generateFrameNames('enemy_spr', {start: 100, end: 107}),
        frameRate: 8
    });
  }
}