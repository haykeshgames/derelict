import { EVENTS_NAME } from '../consts';
import { DungeonScene } from '../scenes/dungeon/DungeonScene';
import { DungeonRoom } from './DungeonRoom';
import { Enemy } from './enemy';

export class Spawner extends Phaser.GameObjects.GameObject {
    private x : number;
    private y : number;
    private spawnRate !: number;
    private spawnAmount !: integer;
    private spawnCount = 0;
    private timerEvent !: Phaser.Time.TimerEvent;
    
    private maybeSpawnEnemy : () => void;
    
    get isFinishedSpawning() : boolean {
        return this.spawnCount >= this.spawnAmount;
    }
    
    constructor(scene: DungeonScene, x: number, y: number) {
        super(scene, 'spawner');
        
        scene.add.existing(this);
        
        this.x = x;
        this.y = y;
        
        this.spawnRate = 5000;
        this.spawnAmount = 3;

        this.maybeSpawnEnemy = () => {
            if (this.isFinishedSpawning) return;
            
            this.spawnCount++;
    
            const enemy = new Enemy(this.scene as DungeonScene, this.x, this.y, 'enemy_spr', 60);
    
            this.scene.game.events.emit(EVENTS_NAME.enemyAdded, enemy);
        }

        this.timerEvent = this.scene.time.addEvent({
            delay : this.spawnRate,
            startAt: 4000,
            repeat : this.spawnAmount,
            paused : true,
            callback : this.maybeSpawnEnemy,
        });
    }

    public setPaused(paused : boolean) {
        this.timerEvent.paused = paused;
    }
}