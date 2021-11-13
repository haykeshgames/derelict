import Dungeon, { TILES } from '@mikewesthad/dungeon';
import { Scene, Tilemaps } from 'phaser';
import { Bullet } from '../../classes/Bullet';
import { DungeonRoom } from '../../classes/DungeonRoom';
import { Enemy } from '../../classes/enemy';
import { Player } from '../../classes/Player';

export class DungeonScene extends Scene {
    private dungeon!: Dungeon;
    private map!: Tilemaps.Tilemap;
    private groundLayer!: Tilemaps.TilemapLayer;
    private wallLayer!: Tilemaps.TilemapLayer;
    private shadowLayer!: Tilemaps.TilemapLayer;

    private player!: Player;

    private enemyGroup!: Phaser.GameObjects.Group;
    private bulletGroup!: Phaser.GameObjects.Group;
    
    private dungeonRooms: Array<DungeonRoom> = [];
    
    constructor() {
        super('dungeon-scene');
    }

    public addEnemy(enemy: Enemy): void {
        this.enemyGroup.add(enemy, true);
        this.physics.add.existing(enemy);
    }

    public addBullet(bullet: Bullet): void {
        this.bulletGroup.add(bullet, true);
        this.physics.add.existing(bullet);
    }

    create(): void {
        this.initMap();
        this.initPlayer();
        this.initEnemies();
        this.initBullets();
        this.initCamera();
    }
    
    update(): void {
        this.player.update();
        
        // Figure out which room the player is in
        const playerX = this.groundLayer.worldToTileX(this.player.x),
            playerY = this.groundLayer.worldToTileY(this.player.y),
            activeRoom = this.dungeon.getRoomAt(playerX, playerY);
        
        this.dungeonRooms.forEach(it => it.update(activeRoom));
    }
    
    initPlayer() {
        this.player = new Player(
            this,
            this.map.widthInPixels / 2,
            this.map.heightInPixels / 2
        );
        this.physics.add.collider(this.player, this.wallLayer);
    }
    
    initEnemies() {
        this.enemyGroup = this.add.group();
    }

    initBullets() {
        this.bulletGroup = this.add.group();

        // Bullets collide with enemies
        this.physics.add.collider(
            this.bulletGroup,
            this.enemyGroup,
            (bullet, enemy) => {
                (bullet as Bullet).onHitEnemy(enemy as Enemy);
            }
        );

        // Bullets collide with walls
        this.physics.add.collider(
            this.bulletGroup,
            this.wallLayer,
            (bullet) => {
                (bullet as Bullet).onHitWall();
            }
        );
    }

    initMap() {
        this.dungeon = new Dungeon({
            width: 50,
            height: 50,
            doorPadding: 3,
            rooms: {
                width: { min: 7, max: 15, onlyOdd: true },
                height: { min: 7, max: 15, onlyOdd: true },
                maxRooms: 12
            }
        });

        const map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: this.dungeon.width,
            height: this.dungeon.height
        });

        const tileset = map.addTilesetImage(
            'space-tiles-32-32',
            'space-tiles-32-32',
            32,
            32
        );
        
        const groundLayer = map.createBlankLayer('Ground', tileset),
            wallLayer = map.createBlankLayer('Walls', tileset),
            stuffLayer = map.createBlankLayer('Stuff', tileset),
            shadowLayer = map.createBlankLayer('Shadow', tileset).fill(71);
        
        this.dungeon.rooms.forEach((room) => {
            const { x, y, width, height, left, right, top, bottom } = room,
                dungeonRoom = new DungeonRoom(room, this, this.player, shadowLayer);
                
            this.dungeonRooms.push(dungeonRoom);
            
            // Generate floor tiles in the room
            // Mostly the primary empty floor time, somtimes an alternate for detail
            groundLayer.weightedRandomize(
                [
                    { index: 71, weight: 9 }, // primary floor tile
                    { index: [106, 70], weight: 1 } // secondary floor tiles
                ],
                x + 1, // avoid the left wall
                y + 1, // avoid the top wall
                width - 2, // avoid the right wall
                height - 2 // avoid the bottom wall
            );

            // Corner walls
            wallLayer.putTileAt(341, left, top); // top left corner
            wallLayer.putTileAt(335, right, top); // top right corner
            wallLayer.putTileAt(39, right, bottom); // bottom left corner
            wallLayer.putTileAt(45, left, bottom); // bottom right corner

            // Non-corner walls
            wallLayer.fill(5, left + 1, top, width - 2, 1); // top
            wallLayer.fill(375, left + 1, bottom, width - 2, 1); // bottom
            wallLayer.fill(83, left, top + 1, 1, height - 2); // left
            wallLayer.fill(75, right, top + 1, 1, height - 2); // right

            // Doors
            const doors = room.getDoorLocations();
            doors.forEach((doorLoc) => {
                const { x: doorX, y: doorY } = doorLoc;
                if (doorY === 0) {
                    // Top Door
                    wallLayer.putTileAt(71, x + doorX - 1, y + doorY); // door/path
                    wallLayer.putTileAt(378, x + doorX - 2, y + doorY); // left wall connector
                    wallLayer.putTileAt(372, x + doorX, y + doorY); // right wall connector
                } else if (doorY === height - 1) {
                    // Bottom Door
                    wallLayer.putTileAt(71, x + doorX - 1, y + doorY); // door/path
                    wallLayer.putTileAt(8, x + doorX - 2, y + doorY); // left wall connector
                    wallLayer.putTileAt(2, x + doorX, y + doorY); // right wall connector
                } else if (doorX === 0) {
                    // Left Door
                    wallLayer.putTileAt(71, x + doorX, y + doorY - 1); // door/path
                    wallLayer.putTileAt(80, x + doorX, y + doorY - 2); // top wall connector
                    wallLayer.putTileAt(302, x + doorX, y + doorY); // top wall connector
                } else if (doorX === width - 1) {
                    // Right Door
                    wallLayer.putTileAt(71, x + doorX, y + doorY - 1);
                    wallLayer.putTileAt(78, x + doorX, y + doorY - 2); // top wall connector
                    wallLayer.putTileAt(300, x + doorX, y + doorY); // top wall connector
                }
            });
        });

        // Collide with everything except empty tiles or floor tiles
        wallLayer.setCollisionByExclusion([71, -1]);

        this.map = map;
        this.wallLayer = wallLayer;
        this.shadowLayer = shadowLayer;
        this.groundLayer = groundLayer;

        // this.showDebugWalls();
    }

    private showDebugWalls(): void {
        const debugGraphics = this.add.graphics().setAlpha(0.5);
        this.wallLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255)
        });
    }

    private initCamera(): void {
        this.cameras.main.setSize(
            this.game.scale.width,
            this.game.scale.height
        );
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(2);
    }
}
