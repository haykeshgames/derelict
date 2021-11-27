import { EVENTS_NAME } from '../consts';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { DungeonRoom } from './DungeonRoom';
import { Enemy } from './enemy';

export class Spawner extends Phaser.GameObjects.GameObject {
    private x : number;
    private y : number;
    private room : DungeonRoom;
    private spawnRate !: number;
    private spawnAmount !: integer;
    private spawnCount = 0;
    private lastSpawnTime !: number;
    
    get isFinishedSpawning() : boolean {
        return this.spawnCount >= this.spawnAmount;
    }
    
    constructor(scene: DungeonScene, x: number, y: number, room: DungeonRoom) {
        super(scene, 'spawner');
        
        scene.add.existing(this);
        
        this.x = x;
        this.y = y;
        
        this.spawnRate = 5000;
        this.spawnAmount = 3;
        this.room = room;
    }
    
    preUpdate() : void {
        this.maybeSpawnEnemy();
    }    
    
    private maybeSpawnEnemy() : void {
        if (this.isFinishedSpawning) return;
        
        const curTime = Date.now();
        if ((curTime - this.lastSpawnTime) < this.spawnRate) return;
        
        this.spawnCount++;
        this.lastSpawnTime = Date.now();
        
        const dungeonScene = this.scene as DungeonScene;
        const enemy = new Enemy(dungeonScene, this.x, this.y, 'enemy_spr', 60);
        this.scene.game.events.emit(EVENTS_NAME.enemyAdded, enemy);
    }
}