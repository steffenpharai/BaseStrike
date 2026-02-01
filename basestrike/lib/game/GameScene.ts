import * as Phaser from "phaser";
import type { Player, GameState } from "./types";
import { DEFAULT_MAP, checkCollision } from "./map";
import { TouchControls } from "./TouchControls";
import { GAME_CONSTANTS } from "./constants";

export class GameScene extends Phaser.Scene {
  private playerGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private playerNames: Map<string, Phaser.GameObjects.Text> = new Map();
  private localPlayerId: string = "";
  private gameState: Partial<GameState> = {};
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private touchControls?: TouchControls;
  private uiText?: Phaser.GameObjects.Text;
  private onAction?: (action: unknown) => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { playerId: string; onAction: (action: unknown) => void }) {
    this.localPlayerId = data.playerId;
    this.onAction = data.onAction;
  }

  create() {
    // Round pixels so scaled grid lines stay sharp and symmetrical
    this.cameras.main.roundPixels = true;

    // Draw map
    this.drawMap();

    // Setup input
    this.cursors = this.input.keyboard?.createCursorKeys();
    if (this.input.keyboard) {
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Setup touch controls for mobile
    this.touchControls = new TouchControls(this);
    this.touchControls.create();

    // Setup mouse/touch for shooting (right half of screen for touch only)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Only reserve left half for joystick when this specific pointer is touch (not mouse/pen)
      const isTouch = "pointerType" in pointer.event && pointer.event.pointerType === "touch";
      if (isTouch && pointer.x < this.cameras.main.width / 2) {
        return; // Left half is for joystick on touch devices
      }
      this.handleShoot(pointer);
    });

    // UI Text
    this.uiText = this.add.text(10, 10, "", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { x: 10, y: 5 },
    });
    this.uiText.setScrollFactor(0);
    this.uiText.setDepth(100);

    // Initialize local player for practice mode
    this.initializePracticeMode();
  }

  private initializePracticeMode() {
    const spawnPos = DEFAULT_MAP.spawns.attackers[0];

    const localPlayer: Player = {
      id: this.localPlayerId,
      displayName: "You",
      team: "attackers",
      position: { x: spawnPos.x, y: spawnPos.y },
      health: 100,
      alive: true,
      weapon: "rifle",
      utilities: [],
      money: 800,
    };

    // Initialize game state with local player
    this.gameState = {
      matchId: `practice_${Date.now()}`,
      players: new Map([[this.localPlayerId, localPlayer]]),
      roundNumber: 1,
      roundState: {
        phase: "active",
        roundNumber: 1,
        attackersAlive: 1,
        defendersAlive: 0,
        bombPlanted: false,
      },
      tickNumber: 0,
      bombSite: null,
      bombPosition: null,
      defuseProgress: 0,
    };

    // Render initial state
    if (this.gameState.players) {
      this.renderPlayers(this.gameState.players);
    }
  }

  update() {
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    // Handle movement from keyboard
    const velocity = { x: 0, y: 0 };
    const speed = 200;

    if (this.cursors?.left.isDown || this.wasdKeys?.A.isDown) velocity.x = -speed;
    if (this.cursors?.right.isDown || this.wasdKeys?.D.isDown) velocity.x = speed;
    if (this.cursors?.up.isDown || this.wasdKeys?.W.isDown) velocity.y = -speed;
    if (this.cursors?.down.isDown || this.wasdKeys?.S.isDown) velocity.y = speed;

    // Handle movement from touch controls – only when user is holding the joystick
    if (this.touchControls?.isActive()) {
      const joystick = this.touchControls.getVelocity();
      velocity.x = joystick.x * speed;
      velocity.y = joystick.y * speed;
    }

    if (velocity.x !== 0 || velocity.y !== 0) {
      const delta = this.game.loop.delta / 1000;
      const newPos = checkCollision({
        x: localPlayer.position.x + velocity.x * delta,
        y: localPlayer.position.y + velocity.y * delta,
      });

      // Update local position directly for practice mode
      localPlayer.position = newPos;
      this.renderPlayers(this.gameState.players!);

      // Emit action for network sync (future multiplayer)
      this.emitAction({
        type: "move",
        playerId: this.localPlayerId,
        position: newPos,
        tick: this.gameState.tickNumber || 0,
      });
    }

    // Update UI
    this.updateUI();
  }

  private drawMap() {
    const graphics = this.add.graphics();
    const { width, height } = DEFAULT_MAP;
    const step = GAME_CONSTANTS.GRID_SIZE;

    // Base floor – dark tactical green/grey
    graphics.fillStyle(0x1e2a1e);
    graphics.fillRect(0, 0, width, height);

    // Symmetrical grid: same step in X and Y, drawn in two batched paths so lines align evenly
    graphics.lineStyle(1, 0x2a3a2a, 0.6);
    for (let x = 0; x <= width; x += step) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }
    graphics.strokePath();
    for (let y = 0; y <= height; y += step) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }
    graphics.strokePath();

    // Bomb site A – filled zone + border
    graphics.fillStyle(0x0088ff, 0.2);
    graphics.fillCircle(
      DEFAULT_MAP.siteA.x,
      DEFAULT_MAP.siteA.y,
      DEFAULT_MAP.siteA.radius
    );
    graphics.lineStyle(4, 0x0088ff);
    graphics.strokeCircle(
      DEFAULT_MAP.siteA.x,
      DEFAULT_MAP.siteA.y,
      DEFAULT_MAP.siteA.radius
    );
    const labelA = this.add.text(
      DEFAULT_MAP.siteA.x - 15,
      DEFAULT_MAP.siteA.y - 10,
      "A",
      { fontSize: "24px", color: "#0088ff" }
    );
    labelA.setDepth(1);

    // Bomb site B – filled zone + border
    graphics.fillStyle(0xff8800, 0.2);
    graphics.fillCircle(
      DEFAULT_MAP.siteB.x,
      DEFAULT_MAP.siteB.y,
      DEFAULT_MAP.siteB.radius
    );
    graphics.lineStyle(4, 0xff8800);
    graphics.strokeCircle(
      DEFAULT_MAP.siteB.x,
      DEFAULT_MAP.siteB.y,
      DEFAULT_MAP.siteB.radius
    );
    const labelB = this.add.text(
      DEFAULT_MAP.siteB.x - 15,
      DEFAULT_MAP.siteB.y - 10,
      "B",
      { fontSize: "24px", color: "#ff8800" }
    );
    labelB.setDepth(1);

    // Walls – solid fill with edge highlight so they read as walls
    for (const wall of DEFAULT_MAP.walls) {
      graphics.fillStyle(0x4a5568);
      graphics.fillRect(wall.x, wall.y, wall.width, wall.height);
      graphics.lineStyle(2, 0x2d3748);
      graphics.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }

    graphics.setDepth(0);
  }

  private handleShoot(pointer: Phaser.Input.Pointer) {
    if (!this.gameState.players) return;

    const localPlayer = this.gameState.players.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    const angle = Math.atan2(
      pointer.worldY - localPlayer.position.y,
      pointer.worldX - localPlayer.position.x
    );

    this.emitAction({
      type: "shoot",
      playerId: this.localPlayerId,
      position: localPlayer.position,
      angle,
      tick: this.gameState.tickNumber || 0,
    });

    // Visual feedback
    this.drawBulletTracer(localPlayer.position, { x: pointer.worldX, y: pointer.worldY });
  }

  private drawBulletTracer(from: { x: number; y: number }, to: { x: number; y: number }) {
    const line = this.add.graphics();
    line.lineStyle(2, 0xffff00);
    line.beginPath();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.strokePath();

    this.time.delayedCall(50, () => {
      line.destroy();
    });
  }

  private updateUI() {
    if (!this.uiText || !this.gameState.roundState) return;

    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    const roundState = this.gameState.roundState;

    let text = `Round: ${roundState.roundNumber}\n`;
    text += `Phase: ${roundState.phase}\n`;
    text += `Attackers: ${roundState.attackersAlive} | Defenders: ${roundState.defendersAlive}\n`;

    if (localPlayer) {
      text += `Health: ${localPlayer.health}\n`;
      text += `Weapon: ${localPlayer.weapon}\n`;
      text += `Money: $${localPlayer.money}\n`;
    }

    if (roundState.bombPlanted) {
      text += `\nBOMB PLANTED!`;
    }

    this.uiText.setText(text);
  }

  public updateGameState(state: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...state };

    if (state.players) {
      this.renderPlayers(state.players);
    }
  }

  private renderPlayers(players: Map<string, Player>) {
    // Clear old graphics and text
    this.playerGraphics.forEach((graphics) => graphics.destroy());
    this.playerGraphics.clear();
    this.playerNames.forEach((text) => text.destroy());
    this.playerNames.clear();

    // Draw new players
    players.forEach((player, id) => {
      if (!player.alive) return;

      const graphics = this.add.graphics();
      const color = player.team === "attackers" ? 0x00ff00 : 0xff0000;

      graphics.fillStyle(color);
      graphics.fillCircle(player.position.x, player.position.y, 15);

      // Health bar background
      graphics.fillStyle(0x000000);
      graphics.fillRect(player.position.x - 20, player.position.y - 30, 40, 5);
      // Health bar fill
      graphics.fillStyle(0x00ff00);
      graphics.fillRect(
        player.position.x - 20,
        player.position.y - 30,
        (40 * player.health) / 100,
        5
      );

      // Name
      const nameText = this.add.text(
        player.position.x,
        player.position.y - 40,
        player.displayName,
        {
          fontSize: "12px",
          color: "#ffffff",
        }
      );
      nameText.setOrigin(0.5, 0.5);

      this.playerGraphics.set(id, graphics);
      this.playerNames.set(id, nameText);
    });
  }

  private emitAction(action: unknown) {
    if (this.onAction) {
      this.onAction(action);
    }
  }
}
