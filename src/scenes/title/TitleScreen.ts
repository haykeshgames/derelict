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
            `DERELICT\n
At the edge of space, you answered the distress
call of a station outpost. You ventured in, hoping
to collect a reward. Instead, you discovered that
the inhabitants are all mechano-insect hybrids.\n
Now, you must fight to survive.\n\nCLICK TO START`,
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