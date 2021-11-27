import Dungeon from '@mikewesthad/dungeon';
import { Scene, Tilemaps } from 'phaser';
import { DOOR_TYPE, EVENTS_NAME, GameStatus } from '../../consts';
import { Bullet } from '../../classes/Bullet';
import { DungeonRoom } from '../../classes/DungeonRoom';
import { Enemy } from '../../classes/enemy';
import { Player } from '../../classes/Player';
import { Chest } from '../../classes/Chest';
import { Door } from '../../classes/Door';

export class DungeonScene extends Scene {
    private dungeon!: Dungeon;
    private map!: Tilemaps.Tilemap;
    public groundLayer!: Tilemaps.TilemapLayer;
    private wallLayer!: Tilemaps.TilemapLayer;
    private stuffLayer!: Tilemaps.TilemapLayer;
    private shadowLayer!: Tilemaps.TilemapLayer;

    public player!: Player;

    private enemyGroup!: Phaser.GameObjects.Group;
    private bulletGroup!: Phaser.GameObjects.Group;
    private chestGroup!: Phaser.GameObjects.Group;
    private doorGroup!: Phaser.GameObjects.Group;

    private dungeonRooms: Array<DungeonRoom> = [];
    private activeDungeonRoom!: DungeonRoom | null | undefined;

    get isFinishedSpawning() : boolean {
        return this.dungeonRooms.every((room) => {
            return room.isFinishedSpawning;
        });
    }

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

    public addChest(chest: Chest) : void {
        this.chestGroup.add(chest, true);
        this.physics.add.existing(chest);
    }

    create(): void {
        this.activeDungeonRoom = undefined;
        this.dungeonRooms = [];
        this.initMap();
        this.initPlayer();
        this.initEnemies();
        this.initBullets();
        this.initCamera();
        this.initChests();
    }

