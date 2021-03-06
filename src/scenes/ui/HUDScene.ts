import { Scene, GameObjects, Tweens } from 'phaser';

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

  private hpLabel !: Text;
  private hpValueHandler : (count: number) => void;
  private hpBars !: GameObjects.Rectangle[];
  private hpTweens !: Tweens.Tween[];
  
  private ammoCount !: Text;
  private ammoBars !: GameObjects.Rectangle[];
  private ammoTweens !: Tweens.Tween[];
  private ammoCountHandler : (count: number) => void;

  private playerFireHandler : (bulletsLeft: number) => void;
  private playerReloadHandler : (bulletsLoaded: number) => void;

  private curWeapon !: Text;
  private weaponSwapHandler : (weapon : Weapon) => void;

  private enemyDeathHandler : () => void;
  private levelDone : boolean;
  private startTime : number;
  private lastScore : number;

  constructor() {
    super('ui-scene');
    this.chestLootHandler = () => {};

    this.gameEndHandler = (status) => {
        this.levelDone = true;
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)');
        this.game.scene.pause('dungeon-scene');
    
        if(status === GameStatus.WIN) {
          this.score.updateScore();
          this.lastScore = this.score.currentScore;
        } else {
          this.lastScore = 0;
        }

        this.gameEndPhrase = new Text(
          this,
          this.game.scale.width / 2,
          this.game.scale.height * 0.4,
          status === GameStatus.LOSE
            ? `WASTED!\nSCORE: ${this.score.currentScore}\nCLICK TO RESTART`
            : `LEVEL CLEAR!\nSCORE: ${this.score.currentScore}\nCLICK TO RESTART`,
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
            this.game.events.off(EVENTS_NAME.ammoCount, this.ammoCountHandler);
            this.game.events.off(EVENTS_NAME.playerFire, this.playerFireHandler);
            this.game.events.off(EVENTS_NAME.playerReload, this.playerReloadHandler);
            this.game.events.off(EVENTS_NAME.weaponSwap, this.weaponSwapHandler);
            this.game.events.off(EVENTS_NAME.playerHp, this.hpValueHandler);
            this.game.events.off(EVENTS_NAME.enemyDeath, this.enemyDeathHandler);
            
            // FIXME this is to try and prevent the click from registering as a weapon fire, but can cause multiple restarts
            setTimeout(() => {
              this.scene.get('dungeon-scene').scene.restart();
              this.scene.restart();
              this.levelDone = false;
              this.startTime = this.time.now;
            }, 100);
        });
    };

    this.ammoCountHandler = (count) => {
      if(count === -1) {
        this.ammoCount.setText("???");
        return;
      }

      this.ammoCount.setText(`${count}`);
    }

    this.playerFireHandler = (bulletsLeft : number) => {
      this.ammoTweens[bulletsLeft].play();
    }

    this.playerReloadHandler = (bulletsLoaded : number) => {
      for(let i = 0; i < this.ammoBars.length; i++) {
        if(this.ammoTweens[i].isPlaying()) {
          this.ammoTweens[i].stop();
        }
        if (i < bulletsLoaded) {
          this.ammoBars[i].setAlpha(1);
        } else {
          this.ammoBars[i].setAlpha(0);
        }
      }
    }

    this.weaponSwapHandler = (weapon : Weapon) => {
      this.curWeapon.setText(weapon.name);
      this.ammoCountHandler(weapon.ammo);
      this.playerReloadHandler(weapon.clip);
    }

    this.hpValueHandler = (hpValue : number) => {
      for(let i = 0; i < this.hpBars.length; i++) {
        if (i < hpValue) {
          this.hpBars[i].setAlpha(1);
        } else {
          this.hpBars[i].setAlpha(0);
        }
      }
    }

    this.enemyDeathHandler = () => {
      this.score.changeKills(ScoreOperations.INCREASE, 1);
    }

    this.levelDone = false;
    this.startTime = 0;
    this.lastScore = 0;
  }

  create(): void {
    this.score = new Score(this, 20, 20, this.lastScore, 0);
    this.hpLabel = new Text (this, 20, 40, 'Health');
    this.curWeapon = new Text(this, 20, 60, '???');
    this.ammoCount = new Text(this, 150, 60, '???');
    this.ammoBars = [];
    this.ammoTweens = [];
    this.hpBars = [];
    this.hpTweens = [];

    this.createAmmoBar();
    this.createHealthBar();

    this.initListeners();
    this.startTime = this.time.now;
  }

  update() : void {
    if(!this.levelDone) {
      this.score.update(this.time.now - this.startTime);
    }
  }

  private initListeners(): void {
    this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this);
    this.game.events.on(EVENTS_NAME.gameEnd, this.gameEndHandler, this);
    this.game.events.on(EVENTS_NAME.ammoCount, this.ammoCountHandler, this);
    this.game.events.on(EVENTS_NAME.playerFire, this.playerFireHandler, this);
    this.game.events.on(EVENTS_NAME.playerReload, this.playerReloadHandler, this);
    this.game.events.on(EVENTS_NAME.weaponSwap, this.weaponSwapHandler, this);
    this.game.events.on(EVENTS_NAME.playerHp, this.hpValueHandler, this);
    this.game.events.on(EVENTS_NAME.enemyDeath, this.enemyDeathHandler, this);
  }

  private createAmmoBar() : void {
    // store the bars in a list for later
    const height = 20;
    const width = 5;

    // create 30 bars
    for (let i = 0; i < 30; i++)
    {
      // create each bar with position, rotation, and alpha
      const bar = this.add.rectangle(220+(width*i), 72, width, height, 0xffffff, 1)
        .setStrokeStyle(1, 0x000000);

      this.ammoBars.push(bar)
    }

    this.initAmmoAnimations();
  }

  private initAmmoAnimations() : void {
    for (let i = 0; i < 30; i++) {
      // make a new tween for the current bar
      const bar = this.ammoBars[i];
      const tween = this.tweens.add({
        targets: bar,
        alpha: 0,
        paused: true, 
        duration: 100
      })

      this.ammoTweens.push(tween);
    }
  }

  private createHealthBar() : void {
    // store the bars in a list for later
    const height = 20;
    const width = 5;

    // create 100 bars
    for (let i = 0; i < 100; i++)
    {
      // create each bar with position, rotation, and alpha
      const bar = this.add.rectangle(220+(width*i), 52, width, height, 0xff0000, 1)
        .setStrokeStyle(1, 0x000000);

      this.hpBars.push(bar);
    }

    this.initHealthAnimations();
  }

  private initHealthAnimations() : void {
    for (let i = 0; i < 100; i++) {
      // make a new tween for the current bar
      const bar = this.hpBars[i];
      const tween = this.tweens.add({
        targets: bar,
        alpha: 0,
        paused: true, 
        duration: 100
      })

      this.hpTweens.push(tween);
    }
  }
}