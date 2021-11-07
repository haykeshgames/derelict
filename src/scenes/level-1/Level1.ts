import { GameObjects, Scene, Tilemaps } from "phaser";
import { Player } from "../../classes/Player";

export class Level1 extends Scene {
    private player !: Player;
    private map !: Tilemaps.Tilemap;
    private tileSet !: Tilemaps.Tileset;
    private groundLayer !: Tilemaps.TilemapLayer;
    private wallsLayer !: Tilemaps.TilemapLayer;
    private chests !: Phaser.GameObjects.Sprite[];
    
    constructor() {
        super('level-1-scene');
    }

    create() : void {
        this.initMap();

        // Create the player
        this.player = new Player(this, 100, 100);
        this.physics.add.collider(this.player, this.wallsLayer);
    }

    update() : void {
        this.player.update();
    }

    initMap() : void {
        this.map = this.make.tilemap({key: 'dungeon', tileWidth: 16, tileHeight: 16});
        this.tileSet = this.map.addTilesetImage('dungeon', 'tiles')
        this.groundLayer = this.map.createLayer('Ground', this.tileSet, 0, 0);
        this.wallsLayer = this.map.createLayer('Walls', this.tileSet, 0, 0);
        this.wallsLayer.setCollisionByProperty({collides: true});

        this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);

        this.showDebugWalls();
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
            obj2.destroy();
            this.cameras.main.flash();
          });
        });
    }
}