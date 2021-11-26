import { Physics } from "phaser";
import { DOOR_TYPE } from "../consts";

export class Door extends Physics.Arcade.Sprite {
    private doorType !: DOOR_TYPE;
    private isOpen !: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, type: DOOR_TYPE)  {
        let spriteName : string = '';       
        let frame : number = 0;       
        if (type === DOOR_TYPE.NORTH || type === DOOR_TYPE.SOUTH) {
            spriteName = 'item_spr';
            frame = 515;
        } else if (type === DOOR_TYPE.WEST) {
            spriteName = 'wall_spr';
            frame = 305;
        } else {
            spriteName = 'wall_spr';
            frame = 297;
        }

        super(scene, x + 16, y + 16, spriteName, frame);

        this.doorType = type;

        // Add the door to the scene
        scene.add.existing(this);
        
        // Enable physics on the door
        scene.physics.add.existing(this);

        this.initAnimations();

        this.setDepth(99);

        this.getBody().setImmovable(true);

        this.setOpen(true);
    }

    protected getBody() : Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }

    get openCloseSound(): Phaser.Sound.BaseSound {
        return this.scene?.sound.get('doorOpenClose');
    }

    public setOpen(open : boolean) : void {
        if(open === this.isOpen) {
            return;
        }

        this.isOpen = open;

        if (this.doorType === DOOR_TYPE.NORTH || this.doorType === DOOR_TYPE.SOUTH) {
            if(open) {
                this.anims.play('door_open', true);
                this.openCloseSound?.play({delay: 1});
            } else {
                this.anims.play('door_close', true);
                this.anims.chain('door_idle');
                this.openCloseSound?.play();
            }
        }

        if(open) {
            this.disableBody();
        } else {
            this.enableBody(false, 0, 0, true, true);
        }
    }

    private initAnimations(): void {
        this.anims.create({
            key: 'door_idle',
            repeat: -1,
            frames: this.anims.generateFrameNumbers('item_spr', {
                frames: [408, 410, 411, 412]
            }),
            frameRate: 4
        });
        
        this.anims.create({
            key: 'door_open',
            frames: this.anims.generateFrameNumbers('item_spr', {
                start: 504,
                end: 515
            }),
            frameRate: 4
        });
    
        this.anims.create({
            key: 'door_close',
            frames: this.anims.generateFrameNumbers('item_spr', {
                start: 515,
                end: 504
            }),
            frameRate: 4
        });
    }
}

