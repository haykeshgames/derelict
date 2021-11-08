import { Game, Types } from 'phaser';
import { Level1, LoadingScene, UIScene} from './scenes';

type GameConfigExtended = Types.Core.GameConfig & {
    winScore: number;
};

export const gameConfig: GameConfigExtended = {
    title: 'Derelict',
    type: Phaser.AUTO,
    parent: 'game',         // element id to render the game into
    backgroundColor: '#333333',
    scale: {
        mode: Phaser.Scale.ScaleModes.NONE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false    // TODO: Is this really necessary? Why would this be the default?
        }
    },
    render: {
        antialiasGL: false,
        pixelArt: true
    },
    callbacks: {
        postBoot: () => {
            window.sizeChanged();
        }
    },
    canvasStyle: 'display: block: width: 100%; width: 100%;',
    autoFocus: true,
    audio: {
        disableWebAudio: false
    },
    scene: [LoadingScene, Level1, UIScene],
    winScore: 40,
};

window.sizeChanged = () => {
    if (window.game.isBooted) {
        setTimeout(() => {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
        window.game.canvas.setAttribute(
            'style',
            `display: block: width: ${window.innerWidth}; height: ${window.innerHeight}`        );

        }, 100);
    }
};

window.onresize = () => window.sizeChanged();

// Setup our game instance
window.game = new Game(gameConfig);

// Patch the Window interface to avoid the errors
declare global {
    interface Window {
        sizeChanged: () => void;
        game: Phaser.Game;
    }
}