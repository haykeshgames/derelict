import { Room } from '@mikewesthad/dungeon';
import { Tilemaps, Utils } from 'phaser';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { GreenTank } from './GreenTank';
import { Spawner } from './Spawner';
import { Chest } from './Chest';
import { Door } from './Door';
import { Enemy } from './enemy';
import { EVENTS_NAME } from '../consts';

export class DungeonRoom extends Phaser.GameObjects.GameObject {
    private groundLayer: Tilemaps.TilemapLayer;
    private doors: Array<Door>;
    private stuffLayer: Tilemaps.TilemapLayer;
    private shadowLayer: Tilemaps.TilemapLayer;
    private isFinished : boolean;
    public room: Room;
    private spawners: Array<Spawner> = [];
    private enemies: Array<Enemy> = [];

    private enemyDeathHandler : (enemy : Enemy) => void;
    private enemyAddedHandler : (enemy : Enemy) => void;
    private roomClearedHandler : (room : DungeonRoom) => void;

    get isFinishedSpawning() : boolean {
        if(this.isFinished) {
            return this.isFinished;
        }

        this.isFinished = this.spawners.every((spawner) => {
            return spawner.isFinishedSpawning;
        });

        return this.isFinished;
    }

    setActive(active: boolean): this {
        if (this.active === active) return this;

        if (!this.active && active) {
            this.onActivate();
        } else if (this.active && !active) {
            this.onDeactivate();
        }

        super.setActive(active);

        return this;
    }

    constructor(
        room: Room,
        scene: DungeonScene,
        groundLayer: Tilemaps.TilemapLayer,
        doors: Array<Door>,
        stuffLayer: Tilemaps.TilemapLayer,
        shadowLayer: Tilemaps.TilemapLayer
    ) {
        super(scene, 'dungeonRoom');
        
        scene.add.existing(this);
        
        this.room = room;
        this.groundLayer = groundLayer;
        this.doors = doors;
        this.stuffLayer = stuffLayer;
        this.shadowLayer = shadowLayer;
        this.isFinished = false;
        
        // Generate some spawners in the room
        const numSpawners = Phaser.Math.Between(1, 3);
        for (let i = 0; i < numSpawners; i++) {
            const { x, y } = this.getRandomTile();
            this.groundLayer.putTileAt(73, x, y);
            
            const worldX = this.groundLayer.tileToWorldX(x),
                worldY = this.groundLayer.tileToWorldY(y);
            
            this.spawners.push(new Spawner(scene, worldX, worldY));
        }

        // Fill the room with other stuff
        const { x, y } = this.getRandomTile();
        this.addGreenTank(x, y);
        
        super.setActive(false);

        this.enemyDeathHandler = (enemy : Enemy) => {
            const index = this.enemies.indexOf(enemy);
            if(index === -1) {
                return;
            }

            this.enemies.splice(index, 1);

            if(this.enemies.length === 0 && this.isFinishedSpawning) {
                this.scene.game.events.emit(EVENTS_NAME.roomCleared, this);
            }
        }

        this.enemyAddedHandler = (enemy : Enemy) => {
            // return if enemy in array
            if(this.enemies.indexOf(enemy) > -1) {
                return;
            }

            const {x, y} = this.groundLayer.worldToTileXY(enemy.x, enemy.y);

            // only add to the enemies array if in the room
            if(room.isInBounds(x - room.x, y - room.y)) {
                this.enemies.push(enemy);
            }
        }

        this.roomClearedHandler = (room : DungeonRoom) => {
            if(room !== this) {
                return;
            }

            this.setRoomClear();
        }

        this.scene.game.events.on(EVENTS_NAME.enemyDeath, this.enemyDeathHandler);
        this.scene.game.events.on(EVENTS_NAME.enemyAdded, this.enemyAddedHandler);
        this.scene.game.events.on(EVENTS_NAME.roomCleared, this.roomClearedHandler);
    }
    
    private getRandomTile() {
        return {
            x: Phaser.Math.Between(this.room.left + 2, this.room.right - 2),
            y: Phaser.Math.Between(this.room.top + 2, this.room.bottom - 2)
        };
    }
    
    private addGreenTank(tileX: number, tileY: number) {
        // Put a tile here for collision
        this.stuffLayer.putTileAt(106, tileX, tileY);
        
        
        const worldX = this.stuffLayer.tileToWorldX(tileX),
            worldY = this.stuffLayer.tileToWorldY(tileY);
            
        new GreenTank(this.scene as DungeonScene, worldX, worldY);
    }

    public maybeCreateChests() : Chest[] {
        const numChests = Phaser.Math.Between(0, 1);
        let chests = []
        for (let i = 0; i < numChests; i++) {
            const { x, y } = this.getRandomTile();

            const worldX = this.stuffLayer.tileToWorldX(x),
                worldY = this.stuffLayer.tileToWorldY(y);
            
            chests.push(new Chest(this.scene as DungeonScene, worldX, worldY));
        }

        return chests;
    }

    private onActivate(): void {
        // We are becoming active - brighten us up
        this.setRoomAlpha(0);
        this.spawners.forEach((it) => it.setPaused(false));

        if(this.isFinished) {
            return;
        }

        setTimeout(() => {
            this.doors.forEach((door) => {
                let doorSpr = door as Door;
                doorSpr.setOpen(false);
            });
        }, 2000);
    }

    private onDeactivate(): void {
        // We are going inactive - darken us
        this.setRoomAlpha(0.8);
        this.spawners.forEach((it) => it.setPaused(true));
    }

    private setRoomAlpha(alpha: number): void {
        const { x, y, width, height } = this.room;
        this.shadowLayer.forEachTile(
            (tile) => (tile.alpha = alpha),
            this,
            x,
            y,
            width,
            height
        );
    }

    private setRoomClear() {
        this.doors.forEach((door) => {
            let doorSpr = door as Door;
            doorSpr.setOpen(true);
        });
    }

    public addEnemy(enemy : Enemy) {
        this.enemies.push(enemy);
    }
}
