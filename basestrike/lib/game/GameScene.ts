import * as Phaser from "phaser";
import type { Player, GameState, HudState } from "./types";
import { DEFAULT_MAP, checkCollision, getFirstWallHit } from "./map";
import { TouchControls } from "./TouchControls";
import { GAME_CONSTANTS, JOYSTICK_LAYOUT, TEAM_BRANDING, WEAPON_STATS } from "./constants";

/** Base URL for Kenney assets (Next.js public folder). */
const KENNEY_ASSET_BASE = "/assets/kenney-topdown-shooter/Spritesheet";
const KENNEY_TILES_BASE = "/assets/kenney-topdown-shooter/Tilesheet";
/** Kenney tilesheet tile size (pixels per tile in source image). */
const TILE_SOURCE_SIZE = 32;

export class GameScene extends Phaser.Scene {
  private playerSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private playerGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private playerNames: Map<string, Phaser.GameObjects.Text> = new Map();
  private localPlayerId: string = "";
  private gameState: Partial<GameState> = {};
  private touchControls?: TouchControls;
  private onAction?: (action: unknown) => void;
  private onHudState?: (state: HudState) => void;
  /** When set, reload completes at this time (ms, from scene time). */
  private reloadEndTime: number | null = null;
  /** Whether Kenney character atlas loaded (fallback to circle if not). */
  private charactersAtlasLoaded = false;
  /** Whether Kenney tiles loaded (fallback to procedural floor if not). */
  private tilesLoaded = false;
  /** Optional ref for React fire button to trigger shoot. */
  private fireTriggerRef?: { current: { shoot: () => void } | null };
  /** Previous frame health for damage flash (local player). */
  private previousHealth: number = 100;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // SFX (optional: game runs without if files missing)
    this.load.on("loaderror", (_file: unknown) => {
      // Allow game to continue if SFX fail to load
    });
    const sfxBase = "/assets/sfx";
    this.load.audio("sfx_shoot", [`${sfxBase}/shoot.ogg`, `${sfxBase}/shoot.mp3`]);
    this.load.audio("sfx_reload", [`${sfxBase}/reload.ogg`, `${sfxBase}/reload.mp3`]);
    this.load.audio("sfx_hit", [`${sfxBase}/hit.ogg`, `${sfxBase}/hit.mp3`]);

