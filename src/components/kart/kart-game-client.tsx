"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KartGame, type HudState } from "./game/game";
import { createChannel, type InputChannel } from "./game/input";
import { characterById } from "./game/characters";
import { Hud } from "./hud";
import { TouchControls } from "./touch-controls";

const DRIVER_KEY = "chelsea-kart:driver";

const initialHud: HudState = {
  phase: "ready",
  countdown: -1,
  lap: 1,
  totalLaps: 3,
  position: 4,
  racers: 4,
  time: 0,
  bestLap: null,
  lastLap: null,
  speed: 0,
  boosting: false,
  drifting: false,
  wrongWay: false,
  results: null,
  grid: [],
};

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
};

function rememberedDriver() {
  try {
    return characterById(localStorage.getItem(DRIVER_KEY)).id;
  } catch {
    return characterById(null).id;
  }
}

export default function KartGameClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<KartGame | null>(null);
  const touchChannel = useRef<InputChannel>(createChannel());
  const [hud, setHud] = useState<HudState>(initialHud);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);
  // this component is only ever rendered on the client (ssr: false), so it is
  // safe to read browser APIs in the initial state
  const [driverId, setDriverId] = useState(rememberedDriver);
  const driverRef = useRef(driverId);
  const [isTouch] = useState(
    () => window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0
  );
  const [fullscreenAvailable] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenEnabled
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let game: KartGame;
    try {
      game = new KartGame({
        canvas,
        onHud: setHud,
        touch: touchChannel.current,
        character: driverRef.current,
      });
    } catch (err) {
      console.error("Chelsea Kart failed to start", err);
      const t = setTimeout(() => setFailed(true), 0);
      return () => clearTimeout(t);
    }
    gameRef.current = game;
    if (process.env.NODE_ENV === "development") {
      // handy for poking at the simulation from the console / e2e scripts
      (window as unknown as { __chelseaKart?: KartGame }).__chelseaKart = game;
    }

    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    const onFullscreen = () => {
      setFullscreen(!!document.fullscreenElement);
      requestAnimationFrame(onResize);
    };
    document.addEventListener("fullscreenchange", onFullscreen);

    // keep the page from rubber-banding / pulling to refresh under the game
    const html = document.documentElement;
    const prevOverscroll = html.style.overscrollBehavior;
    const prevOverflow = html.style.overflow;
    html.style.overscrollBehavior = "none";
    html.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onFullscreen);
      html.style.overscrollBehavior = prevOverscroll;
      html.style.overflow = prevOverflow;
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  // keep the screen awake while racing on a phone
  useEffect(() => {
    if (hud.phase !== "racing" && hud.phase !== "countdown") return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    (navigator as WakeLockNavigator).wakeLock
      ?.request("screen")
      .then((l) => {
        if (cancelled) l.release().catch(() => {});
        else lock = l;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      lock?.release().catch(() => {});
    };
  }, [hud.phase]);

  const selectDriver = useCallback((id: string) => {
    const c = characterById(id);
    driverRef.current = c.id;
    setDriverId(c.id);
    gameRef.current?.selectCharacter(c.id);
    try {
      localStorage.setItem(DRIVER_KEY, c.id);
    } catch {
      // private mode etc. — the choice just won't stick between visits
    }
  }, []);
  const start = useCallback(() => gameRef.current?.start(), []);
  const restart = useCallback(() => gameRef.current?.restart(), []);
  const changeDriver = useCallback(() => gameRef.current?.backToLobby(), []);
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      gameRef.current?.setMuted(!m);
      return !m;
    });
  }, []);
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  }, []);

  if (failed) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-nero px-6 text-center text-white">
        <p className="font-pixel text-lg text-yellow-300">NO WEBGL</p>
        <p className="mt-4 max-w-sm text-white/75">
          Chelsea Kart needs WebGL, which this browser has turned off. Try another browser or device.
        </p>
        <Link href="/" className="mt-6 underline underline-offset-4">
          Back to the site
        </Link>
      </div>
    );
  }

  const controlsActive = hud.phase === "racing" || hud.phase === "countdown";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 touch-none overflow-hidden bg-[#7ec0ff] select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <Hud
        state={hud}
        isTouch={isTouch}
        muted={muted}
        fullscreen={fullscreen}
        fullscreenAvailable={fullscreenAvailable}
        selectedId={driverId}
        onSelect={selectDriver}
        onStart={start}
        onRestart={restart}
        onChangeDriver={changeDriver}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
      />
      {isTouch && <TouchControls channelRef={touchChannel} active={controlsActive} />}
    </div>
  );
}
