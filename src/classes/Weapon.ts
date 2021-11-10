import { Scene } from 'phaser';
import { Player } from './Player';

// Base class for weapons
export class Weapon {
    protected scene : Scene;
    protected player : Player;

    constructor(scene: Scene, player : Player) {
        this.scene = scene;
        this.player = player;
    }

    // Called by the player update
    // Returns true if we are firing the weapon
    update() : boolean {
        return false;
    }
}