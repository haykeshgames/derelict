import { Text } from './text';

export enum ScoreOperations {
  INCREASE,
  DECREASE,
  SET_VALUE,
}

export class Score extends Text {
  private scoreValue: number;
  private killsValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, initScore = 0, initKills = 0) {
    super(scene, x, y, `Score: ${initScore} Kills: ${initKills}`);

    scene.add.existing(this);

    this.scoreValue = initScore;
    this.killsValue = initKills;
  }

  public changeScore(operation: ScoreOperations, value: number): void {
    switch (operation) {
      case ScoreOperations.INCREASE:
        this.scoreValue += value;
        break;
      case ScoreOperations.DECREASE:
        this.scoreValue -= value;
        break;
      case ScoreOperations.SET_VALUE:
        this.scoreValue = value;
        break;
      default:
        break;
    }

    this.setText(`Score: ${this.scoreValue} Kills: ${this.killsValue}`);
  }

  public changeKills(operation: ScoreOperations, value: number) : void {
    switch (operation) {
      case ScoreOperations.INCREASE:
        this.killsValue += value;
        break;
      case ScoreOperations.DECREASE:
        this.killsValue -= value;
        break;
      case ScoreOperations.SET_VALUE:
        this.killsValue = value;
        break;
      default:
        break;
    }

    this.setText(`Score: ${this.scoreValue} Kills: ${this.killsValue}`);
  }
}