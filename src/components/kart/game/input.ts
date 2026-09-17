// Shared, mutable input state. Touch controls and the keyboard both write
// into their own channel and the game reads the merged result each step.
export type InputChannel = {
  steer: number; // -1 (left) .. 1 (right)
  throttle: number; // 0..1
  brake: number; // 0..1
  drift: boolean;
};

export function createChannel(): InputChannel {
  return { steer: 0, throttle: 0, brake: 0, drift: false };
}

export class KeyboardInput {
  readonly channel = createChannel();
  private keys = new Set<string>();
  private onAction: (action: "start" | "restart") => void;

  constructor(onAction: (action: "start" | "restart") => void) {
    this.onAction = onAction;
  }

  attach() {
    window.addEventListener("keydown", this.down);
    window.addEventListener("keyup", this.up);
    window.addEventListener("blur", this.clear);
  }

  detach() {
    window.removeEventListener("keydown", this.down);
    window.removeEventListener("keyup", this.up);
    window.removeEventListener("blur", this.clear);
  }

  private down = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    if (k === "enter") this.onAction("start");
    if (k === "r") this.onAction("restart");
    this.keys.add(k);
    this.update();
  };

  private up = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
    this.update();
  };

  private clear = () => {
    this.keys.clear();
    this.update();
  };

  private update() {
    const k = this.keys;
    const left = k.has("arrowleft") || k.has("a");
    const right = k.has("arrowright") || k.has("d");
    this.channel.steer = (right ? 1 : 0) - (left ? 1 : 0);
    this.channel.throttle = k.has("arrowup") || k.has("w") ? 1 : 0;
    this.channel.brake = k.has("arrowdown") || k.has("s") ? 1 : 0;
    this.channel.drift = k.has(" ") || k.has("shift");
  }
}

export function mergeInput(a: InputChannel, b: InputChannel, out: InputChannel) {
  const steer = Math.abs(a.steer) >= Math.abs(b.steer) ? a.steer : b.steer;
  out.steer = Math.max(-1, Math.min(1, steer));
  out.throttle = Math.max(a.throttle, b.throttle);
  out.brake = Math.max(a.brake, b.brake);
  out.drift = a.drift || b.drift;
  return out;
}
