import { Room } from '@mikewesthad/dungeon';
import { Tilemaps } from 'phaser';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { Player } from './Player';

export class DungeonRoom {
    private scene: DungeonScene;
    private shadowLayer: Tilemaps.TilemapLayer;
    private player: Player;
    private isActive = false;
    private room: Room;

    setActive(active: boolean): void {
        if (!this.isActive && active) {
            this.onActivate();
        } else if (this.isActive && !active) {
            this.onDeactivate();
        }
        
        this.isActive = active;
    }

    constructor(
        room: Room,
        scene: DungeonScene,
        player: Player,
        shadowLayer: Tilemaps.TilemapLayer
    ) {
        this.room = room;
        this.scene = scene;
        this.player = player;
        this.shadowLayer = shadowLayer;
    }
    
    public update(activeRoom : Room | null): void {
        this.setActive(this.room === activeRoom);
    }
    
    private onActivate(): void {
        // We are becoming active - brighten us up
        this.setRoomAlpha(0);
    }
    
    private onDeactivate(): void {
        // We are going inactive - darken us
        this.setRoomAlpha(0.8);
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
}
