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

    private enemyGroup !: Phaser.GameObjects.Group;
    private bulletGroup !: Phaser.GameObjects.Group;
    
    constructor() {
        super('level-1-scene');
    }

    create() : void {
        this.initMap();

        // Create the player
        this.player = new Player(this, 350, 350);
        this.physics.add.collider(this.player, this.wallsLayer);

        this.sound.add('fireAutoRifle');
        this.sound.add('bulletHitWall');

        this.initChests();
        this.initCamera();
        this.initEnemies();
        this.initBullets();
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

        // this.showDebugWalls();
    }

    public addEnemy(enemy : Enemy) : void {
      this.enemyGroup.add(enemy, true);
      this.physics.add.existing(enemy);
    }

    public addBullet(bullet : Bullet) : void {
      this.bulletGroup.add(bullet, true);
      this.physics.add.existing(bullet);
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
          this.physics.add.sprite(chestPoint.x, chestPoint.y, 'item_spr', 155),
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

    private initBullets() : void {
      this.bulletGroup = this.add.group();

      // Bullets collide with enemies
      this.physics.add.collider(this.bulletGroup, this.enemyGroup, (bullet, enemy) => {
        (bullet as Bullet).onHitEnemy(enemy as Enemy);
      });

      // Bullets collide with walls
      this.physics.add.collider(this.bulletGroup, this.wallsLayer, (bullet) => {
        (bullet as Bullet).onHitWall();
      })
    }

    private initEnemies(): void {
      this.enemyGroup = this.add.group();

      // Spawn initial enemies
      const enemiesPoints = gameObjectsToObjectPoints(
        this.map.filterObjects('Enemies', (obj) => obj.name === 'EnemyPoint'),
      );
    
      enemiesPoints.forEach((enemyPoint) =>
        this.addEnemy(
          new Enemy(this, enemyPoint.x, enemyPoint.y, 'enemy_spr', this.player, 60)
            .setName(enemyPoint.id.toString())
        )
      );
    
      // Enemies collide with walls, other enemies, and the player
      this.physics.add.collider(this.enemyGroup, this.wallsLayer);
      this.physics.add.collider(this.enemyGroup, this.enemyGroup);
      this.physics.add.collider(this.player, this.enemyGroup, (player, enemy) => {
        (player as Player).getDamage(1);
      });
    }
}