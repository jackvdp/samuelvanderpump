"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import type { HudState } from "./game/game";
import { cn } from "@/lib/utils";

export function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const tenths = Math.floor((t * 10) % 10);
  return `${m}:${s.toString().padStart(2, "0")}.${tenths}`;
}

function ordinal(n: number) {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return { n, suffix };
}

function PixelButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-pixel rounded-md border-4 border-black/80 bg-flame px-6 py-4 text-sm text-white shadow-[0_6px_0_rgba(0,0,0,0.6)] transition-transform hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </button>
  );
}

type Props = {
  state: HudState;
  isTouch: boolean;
  muted: boolean;
  fullscreen: boolean;
  fullscreenAvailable: boolean;
  onStart: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
};

export function Hud({
  state,
  isTouch,
  muted,
  fullscreen,
  fullscreenAvailable,
  onStart,
  onRestart,
  onToggleMute,
  onToggleFullscreen,
}: Props) {
  const racing = state.phase === "racing" || state.phase === "countdown" || state.phase === "finished";
  const pos = ordinal(state.position);
  const shadow = "[text-shadow:3px_3px_0_rgba(0,0,0,0.55)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-pixel text-white">
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-[max(env(safe-area-inset-left),14px)] pr-[max(env(safe-area-inset-right),14px)] pt-[max(env(safe-area-inset-top),12px)]">
        <div className={cn("transition-opacity", racing ? "opacity-100" : "opacity-0")}>
          <div className={cn("flex items-end gap-1 leading-none", shadow)}>
            <span className="text-4xl sm:text-5xl">{pos.n}</span>
            <span className="pb-0.5 text-base sm:text-lg">{pos.suffix}</span>
          </div>
          <div className={cn("mt-2 text-[11px] sm:text-sm", shadow)}>
            LAP {state.lap}/{state.totalLaps}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="pointer-events-auto flex gap-2">
            {fullscreenAvailable && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="flex size-10 items-center justify-center rounded-md border-2 border-black/70 bg-black/35 backdrop-blur-sm"
              >
                {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="flex size-10 items-center justify-center rounded-md border-2 border-black/70 bg-black/35 backdrop-blur-sm"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
          <div className={cn("text-right transition-opacity", racing ? "opacity-100" : "opacity-0")}>
            <div className={cn("text-lg tabular-nums sm:text-2xl", shadow)}>{formatTime(state.time)}</div>
            {state.bestLap !== null && (
              <div className={cn("mt-1 text-[10px] text-yellow-200 sm:text-xs", shadow)}>
                BEST {formatTime(state.bestLap)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* speed — kept clear of the kart and of the thumb controls */}
      {racing && (
        <div
          className={cn(
            "absolute",
            isTouch
              ? "left-[max(env(safe-area-inset-left),14px)] bottom-[calc(max(env(safe-area-inset-bottom),14px)+112px)] landscape:left-1/2 landscape:-translate-x-1/2 landscape:bottom-[max(env(safe-area-inset-bottom),22px)]"
              : "left-1/2 -translate-x-1/2 bottom-[max(env(safe-area-inset-bottom),20px)]"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 overflow-hidden rounded-sm border-2 border-black/70 bg-black/40 landscape:w-28 sm:w-40">
              <div
                className={cn("h-full transition-[width] duration-100", state.boosting ? "bg-yellow-300" : "bg-flame")}
                style={{ width: `${Math.min(100, state.speed * 72)}%` }}
              />
            </div>
            <span className={cn("whitespace-nowrap text-[10px] tabular-nums sm:text-xs", shadow)}>
              {Math.round(state.speed * 120)} km/h
            </span>
          </div>
        </div>
      )}

      {/* centre messages */}
      <div className="absolute inset-0 flex items-center justify-center">
        {state.countdown > 0 && (
          <div key={state.countdown} className={cn("animate-in zoom-in-50 fade-in text-7xl sm:text-9xl", shadow)}>
            {state.countdown}
          </div>
        )}
        {state.countdown === 0 && (
          <div className={cn("animate-in zoom-in-50 fade-in text-6xl text-yellow-300 sm:text-8xl", shadow)}>GO!</div>
        )}
        {state.wrongWay && state.countdown < 0 && (
          <div className={cn("animate-pulse text-xl text-red-300 sm:text-3xl", shadow)}>WRONG WAY</div>
        )}
      </div>

      {/* start screen */}
      {state.phase === "ready" && (
        <div className="pointer-events-auto absolute inset-0 flex overflow-y-auto bg-black/35 backdrop-blur-[2px] touch-pan-y">
          <div className="m-auto flex flex-col items-center px-6 py-8 text-center landscape:py-4">
            <p className="mb-3 text-[10px] tracking-widest text-white/80 sm:text-xs landscape:mb-2">
              SAMUEL VANDERPUMP PRESENTS
            </p>
            <h1 className={cn("text-4xl leading-tight text-yellow-300 sm:text-6xl landscape:text-3xl landscape:sm:text-5xl", shadow)}>
              BLOCK
              <br className="landscape:hidden" /> KART
            </h1>
            <p className="mt-5 max-w-md font-sans text-sm text-white/85 sm:text-base landscape:mt-3">
              Three laps around a blocky island. Hit the gold pads for a boost and hold drift through the corners.
            </p>
            <PixelButton onClick={onStart} className="mt-8 animate-pulse text-base sm:text-lg landscape:mt-4">
              {isTouch ? "TAP TO RACE" : "PRESS ENTER"}
            </PixelButton>
            <div className="mt-8 grid gap-1 font-sans text-xs text-white/75 sm:text-sm landscape:mt-4">
              {isTouch ? (
                <>
                  <p>Slide the left pad to steer · hold GAS to go</p>
                  <p>Hold DRIFT while turning, release for a mini boost</p>
                  <p className="text-white/55 landscape:hidden">Landscape gives you the widest view</p>
                </>
              ) : (
                <>
                  <p>Arrows / WASD to drive · Space to drift</p>
                  <p>Release a long drift for a mini boost · R to restart</p>
                </>
              )}
            </div>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 font-sans text-sm text-white/70 underline-offset-4 hover:text-white hover:underline landscape:mt-4"
            >
              <ArrowLeft className="size-4" /> Back to the site
            </Link>
          </div>
        </div>
      )}

      {/* results */}
      {state.phase === "finished" && state.results && (
        <div className="pointer-events-auto absolute inset-0 flex overflow-y-auto bg-black/45 backdrop-blur-[2px] touch-pan-y">
          <div className="m-auto flex w-full flex-col items-center px-6 py-8 text-center landscape:py-4">
          <h2 className={cn("text-3xl text-yellow-300 sm:text-5xl landscape:text-2xl landscape:sm:text-4xl", shadow)}>
            {state.position === 1 ? "YOU WIN!" : "FINISH!"}
          </h2>
          <p className={cn("mt-3 text-sm sm:text-base landscape:mt-2", shadow)}>
            {pos.n}
            {pos.suffix} PLACE · {formatTime(state.time)}
          </p>
          <ul className="mt-6 w-full max-w-xs space-y-2 text-left text-[10px] sm:text-xs landscape:mt-3 landscape:space-y-1">
            {state.results.map((r) => (
              <li
                key={r.name}
                className={cn(
                  "flex items-center gap-3 rounded-md border-2 border-black/60 px-3 py-2",
                  r.isPlayer ? "bg-white/25" : "bg-black/30"
                )}
              >
                <span className="w-6">{r.position}.</span>
                <span className="size-4 shrink-0 border-2 border-black/60" style={{ background: r.color }} />
                <span className="flex-1 truncate">{r.name}</span>
                <span className="tabular-nums">{r.time === null ? "—" : formatTime(r.time)}</span>
              </li>
            ))}
          </ul>
          {state.bestLap !== null && (
            <p className="mt-4 text-[10px] text-white/70 sm:text-xs landscape:mt-2">BEST LAP {formatTime(state.bestLap)}</p>
          )}
          <PixelButton onClick={onRestart} className="mt-6 landscape:mt-3">
            RACE AGAIN
          </PixelButton>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-white/70 underline-offset-4 hover:text-white hover:underline landscape:mt-3"
          >
            <ArrowLeft className="size-4" /> Back to the site
          </Link>
          </div>
        </div>
      )}
    </div>
  );
}