    this.load.atlasXML(
      "characters",
      `${KENNEY_ASSET_BASE}/spritesheet_characters.png`,
      `${KENNEY_ASSET_BASE}/spritesheet_characters.xml`
    );
    this.load.spritesheet("tiles", `${KENNEY_TILES_BASE}/tilesheet_complete.png`, {
      frameWidth: TILE_SOURCE_SIZE,
      frameHeight: TILE_SOURCE_SIZE,
    });
  }

  init(data: {
    playerId: string;
    onAction: (action: unknown) => void;
    onHudState?: (state: HudState) => void;
    fireTriggerRef?: { current: { shoot: () => void } | null };
  }) {
    this.localPlayerId = data.playerId;
    this.onAction = data.onAction;
    this.onHudState = data.onHudState;
    this.fireTriggerRef = data.fireTriggerRef;
  }

  create() {
    this.charactersAtlasLoaded = this.textures.exists("characters");
    this.tilesLoaded = this.textures.exists("tiles");

    // Round pixels so scaled grid lines stay sharp and symmetrical
    this.cameras.main.roundPixels = true;

    // Draw map
    this.drawMap();

    // Joystick-only controls (mobile-first; same layout at any viewport size)
    this.touchControls = new TouchControls(this);
    this.touchControls.create();

    // Shooting: tap anywhere to shoot, except when tap is on the joystick (user must be on joystick to use it)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.touchControls?.isPointerOnJoystick(pointer)) return;
      this.handleShoot(pointer);
    });

    // Initialize local player for practice mode
    this.initializePracticeMode();

    // Expose shoot-from-button for React fire button
    if (this.fireTriggerRef) this.fireTriggerRef.current = { shoot: () => this.shootFromButton() };
  }

  shutdown() {
    if (this.fireTriggerRef) this.fireTriggerRef.current = null;
  }

  private initializePracticeMode() {
    const spawnPos = DEFAULT_MAP.spawns.ethereum[0];

    const weapon = "rifle";
    const localPlayer: Player = {
      id: this.localPlayerId,
      displayName: "You",
      team: "ethereum",
      position: { x: spawnPos.x, y: spawnPos.y },
      health: 100,
      alive: true,
      weapon,
      ammoInMagazine: WEAPON_STATS[weapon].magazineSize,
      utilities: [],
      money: 800,
    };

    // Initialize game state with local player (Team 1 = Ethereum)
    this.gameState = {
      matchId: `practice_${Date.now()}`,
      players: new Map([[this.localPlayerId, localPlayer]]),
      roundNumber: 1,
      roundState: {
        phase: "active",
        roundNumber: 1,
        ethereumAlive: 1,
        solanaAlive: 0,
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
    this.pushHudState();
  }

  update() {
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    // Movement: joystick only (mobile-first; works with touch or mouse drag)
    const velocity = { x: 0, y: 0 };
    const speed = 200;

    if (this.touchControls?.isActive()) {
      const joystick = this.touchControls.getVelocity();
      velocity.x = joystick.x * speed;
      velocity.y = joystick.y * speed;
    }

    if (velocity.x !== 0 || velocity.y !== 0) {
      const delta = this.game.loop.delta / 1000;
      let newPos = checkCollision({
        x: localPlayer.position.x + velocity.x * delta,
        y: localPlayer.position.y + velocity.y * delta,
      });

      // Block guard: don't allow player into joystick screen area (must match TouchControls position/radius)
      if (this.isWorldPosInJoystickZone(newPos)) {
        newPos = localPlayer.position;
      }

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

    // Reload complete check
    const local = this.gameState.players?.get(this.localPlayerId);
    if (this.reloadEndTime != null && this.time.now >= this.reloadEndTime && local) {
      const stats = WEAPON_STATS[local.weapon];
      local.ammoInMagazine = stats.magazineSize;
      this.reloadEndTime = null;
    }

    // Push HUD state to React overlay
    this.pushHudState();
  }

  private pushHudState() {
    if (!this.onHudState || !this.gameState.roundState) return;
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    const weapon = localPlayer?.weapon ?? "rifle";
    const weaponStats = WEAPON_STATS[weapon];
    const ammoMax = weaponStats.magazineSize;
    const reloading = this.reloadEndTime != null;
    const reloadTimeMs = weaponStats.reloadTimeMs;
    const reloadProgress =
      reloading && this.reloadEndTime != null
        ? Math.min(1, Math.max(0, 1 - (this.reloadEndTime - this.time.now) / reloadTimeMs))
        : undefined;
    const players = this.gameState.players;
    const playerPositions =
      players &&
      Array.from(players.entries())
        .filter(([, p]) => p.alive)
        .map(([id, p]) => ({ id, x: p.position.x, y: p.position.y, team: p.team }));
    this.onHudState({
      roundNumber: this.gameState.roundState.roundNumber,
      phase: this.gameState.roundState.phase,
      ethereumAlive: this.gameState.roundState.ethereumAlive,
      solanaAlive: this.gameState.roundState.solanaAlive,
      bombPlanted: this.gameState.roundState.bombPlanted ?? false,
      health: localPlayer?.health ?? 0,
      weapon,
      money: localPlayer?.money ?? 0,
      ammo: localPlayer?.ammoInMagazine ?? ammoMax,
      ammoMax,
      reloading,
      reloadProgress,
      localPlayerPosition: localPlayer?.alive ? localPlayer.position : undefined,
      playerPositions,
    });
  }

  private drawMap() {
    const { width, height } = DEFAULT_MAP;
    const step = GAME_CONSTANTS.GRID_SIZE;

    // Base floor – Kenney tiles if loaded, else procedural (Base palette dark)
    if (this.tilesLoaded && this.textures.get("tiles").get(0)) {
      const floor = this.add.tileSprite(0, 0, width, height, "tiles", 0);
      floor.setOrigin(0, 0);
      floor.setTileScale(step / TILE_SOURCE_SIZE);
      floor.setDepth(0);
    }

    const graphics = this.add.graphics();
    if (!this.tilesLoaded) {
      graphics.fillStyle(0x0a0a0f);
      graphics.fillRect(0, 0, width, height);
    }

    // Grid overlay (subtle)
    graphics.lineStyle(1, 0x2a3a2a, 0.5);
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

    // Bomb site A (ETH) – filled zone + border
    graphics.fillStyle(TEAM_BRANDING.ethereum.colorHex, 0.2);
    graphics.fillCircle(
      DEFAULT_MAP.siteA.x,
      DEFAULT_MAP.siteA.y,
      DEFAULT_MAP.siteA.radius
    );
    graphics.lineStyle(4, TEAM_BRANDING.ethereum.colorHex);
    graphics.strokeCircle(
      DEFAULT_MAP.siteA.x,
      DEFAULT_MAP.siteA.y,
      DEFAULT_MAP.siteA.radius
    );
    const labelA = this.add.text(
      DEFAULT_MAP.siteA.x - 15,
      DEFAULT_MAP.siteA.y - 10,
      "A",
      { fontSize: "24px", color: TEAM_BRANDING.ethereum.colorCss }
    );
    labelA.setDepth(1);

    // Bomb site B (SOL) – filled zone + border
    graphics.fillStyle(TEAM_BRANDING.solana.colorHex, 0.2);
    graphics.fillCircle(
      DEFAULT_MAP.siteB.x,
      DEFAULT_MAP.siteB.y,
      DEFAULT_MAP.siteB.radius
    );
    graphics.lineStyle(4, TEAM_BRANDING.solana.colorHex);
    graphics.strokeCircle(
      DEFAULT_MAP.siteB.x,
      DEFAULT_MAP.siteB.y,
      DEFAULT_MAP.siteB.radius
    );
    const labelB = this.add.text(
      DEFAULT_MAP.siteB.x - 15,
      DEFAULT_MAP.siteB.y - 10,
      "B",
      { fontSize: "24px", color: TEAM_BRANDING.solana.colorCss }
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

  /** Called when user taps canvas (except joystick). */
  private handleShoot(pointer: Phaser.Input.Pointer) {
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    const from = localPlayer.position;
    const tap = { x: pointer.worldX, y: pointer.worldY };
    const wallHit = getFirstWallHit(from, tap);
    const end = wallHit ?? tap;
    const angle = Math.atan2(tap.y - from.y, tap.x - from.x);
    this.doShoot(angle, from, end);
  }

  /** Called when React fire button is pressed; aim toward screen center. */
  shootFromButton() {
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    const cam = this.cameras.main;
    const centerX = cam.scrollX + cam.width / 2 / cam.zoom;
    const centerY = cam.scrollY + cam.height / 2 / cam.zoom;
    const from = localPlayer.position;
    const tap = { x: centerX, y: centerY };
    const wallHit = getFirstWallHit(from, tap);
    const end = wallHit ?? tap;
    const angle = Math.atan2(tap.y - from.y, tap.x - from.x);
    this.doShoot(angle, from, end);
  }

  private doShoot(
    angle: number,
    from: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    const localPlayer = this.gameState.players?.get(this.localPlayerId);
    if (!localPlayer || !localPlayer.alive) return;

    if (this.reloadEndTime != null) return;
    if (localPlayer.ammoInMagazine <= 0) {
      this.playSfx("sfx_reload");
      this.reloadEndTime = this.time.now + WEAPON_STATS[localPlayer.weapon].reloadTimeMs;
      return;
    }

    localPlayer.ammoInMagazine -= 1;
    if (localPlayer.ammoInMagazine === 0) {
      this.playSfx("sfx_reload");
      this.reloadEndTime = this.time.now + WEAPON_STATS[localPlayer.weapon].reloadTimeMs;
    }

    this.playSfx("sfx_shoot");

    this.emitAction({
      type: "shoot",
      playerId: this.localPlayerId,
      position: localPlayer.position,
      angle,
      tick: this.gameState.tickNumber || 0,
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }

    this.drawBulletTracer(from, end);
    this.muzzleFlash(from);
    this.cameras.main.shake(80, 0.004);
    this.hitSparks(end);
    this.playSfx("sfx_hit");
  }

  /** Play SFX by key if loaded (no-op if missing). */
  private playSfx(key: string) {
    try {
      if (this.cache.audio.exists(key)) {
        this.sound.play(key, { volume: 0.4 });
      }
    } catch {
      // ignore
    }
  }

  private drawBulletTracer(from: { x: number; y: number }, to: { x: number; y: number }) {
    const line = this.add.graphics();
    line.lineStyle(2, 0xffff00);
    line.beginPath();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.strokePath();
    line.setDepth(5);
    this.time.delayedCall(50, () => line.destroy());
  }

  private muzzleFlash(at: { x: number; y: number }) {
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(at.x, at.y, 12);
    flash.setDepth(6);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 60,
      ease: "Cubic.Out",
      onComplete: () => flash.destroy(),
    });
  }

  private hitSparks(at: { x: number; y: number }) {
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
      const dist = 8 + Math.random() * 12;
      const x = at.x + Math.cos(angle) * dist;
      const y = at.y + Math.sin(angle) * dist;
      const dot = this.add.graphics();
      dot.fillStyle(0xffaa00, 0.9);
      dot.fillCircle(x, y, 2);
      dot.setDepth(6);
      this.tweens.add({
        targets: dot,
        alpha: 0,
        x: x + Math.cos(angle) * 15,
        y: y + Math.sin(angle) * 15,
        duration: 120,
        ease: "Cubic.Out",
        onComplete: () => dot.destroy(),
      });
    }
  }

  /** Red full-screen flash when local player takes damage (covers camera viewport). */
  private damageFlash() {
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 0.4);
    g.fillRect(cam.scrollX, cam.scrollY, w / cam.zoom, h / cam.zoom);
    g.setDepth(100);
    this.tweens.add({
      targets: g,
      alpha: 0,
      duration: 250,
      ease: "Cubic.Out",
      onComplete: () => g.destroy(),
    });
  }

  /** True if this world position would appear inside the joystick circle on screen (block guard). Must match TouchControls position/radius. */
  private isWorldPosInJoystickZone(worldPos: { x: number; y: number }): boolean {
    const cam = this.cameras.main;
    const screenX = cam.x + (worldPos.x - cam.scrollX) * cam.zoom;
    const screenY = cam.y + (worldPos.y - cam.scrollY) * cam.zoom;
    const joystickX = JOYSTICK_LAYOUT.MARGIN_LEFT;
    const joystickY = cam.height - JOYSTICK_LAYOUT.MARGIN_BOTTOM;
    const radius = JOYSTICK_LAYOUT.BASE_RADIUS;
    const dx = screenX - joystickX;
    const dy = screenY - joystickY;
    return dx * dx + dy * dy <= radius * radius;
  }

  public updateGameState(state: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...state };

    if (state.players) {
      this.renderPlayers(state.players);
    }
  }

  private renderPlayers(players: Map<string, Player>) {
    this.playerSprites.forEach((s) => s.destroy());
    this.playerSprites.clear();
    this.playerGraphics.forEach((g) => g.destroy());
    this.playerGraphics.clear();
    this.playerNames.forEach((text) => text.destroy());
    this.playerNames.clear();

    const frame = this.charactersAtlasLoaded ? "soldier1_stand.png" : null;
    const getColor = (p: Player) =>
      p.team === "ethereum" ? TEAM_BRANDING.ethereum.colorHex : TEAM_BRANDING.solana.colorHex;

    players.forEach((player, id) => {
      if (!player.alive) return;

      if (frame && this.textures.get("characters").get(frame)) {
        const sprite = this.add.sprite(
          player.position.x,
          player.position.y,
          "characters",
          frame
        );
        sprite.setOrigin(0.5, 0.5);
        sprite.setTint(getColor(player));
        sprite.setScale(0.7);
        sprite.setDepth(2);
        this.playerSprites.set(id, sprite);
      }

      const g = this.add.graphics();
      if (!frame || !this.textures.get("characters").get(frame)) {
        g.fillStyle(getColor(player));
        g.fillCircle(player.position.x, player.position.y, 15);
      }
      g.fillStyle(0x000000);
      g.fillRect(player.position.x - 20, player.position.y - 30, 40, 5);
      g.fillStyle(0x22c55e);
      g.fillRect(
        player.position.x - 20,
        player.position.y - 30,
        (40 * player.health) / 100,
        5
      );
      g.setDepth(3);
      this.playerGraphics.set(id, g);

      const nameText = this.add.text(
        player.position.x,
        player.position.y - 40,
        player.displayName,
        { fontSize: "12px", color: "#ffffff" }
      );
      nameText.setOrigin(0.5, 0.5);
      nameText.setDepth(3);
      this.playerNames.set(id, nameText);
    });
  }

  private emitAction(action: unknown) {
    if (this.onAction) {
      this.onAction(action);
    }
  }
}
