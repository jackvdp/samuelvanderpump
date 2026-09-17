"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { InputChannel } from "./game/input";
import { cn } from "@/lib/utils";

// On-screen controls for phones. Everything writes straight into the shared
// input channel (no React state) so the game loop always sees the latest
// finger positions without re-rendering. Multi-touch works because each
// finger gets its own pointerId and each control tracks only its own.

function HoldButton({
  label,
  className,
  onChange,
}: {
  label: string;
  className?: string;
  onChange: (down: boolean) => void;
}) {
  const active = useRef<number | null>(null);
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (active.current !== null) return;
    active.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    e.currentTarget.dataset.down = "true";
    onChange(true);
  };
  const up = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (active.current !== e.pointerId) return;
    active.current = null;
    delete e.currentTarget.dataset.down;
    onChange(false);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "flex items-center justify-center rounded-full border-4 border-black/70 bg-white/25 font-pixel text-black/85 shadow-[0_6px_0_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform select-none touch-none data-[down=true]:translate-y-1 data-[down=true]:bg-white/60 data-[down=true]:shadow-[0_2px_0_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {label}
    </button>
  );
}

export function TouchControls({
  channelRef,
  active,
}: {
  channelRef: RefObject<InputChannel>;
  active: boolean;
}) {
  const padRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const steerPointer = useRef<number | null>(null);

  const setSteer = (v: number) => {
    channelRef.current.steer = v;
    if (thumbRef.current) thumbRef.current.style.transform = `translateX(${v * 100}%)`;
  };

  const steerFromEvent = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = padRef.current!.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    let v = rel / 0.34;
    if (Math.abs(v) < 0.1) v = 0;
    setSteer(Math.max(-1, Math.min(1, v)));
  };

  const padDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (steerPointer.current !== null) return;
    steerPointer.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    steerFromEvent(e);
  };
  const padMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (steerPointer.current !== e.pointerId) return;
    steerFromEvent(e);
  };
  const padUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (steerPointer.current !== e.pointerId) return;
    steerPointer.current = null;
    setSteer(0);
  };

  // release everything if the page loses focus mid-race
  useEffect(() => {
    const reset = () => {
      const channel = channelRef.current;
      channel.steer = 0;
      channel.throttle = 0;
      channel.brake = 0;
      channel.drift = false;
      steerPointer.current = null;
      if (thumbRef.current) thumbRef.current.style.transform = "translateX(0)";
    };
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      reset();
    };
  }, [channelRef]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 px-[max(env(safe-area-inset-left),14px)] pb-[max(env(safe-area-inset-bottom),14px)] pr-[max(env(safe-area-inset-right),14px)] transition-opacity duration-300",
        active ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {/* steering pad */}
      <div
        ref={padRef}
        onPointerDown={padDown}
        onPointerMove={padMove}
        onPointerUp={padUp}
        onPointerCancel={padUp}
        onLostPointerCapture={padUp}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative h-24 w-[46vw] max-w-72 rounded-full border-4 border-black/70 bg-white/25 shadow-[0_6px_0_rgba(0,0,0,0.45)] backdrop-blur-sm select-none touch-none",
          active && "pointer-events-auto"
        )}
        aria-label="Steering"
        role="slider"
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={0}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-pixel text-xl text-black/70">
          ◀
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-pixel text-xl text-black/70">
          ▶
        </span>
        <div className="pointer-events-none absolute inset-y-2 left-1/2 w-[34%] -translate-x-1/2">
          <div
            ref={thumbRef}
            className="mx-auto h-full w-16 rounded-full border-4 border-black/70 bg-flame/90 shadow-[0_3px_0_rgba(0,0,0,0.4)] will-change-transform"
          />
        </div>
      </div>

      {/* pedals */}
      <div className={cn("flex items-end gap-3", active && "pointer-events-auto")}>
        <div className="flex flex-col items-center gap-3">
          <HoldButton
            label="DRIFT"
            className="size-16 text-[10px]"
            onChange={(d) => {
              channelRef.current.drift = d;
            }}
          />
          <HoldButton
            label="BRAKE"
            className="size-16 text-[10px]"
            onChange={(d) => {
              channelRef.current.brake = d ? 1 : 0;
            }}
          />
        </div>
        <HoldButton
          label="GAS"
          className="size-28 bg-flame/70 text-sm data-[down=true]:bg-flame"
          onChange={(d) => {
            channelRef.current.throttle = d ? 1 : 0;
          }}
        />
      </div>
    </div>
  );
}
