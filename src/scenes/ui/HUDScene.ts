import { Scene } from 'phaser';

import { Score, ScoreOperations } from '../../classes/score';
import { EVENTS_NAME, GameStatus } from '../../consts';
import { Text } from '../../classes/text';
import { gameConfig } from '../..';
import { Weapon } from '../../classes/Weapon';

export class HUDScene extends Scene {
  private score!: Score;
  
  private chestLootHandler: () => void;

  private gameEndPhrase!: Text;
  private gameEndHandler: (status: GameStatus) => void;

  private hpValue !: Text;
  private hpValueHandler : (count: number) => void;

  private ammoCount !: Text;
  private ammoCountHandler : (count: number) => void;

  private curWeapon !: Text;
  private weaponSwapHandler : (weapon : Weapon) => void;

  constructor() {
    super('ui-scene');
    this.chestLootHandler = () => {
        this.score.changeValue(ScoreOperations.INCREASE, 10);
        if (this.score.getValue() === gameConfig.winScore) {
            this.game.events.emit(EVENTS_NAME.gameEnd, 'win');
        }
    }

    this.gameEndHandler = (status) => {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
        this.game.scene.pause('level-1-scene');
    
        this.gameEndPhrase = new Text(
          this,
          this.game.scale.width / 2,
          this.game.scale.height * 0.4,
          status === GameStatus.LOSE
            ? `WASTED!\nCLICK TO RESTART`
            : `YOU ARE ROCK!\nCLICK TO RESTART`,
        )
          .setAlign('center')
          .setColor(status === GameStatus.LOSE ? '#ff0000' : '#ffffff');
    
        this.gameEndPhrase.setPosition(
          this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
          this.game.scale.height * 0.4,
        );

        this.input.on('pointerdown', () => {
            this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler);
            this.game.events.off(EVENTS_NAME.gameEnd, this.gameEndHandler);
            this.scene.get('level-1-scene').scene.restart();
            this.scene.restart();
        });
    };

    this.ammoCountHandler = (count) => {
      this.ammoCount.setText(`Ammo: ${count}`);
    }

    this.weaponSwapHandler = (weapon : Weapon) => {
      this.curWeapon.setText(weapon.name);
    }

    this.hpValueHandler = (hpValue) => {
      this.hpValue.setText(`Health: ${hpValue}`);
    }
  }

  create(): void {
    this.score = new Score(this, 20, 20, 0);
    this.hpValue = new Text (this, 20, 100, 'Health: ???');
    this.curWeapon = new Text(this, 20, 180, '???');
    this.ammoCount = new Text(this, 20, 260, 'Ammo: ???');
    this.initListeners();
  }

  private initListeners(): void {
    this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this);
    this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
    this.game.events.on(EVENTS_NAME.ammoCount, this.ammoCountHandler, this);
    this.game.events.on(EVENTS_NAME.weaponSwap, this.weaponSwapHandler, this);
    this.game.events.on(EVENTS_NAME.playerHp, this.hpValueHandler, this);
  }
}