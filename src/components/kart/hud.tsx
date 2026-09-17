"use client";

import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import type { HudState } from "./game/game";
import { CHARACTERS, characterById, type Character } from "./game/characters";
import { faceDataUrl } from "./game/driver-texture";
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

function hexColor(c: number) {
  return "#" + c.toString(16).padStart(6, "0");
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

function Face({ c, className }: { c: Character; className?: string }) {
  // a data URL generated on the client; next/image adds nothing here
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faceDataUrl(c)}
      alt=""
      width={16}
      height={16}
      draggable={false}
      className={cn("shrink-0 border-2 border-black/60 [image-rendering:pixelated]", className)}
    />
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[7px] text-white/70 sm:text-[8px]">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn("size-2 border border-black/60 sm:size-2.5", i <= value ? "bg-yellow-300" : "bg-white/20")}
          />
        ))}
      </div>
    </div>
  );
}

function DriverCard({ c, selected, onSelect }: { c: Character; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(c.id)}
      aria-pressed={selected}
      aria-label={`Race as ${c.name}`}
      className={cn(
        "flex flex-col items-center gap-1 rounded-md border-4 p-1.5 transition-transform",
        selected ? "scale-105 border-yellow-300 bg-white/25" : "border-black/60 bg-black/30 hover:bg-white/10"
      )}
      style={{ boxShadow: `inset 0 -5px 0 ${hexColor(c.color)}` }}
    >
      <Face c={c} className="size-9 sm:size-10" />
      <span className="max-w-full text-[6px] leading-tight break-words sm:text-[7px]">{c.first}</span>
    </button>
  );
}

type Props = {
  state: HudState;
  isTouch: boolean;
  muted: boolean;
  fullscreen: boolean;
  fullscreenAvailable: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  onRestart: () => void;
  onChangeDriver: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
};

export function Hud({
  state,
  isTouch,
  muted,
  fullscreen,
  fullscreenAvailable,
  selectedId,
  onSelect,
  onStart,
  onRestart,
  onChangeDriver,
  onToggleMute,
  onToggleFullscreen,
}: Props) {
  const racing = state.phase === "racing" || state.phase === "countdown" || state.phase === "finished";
  const pos = ordinal(state.position);
  const shadow = "[text-shadow:3px_3px_0_rgba(0,0,0,0.55)]";
  const selected = characterById(selectedId);
  const rivals = state.grid.filter((g) => !g.isPlayer);

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

      {/* lobby: title + driver select */}
      {state.phase === "ready" && (
        <div className="pointer-events-auto absolute inset-0 flex overflow-y-auto bg-black/35 backdrop-blur-[2px] touch-pan-y">
          <div className="m-auto flex w-full max-w-lg flex-col items-center px-4 py-8 text-center landscape:py-4">
            <p className="mb-3 text-[10px] tracking-widest text-white/80 sm:text-xs landscape:mb-2">
              SAMUEL VANDERPUMP PRESENTS
            </p>
            <h1 className={cn("text-4xl leading-tight text-yellow-300 sm:text-6xl landscape:text-3xl landscape:sm:text-5xl", shadow)}>
              CHELSEA
              <br className="landscape:hidden" /> KART
            </h1>
            <p className="mt-3 max-w-md font-sans text-xs text-white/80 sm:text-sm landscape:mt-2">
              Three laps of a blocky PFI: under the bridge, round the Bowl, through the esses and back over the flyover.
            </p>
            <p className="mt-4 text-[9px] tracking-widest text-white/80 sm:text-[10px] landscape:mt-2">PICK YOUR DRIVER</p>

            <div className="mt-3 grid w-full grid-cols-5 gap-1.5 sm:gap-2">
              {CHARACTERS.map((c) => (
                <DriverCard key={c.id} c={c} selected={c.id === selectedId} onSelect={onSelect} />
              ))}
            </div>

            <div className="mt-3 flex w-full items-center gap-3 rounded-md border-2 border-black/60 bg-black/35 p-3 text-left">
              <Face c={selected} className="size-14 sm:size-16" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="size-3 shrink-0 border-2 border-black/60" style={{ background: hexColor(selected.color) }} />
                  <span className="truncate text-[10px] sm:text-xs">{selected.name}</span>
                </div>
                <p className="mt-1 font-sans text-xs text-white/80 sm:text-sm">{selected.tagline}</p>
                <div className="mt-2 grid gap-1">
                  <StatBar label="SPD" value={selected.stats.speed} />
                  <StatBar label="ACC" value={selected.stats.accel} />
                  <StatBar label="HND" value={selected.stats.handling} />
                </div>
              </div>
            </div>

            <PixelButton onClick={onStart} className="mt-6 animate-pulse text-base sm:text-lg landscape:mt-4">
              RACE AS {selected.first.toUpperCase()}
            </PixelButton>
            {rivals.length > 0 && (
              <p className="mt-4 text-[8px] leading-relaxed text-white/70 sm:text-[9px]">
                ON THE GRID: {rivals.map((r) => r.first.toUpperCase()).join(" · ")}
              </p>
            )}

            <div className="mt-6 grid gap-1 font-sans text-xs text-white/75 sm:text-sm landscape:mt-4">
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
              className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-white/70 underline-offset-4 hover:text-white hover:underline landscape:mt-4"
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
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border-2 border-black/60 px-3 py-2",
                    r.isPlayer ? "bg-white/25" : "bg-black/30"
                  )}
                >
                  <span className="w-6">{r.position}.</span>
                  <Face c={characterById(r.id)} className="size-6" />
                  <span className="size-3 shrink-0 border-2 border-black/60" style={{ background: r.color }} />
                  <span className="flex-1 truncate">
                    {r.name}
                    {r.isPlayer && <span className="ml-1 text-yellow-200">(YOU)</span>}
                  </span>
                  <span className="tabular-nums">{r.time === null ? "—" : formatTime(r.time)}</span>
                </li>
              ))}
            </ul>
            {state.bestLap !== null && (
              <p className="mt-4 text-[10px] text-white/70 sm:text-xs landscape:mt-2">BEST LAP {formatTime(state.bestLap)}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 landscape:mt-3">
              <PixelButton onClick={onRestart}>RACE AGAIN</PixelButton>
              <PixelButton onClick={onChangeDriver} className="bg-black/50 text-xs">
                CHANGE DRIVER
              </PixelButton>
            </div>
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
