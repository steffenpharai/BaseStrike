import * as Phaser from "phaser";

export class TouchControls {
  private scene: Phaser.Scene;
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private isDragging = false;
  private joystickCenter = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private activePointer: Phaser.Input.Pointer | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    // Always show joystick (mobile-first): works with touch and with mouse drag on desktop.
    // Phaser's device.input.touch is false on many desktop browsers, so we don't gate on it.
    const cam = this.scene.cameras.main;
    const baseX = 100;
    const baseY = cam.height - 100;

    // Joystick base (semi-transparent)
    this.joystickBase = this.scene.add.circle(baseX, baseY, TouchControls.BASE_RADIUS, 0x333333, 0.5);
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(1000);

    // Joystick thumb
    this.joystickThumb = this.scene.add.circle(baseX, baseY, 25, 0x666666, 0.8);
    this.joystickThumb.setScrollFactor(0);
    this.joystickThumb.setDepth(1001);

    this.joystickCenter = { x: baseX, y: baseY };

    // Touch input
    this.scene.input.on("pointerdown", this.onPointerDown, this);
    this.scene.input.on("pointermove", this.onPointerMove, this);
    this.scene.input.on("pointerup", this.onPointerUp, this);
    this.scene.input.on("pointerupoutside", this.onPointerUpOutside, this);
  }

  /** Only non-zero while the user is actively holding/dragging the joystick. */
  getVelocity(): { x: number; y: number } {
    if (!this.isDragging) return { x: 0, y: 0 };
    return { x: this.velocity.x, y: this.velocity.y };
  }

  /** True if the pointer is over the joystick base (so shoot should not fire). */
  isPointerOnJoystick(pointer: Phaser.Input.Pointer): boolean {
    return this.isOverJoystick(pointer);
  }

  /** Radius of the joystick base circle (must match create()). */
  private static readonly BASE_RADIUS = 50;

  private isOverJoystick(pointer: Phaser.Input.Pointer): boolean {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    return dx * dx + dy * dy <= TouchControls.BASE_RADIUS * TouchControls.BASE_RADIUS;
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    // Only start dragging if the touch/click is over the joystick base (bottom-left circle).
    // Don't set velocity on touch – only on drag; tapping must not move the character.
    if (!this.isOverJoystick(pointer)) return;

    this.isDragging = true;
    this.activePointer = pointer;
    this.velocity.x = 0;
    this.velocity.y = 0;

    // Thumb follows touch position; velocity is only set in onPointerMove when they drag
    if (this.joystickThumb) {
      const dx = pointer.x - this.joystickCenter.x;
      const dy = pointer.y - this.joystickCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 40;
      if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        this.joystickThumb.x = this.joystickCenter.x + Math.cos(angle) * maxDistance;
        this.joystickThumb.y = this.joystickCenter.y + Math.sin(angle) * maxDistance;
      } else {
        this.joystickThumb.x = pointer.x;
        this.joystickThumb.y = pointer.y;
      }
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging || !this.joystickThumb || pointer !== this.activePointer) return;

    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 40;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      this.joystickThumb.x = this.joystickCenter.x + Math.cos(angle) * maxDistance;
      this.joystickThumb.y = this.joystickCenter.y + Math.sin(angle) * maxDistance;
    } else {
      this.joystickThumb.x = pointer.x;
      this.joystickThumb.y = pointer.y;
    }

    // Normalize velocity (-1 to 1)
    this.velocity.x = Math.max(-1, Math.min(1, dx / maxDistance));
    this.velocity.y = Math.max(-1, Math.min(1, dy / maxDistance));
  }

  private clearDrag() {
    this.isDragging = false;
    this.activePointer = null;
    this.velocity = { x: 0, y: 0 };

    if (this.joystickBase && this.joystickThumb) {
      const cam = this.scene.cameras.main;
      const baseX = 100;
      const baseY = cam.height - 100;

      this.joystickCenter = { x: baseX, y: baseY };
      this.joystickBase.x = baseX;
      this.joystickBase.y = baseY;
      this.joystickThumb.x = baseX;
      this.joystickThumb.y = baseY;
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer !== this.activePointer) return;
    this.clearDrag();
  }

  private onPointerUpOutside(pointer: Phaser.Input.Pointer) {
    if (pointer !== this.activePointer) return;
    this.clearDrag();
  }

  isActive(): boolean {
    return this.isDragging;
  }

  destroy() {
    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.off("pointerupoutside", this.onPointerUpOutside, this);

    this.joystickBase?.destroy();
    this.joystickThumb?.destroy();
  }
}
