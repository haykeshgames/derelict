import { Text } from './text';

export enum ScoreOperations {
  INCREASE,
  DECREASE,
  SET_VALUE,
}

export class Score extends Text {
  private scoreValue: number;
  private killsValue: number;
  private millis : number;

  get currentScore() : number {
    return this.scoreValue;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, initScore = 0, initKills = 0) {
    super(scene, x, y, `Score: ${initScore} Kills: ${initKills} Time: 0:00`);

    scene.add.existing(this);

    this.scoreValue = initScore;
    this.killsValue = initKills;
    this.millis = 0;
  }

  private updateLabel() : void {
    let seconds = Math.trunc(this.millis / 1000) % 60;
    let minutes = Math.trunc(this.millis / 60000) % 60;
    let secondsStr = seconds.toString().padStart(2, '0');
    this.setText(`Score: ${this.scoreValue} Kills: ${this.killsValue} Time: ${minutes}:${secondsStr}`);
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
  }

  update(timeInMillis : number) : void {
    this.millis = timeInMillis;
    this.updateLabel();
  }

  public updateScore() : void {
    let multiplier = 1;
    if(this.millis < 60000) {
      multiplier = 3;
    } else if (this.millis < 120000) {
      multiplier = 2;
    }

    this.scoreValue += multiplier * this.killsValue;
  }

}