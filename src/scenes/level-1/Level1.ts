import { GameObjects, Scene, Tilemaps } from "phaser";
import { Player } from "../../classes/Player";
import { gameObjectsToObjectPoints } from '../../helpers/gameobject-to-object-point';
import { EVENTS_NAME } from "../../consts";
import { Enemy } from "../../classes/enemy";
import { Bullet } from '../../classes/Bullet';

export class Level1 extends Scene {
    private player !: Player;
    private map !: Tilemaps.Tilemap;
    private tileSet !: Tilemaps.Tileset;
    private groundLayer !: Tilemaps.TilemapLayer;
    private wallsLayer !: Tilemaps.TilemapLayer;
    private chests !: Phaser.GameObjects.Sprite[];
    private enemies !: Enemy[];
    
    constructor() {
        super('level-1-scene');
    }

    create() : void {
        this.initMap();

        // Create the player
        this.player = new Player(this, 350, 350);
        this.physics.add.collider(this.player, this.wallsLayer);

        this.initChests();

        this.initCamera();

        this.initEnemies();
    }

    update() : void {
        this.player.update();
    }

    initMap() : void {
        this.map = this.make.tilemap({key: 'ship', tileWidth: 32, tileHeight: 32});
        this.tileSet = this.map.addTilesetImage('space-tiles-32-32', 'space-tiles-32-32')
        this.groundLayer = this.map.createLayer('Ground', this.tileSet, 0, 0);
        this.wallsLayer = this.map.createLayer('Walls', this.tileSet, 0, 0);
        this.wallsLayer.setCollisionByProperty({collides: true});

        this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);

        this.showDebugWalls();
    }

    spawnBullet(x: number, y: number, direction: Phaser.Math.Vector2) {
      const bullet = new Bullet(this, x, y, direction, 'projectile_spr', 15)
      .setScale(0.8)
      .setName(`bullet_${Date.now()}`);

      this.sound.play('fire');

      this.physics.add.collider(bullet, this.enemies, (bullet, enemy) => {
          enemy.destroy();
          bullet.destroy();
          this.sound.play('death');

          this.enemies = this.enemies.filter(it => it !== enemy);
      });

      return bullet;
    }

    private showDebugWalls() : void {
        const debugGraphics = this.add.graphics().setAlpha(0.5);
        this.wallsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255)
        })
    }

    private initChests(): void {
        const chestPoints = gameObjectsToObjectPoints(
          this.map.filterObjects('Chests', obj => obj.name === 'ChestPoint'),
        );
      
        this.chests = chestPoints.map(chestPoint =>
          this.physics.add.sprite(chestPoint.x, chestPoint.y, 'tiles_spr', 595).setScale(1.5),
        );
      
        this.chests.forEach(chest => {
          this.physics.add.overlap(this.player, chest, (obj1, obj2) => {
            this.game.events.emit(EVENTS_NAME.chestLoot);
            obj2.destroy();
            this.cameras.main.flash();
            this.sound.play('pickup');
          });
        });
    }

    private initCamera(): void {
      this.cameras.main.setSize(this.game.scale.width, this.game.scale.height);
      this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
      this.cameras.main.setZoom(2);
    }

    private initEnemies(): void {
      const enemiesPoints = gameObjectsToObjectPoints(
        this.map.filterObjects('Enemies', (obj) => obj.name === 'EnemyPoint'),
      );
    
      this.enemies = enemiesPoints.map((enemyPoint) =>
        new Enemy(this, enemyPoint.x, enemyPoint.y, 'tiles_spr', this.player, 503)
          .setName(enemyPoint.id.toString())
          .setScale(1.5),
      );
    
      this.physics.add.collider(this.enemies, this.wallsLayer);
      this.physics.add.collider(this.enemies, this.enemies);
      this.physics.add.collider(this.player, this.enemies, (obj1, obj2) => {
        (obj1 as Player).getDamage(1);
      });
    }
}