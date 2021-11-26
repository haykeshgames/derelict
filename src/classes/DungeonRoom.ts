import { Room } from '@mikewesthad/dungeon';
import { Tilemaps, Utils } from 'phaser';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { GreenTank } from './GreenTank';
import { Player } from './Player';
import { Spawner } from './Spawner';
import { Chest } from './Chest';
import { Door } from './Door';

export class DungeonRoom extends Phaser.GameObjects.GameObject {
    private groundLayer: Tilemaps.TilemapLayer;
    private doorGroup: Phaser.GameObjects.Group;
    private stuffLayer: Tilemaps.TilemapLayer;
    private shadowLayer: Tilemaps.TilemapLayer;
    private player: Player;
    private isFinished : boolean;
    public room: Room;
    private spawners: Array<Spawner> = [];


    get isFinishedSpawning() : boolean {
        if(this.isFinished) {
            return this.isFinished;
        }

        this.isFinished = this.spawners.every((spawner) => {
            return spawner.isFinishedSpawning;
        });

        if (this.isFinished) {
            this.setRoomClear();
        }
        
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
        player: Player,
        groundLayer: Tilemaps.TilemapLayer,
        doorGroup: Phaser.GameObjects.Group,
        stuffLayer: Tilemaps.TilemapLayer,
        shadowLayer: Tilemaps.TilemapLayer
    ) {
        super(scene, 'dungeonRoom');
        
        scene.add.existing(this);
        
        this.room = room;
        this.player = player;
        this.groundLayer = groundLayer;
        this.doorGroup = doorGroup;
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
        this.spawners.forEach((it) => it.setActive(false));
        this.doorGroup.getChildren().forEach((door) => {
            let doorSpr = door as Door;
            doorSpr.setActive(true);
        });
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
        this.spawners.forEach((it) => it.setActive(true));

        if(this.isFinished) {
            return;
        }

        this.doorGroup.getChildren().forEach((door) => {
            let doorSpr = door as Door;
            doorSpr.setOpen(false);
        });

    }

    private onDeactivate(): void {
        // We are going inactive - darken us
        this.setRoomAlpha(0.8);
        this.spawners.forEach((it) => it.setActive(false));
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
        this.doorGroup.getChildren().forEach((door) => {
            let doorSpr = door as Door;
            doorSpr.setOpen(true);
        });
    }
}
