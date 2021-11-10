import { Math, Scene } from 'phaser';
import { Level1 } from '../scenes';

import { Actor } from './Actor';
import { Player } from './Player';

export class Enemy extends Actor {
  private target: Player;
  private AGRESSOR_RADIUS = 100;

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
    this.getBody().setSize(16, 16);
    this.getBody().setOffset(0, 0);
  }

  preUpdate(): void {
    if (
      Phaser.Math.Distance.BetweenPoints(
        { x: this.x, y: this.y },
        { x: this.target.x, y: this.target.y },
      ) < this.AGRESSOR_RADIUS
    ) {
      this.getBody().setVelocityX(this.target.x - this.x);
      this.getBody().setVelocityY(this.target.y - this.y);
    } else {
      this.getBody().setVelocity(0);
    }
  }

  public setTarget(target: Player): void {
    this.target = target;
  }
}