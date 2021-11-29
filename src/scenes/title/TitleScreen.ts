import { Scene } from 'phaser';
import { eventNames } from 'process';
import { DungeonScene } from '..';
import { Text } from '../../classes/text';

export class TitleScreen extends Scene {

    private gameStartPhrase!: Text;

    constructor() {
        super('title-scene');
    }

    create() : void {
        this.gameStartPhrase = new Text(
            this,
            this.game.scale.width / 2,
            this.game.scale.height * 0.4,
            'Click to start.',
        )
        .setAlign('center')
        .setColor('#ffffff');
    
        this.gameStartPhrase.setPosition(
            this.game.scale.width / 2 - this.gameStartPhrase.width / 2,
            this.game.scale.height * 0.4,
        );

        this.input.on('pointerdown', () => {
            this.scene.transition({
                target: 'dungeon-scene',
                remove: true,
                duration: 2000,
                allowInput: false
            });
        });
    }


}