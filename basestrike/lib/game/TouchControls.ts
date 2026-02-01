import * as Phaser from "phaser";
import { JOYSTICK_LAYOUT } from "./constants";

/**
 * Industry-standard virtual joystick for mobile/touch:
 * - Fixed base in bottom-left movement zone (above HUD bar)
 * - Outer ring + inner base + thumb; 44px+ touch target
 * - Thumb constrained to base, smooth snap-back on release
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickRing?: Phaser.GameObjects.Graphics;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private isDragging = false;
  private joystickCenter = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private activePointer: Phaser.Input.Pointer | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    const cam = this.scene.cameras.main;
    const baseX = JOYSTICK_LAYOUT.MARGIN_LEFT;
    const baseY = cam.height - JOYSTICK_LAYOUT.MARGIN_BOTTOM;
    const baseR = JOYSTICK_LAYOUT.BASE_RADIUS;
    const thumbR = JOYSTICK_LAYOUT.THUMB_RADIUS;

    this.joystickCenter = { x: baseX, y: baseY };

    // Outer ring (industry-standard boundary)
    this.joystickRing = this.scene.add.graphics();
    this.joystickRing.setScrollFactor(0);
    this.joystickRing.setDepth(1000);
    this.joystickRing.lineStyle(3, 0xffffff, 0.35);
    this.joystickRing.strokeCircle(baseX, baseY, baseR);
    this.joystickRing.fillStyle(0x000000, 0);
    this.joystickRing.fillCircle(baseX, baseY, baseR);

    // Inner base (semi-transparent fill)
    this.joystickBase = this.scene.add.circle(
      baseX,
      baseY,
      baseR - 2,
      0x1a1a2e,
      0.65
    );
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(1000);

    // Thumb (handle) — prominent, high contrast
    this.joystickThumb = this.scene.add.circle(
      baseX,
      baseY,
      thumbR,
      0xe8e8e8,
      0.95
    );
    this.joystickThumb.setScrollFactor(0);
    this.joystickThumb.setDepth(1001);
    this.joystickThumb.setStrokeStyle(2, 0xffffff, 0.4);

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

  private get baseRadius(): number {
    return JOYSTICK_LAYOUT.BASE_RADIUS;
  }

  private isOverJoystick(pointer: Phaser.Input.Pointer): boolean {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const r = this.baseRadius;
    return dx * dx + dy * dy <= r * r;
  }

  private getThumbPosition(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = JOYSTICK_LAYOUT.THUMB_TRAVEL;
    if (distance <= maxDistance) {
      return { x: pointer.x, y: pointer.y };
    }
    const angle = Math.atan2(dy, dx);
    return {
      x: this.joystickCenter.x + Math.cos(angle) * maxDistance,
      y: this.joystickCenter.y + Math.sin(angle) * maxDistance,
    };
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.isOverJoystick(pointer)) return;

    this.isDragging = true;
    this.activePointer = pointer;
    this.velocity.x = 0;
    this.velocity.y = 0;

    const pos = this.getThumbPosition(pointer);
    if (this.joystickThumb) {
      this.joystickThumb.x = pos.x;
      this.joystickThumb.y = pos.y;
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging || !this.joystickThumb || pointer !== this.activePointer) return;

    const pos = this.getThumbPosition(pointer);
    this.joystickThumb.x = pos.x;
    this.joystickThumb.y = pos.y;

    const dx = this.joystickThumb.x - this.joystickCenter.x;
    const dy = this.joystickThumb.y - this.joystickCenter.y;
    const maxDistance = JOYSTICK_LAYOUT.THUMB_TRAVEL;
    this.velocity.x = Math.max(-1, Math.min(1, dx / maxDistance));
    this.velocity.y = Math.max(-1, Math.min(1, dy / maxDistance));
  }

  private snapThumbToCenter() {
    if (!this.joystickThumb) return;
    this.scene.tweens.add({
      targets: this.joystickThumb,
      x: this.joystickCenter.x,
      y: this.joystickCenter.y,
      duration: 120,
      ease: "Cubic.Out",
    });
  }

  private clearDrag() {
    this.isDragging = false;
    this.activePointer = null;
    this.velocity = { x: 0, y: 0 };
    this.snapThumbToCenter();
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

    this.joystickRing?.destroy();
    this.joystickBase?.destroy();
    this.joystickThumb?.destroy();
  }
}