    update(): void {
        this.player.update();

        // Figure out which room the player is in
        const playerX = this.groundLayer.worldToTileX(this.player.x),
            playerY = this.groundLayer.worldToTileY(this.player.y),
            activeRoom = this.dungeon.getRoomAt(playerX, playerY),
            activeDungeonRoom = this.dungeonRooms.find(
                (it) => it.room === activeRoom
            );
        
        if (this.activeDungeonRoom !== activeDungeonRoom) {
            this.activeDungeonRoom?.setActive(false);
            activeDungeonRoom?.setActive(true);
            this.activeDungeonRoom = activeDungeonRoom;
        }

        if(this.isFinishedSpawning && this.enemyGroup.getLength() === 0) {
            this.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.WIN);
        }
    }
    
    initPlayer() {
        this.player = new Player(
            this,
            this.map.widthInPixels / 2,
            this.map.heightInPixels / 2
        );
        this.physics.add.collider(this.player, this.wallLayer);
        this.physics.add.collider(this.player, this.stuffLayer);
        this.physics.add.collider(this.player, this.doorGroup);
    }

    initEnemies() {
        this.enemyGroup = this.add.group();
        this.physics.add.collider(this.enemyGroup, this.enemyGroup);
        this.physics.add.collider(
            this.player,
            this.enemyGroup,
            (player) => {
                (player as Player).getDamage(1);
            }
        );
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

        // Bullets collide with walls
        this.physics.add.collider(
            this.bulletGroup,
            this.stuffLayer,
            (bullet) => {
                (bullet as Bullet).onHitWall();
            }
        );
    }

    initChests() {
        this.chestGroup = this.add.group();
        this.physics.add.overlap(
            this.player, 
            this.chestGroup, 
            (p, chest) => {
                const player = p as Player;
                if(player.weapon.name !== 'AutoRifle') {
                    player.swapWeapons();
                }
                player.addAmmo(30);
                player.reloadWeapon();

                chest.destroy();
                this.cameras.main.flash();
                this.sound.play('pickup');
            }
        );

        this.dungeonRooms.forEach((room) => {
            const chests = room.maybeCreateChests();
            chests.forEach((chest) => {
                this.addChest(chest);
            })
        });
    }

    initMap() {
        this.doorGroup = this.add.group();
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

        const wallFloorTileset = map.addTilesetImage('space-tiles-32-32-updated');

        const groundLayer = map.createBlankLayer('Ground', wallFloorTileset),
            wallLayer = map.createBlankLayer('Walls', wallFloorTileset),
            stuffLayer = map.createBlankLayer('Stuff', wallFloorTileset),
            shadowLayer = map.createBlankLayer('Shadow', wallFloorTileset).fill(107);
        
        // Shadows cover everything
        shadowLayer.setDepth(999);

        this.map = map;
        this.wallLayer = wallLayer;
        this.stuffLayer = stuffLayer;
        this.shadowLayer = shadowLayer;
        this.groundLayer = groundLayer;

        this.dungeon.rooms.forEach((room) => {
            const { x, y, width, height, left, right, top, bottom } = room;

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
            
            let doorArray = new Array<Door>();
            doors.forEach((doorLoc) => {
                const { x: doorX, y: doorY } = doorLoc;
                if (doorY === 0) {
                    // Top Door
                    groundLayer.putTileAt(71, x + doorX - 1, y + doorY);
                    wallLayer.putTileAt(71, x + doorX - 1, y + doorY); // poke a hole in the wall
                    wallLayer.putTileAt(377, x + doorX - 2, y + doorY); // left wall connector
                    wallLayer.putTileAt(373, x + doorX, y + doorY); // right wall connector
                    
                    const worldX = this.wallLayer.tileToWorldX(x + doorX - 1),
                        worldY = this.wallLayer.tileToWorldY(y + doorY);
                    let doorSpr = new Door(this, worldX, worldY, DOOR_TYPE.NORTH);
                    this.doorGroup.add(doorSpr);
                    doorArray.push(doorSpr);
                } else if (doorY === height - 1) {
                    // Bottom Door
                    groundLayer.putTileAt(71, x + doorX - 1, y + doorY + 1);
                    wallLayer.putTileAt(71, x + doorX - 1, y + doorY); // poke a hole in the wall
                    wallLayer.putTileAt(7, x + doorX - 2, y + doorY); // left wall connector
                    wallLayer.putTileAt(3, x + doorX, y + doorY); // right wall connector

                    const worldX = this.wallLayer.tileToWorldX(x + doorX - 1),
                        worldY = this.wallLayer.tileToWorldY(y + doorY);
                    
                    let doorSpr = new Door(this, worldX, worldY, DOOR_TYPE.SOUTH);
                    this.doorGroup.add(doorSpr);
                    doorArray.push(doorSpr);
                } else if (doorX === 0) {
                    // Left Door
                    groundLayer.putTileAt(71, x + doorX, y + doorY - 1);
                    wallLayer.putTileAt(71, x + doorX, y + doorY - 1); // poke a hole in the wall
                    wallLayer.putTileAt(306, x + doorX, y + doorY - 2); // top wall connector
                    wallLayer.putTileAt(231, x + doorX, y + doorY); // top wall connector

                    const worldX = this.wallLayer.tileToWorldX(x + doorX),
                        worldY = this.wallLayer.tileToWorldY(y + doorY - 1);
                
                    let doorSpr = new Door(this, worldX, worldY, DOOR_TYPE.WEST);
                    this.doorGroup.add(doorSpr);
                    doorArray.push(doorSpr);
                } else if (doorX === width - 1) {
                    // Right Door
                    groundLayer.putTileAt(71, x + doorX, y + doorY - 1);
                    wallLayer.putTileAt(71, x + doorX, y + doorY - 1); // poke a hole in the wall
                    wallLayer.putTileAt(296, x + doorX, y + doorY - 2); // top wall connector
                    wallLayer.putTileAt(223, x + doorX, y + doorY); // top wall connector
                    const worldX = this.wallLayer.tileToWorldX(x + doorX),
                        worldY = this.wallLayer.tileToWorldY(y + doorY - 1);
                
                    let doorSpr = new Door(this, worldX, worldY, DOOR_TYPE.EAST);
                    this.doorGroup.add(doorSpr);
                    doorArray.push(doorSpr);
                }
            });
            
            // Once we've setup the ground and walls, init the room to spawn other stuff in as well
            this.dungeonRooms.push(
                new DungeonRoom(
                    room,
                    this,
                    groundLayer,
                    doorArray,
                    stuffLayer,
                    shadowLayer
                )
            );
        });

        // Collide with everything except empty tiles or floor tiles
        wallLayer.setCollisionByExclusion([71, -1]);
        stuffLayer.setCollisionByExclusion([-1]);

        this.physics.world.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
    }

    private showDebugWalls(): void {
        const debugGraphics = this.add.graphics().setAlpha(0.5);
        this.wallLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255)
        });
    }

    private initCamera(): void {
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
    }
}
