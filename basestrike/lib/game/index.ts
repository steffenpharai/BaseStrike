import * as Phaser from "phaser";
import { GameScene } from "./GameScene";
import { GAME_CONSTANTS } from "./constants";

export * from "./types";
export * from "./map";
export * from "./schemas";
export * from "./constants";
export { GameScene };

export interface FireTrigger {
  shoot: () => void;
}

export function createGame(
  container: HTMLElement,
  config: {
    playerId: string;
    onAction: (action: unknown) => void;
    onHudState?: (state: import("./types").HudState) => void;
    /** Optional: set by GameScene so React can trigger shoot (e.g. fire button). */
    fireTriggerRef?: { current: FireTrigger | null };
  }
): Phaser.Game {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONSTANTS.MAP_SIZE.width,
    height: GAME_CONSTANTS.MAP_SIZE.height,
    parent: container,
    backgroundColor: "#1a1a2e",
    scene: [GameScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // Performance optimizations
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    render: {
      pixelArt: true,
      antialias: false,
      powerPreference: "high-performance",
    },
    audio: {
      disableWebAudio: false,
    },
    input: {
      touch: true,
      mouse: true,
    },
  };

  const game = new Phaser.Game(gameConfig);

  // Pass data to scene (playerId, onAction, onHudState)
  game.scene.start("GameScene", config);

  return game;
}
