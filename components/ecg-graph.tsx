"use client";

import { useEffect, useRef } from "react";
import { ResizeObserver } from "@juggle/resize-observer";

interface ECGGraphProps {
  bpm: number;
  isRunning: boolean;
}

const BACKGROUND_COLOR = "#050a08";
const GRID_COLOR = "rgba(0, 255, 157, 0.1)";
const LINE_COLOR = "rgba(0, 255, 157, 1)";
const GRID_SIZE = 40;
const LINE_WIDTH = 2;
const DOT_RADIUS = 3;
const SHADOW_BLUR = 10;
const DOT_SHADOW_BLUR = 5;
const FADE_DISTANCE = 400;
const DEFAULT_BPM = 60;
const MS_PER_MINUTE = 60000;

const ECG_PHASES = {
  P_WAVE_DURATION: 10,
  P_WAVE_AMPLITUDE: -5,
  GAP_1_DURATION: 5,
  QRS_Q_DURATION: 5,
  QRS_Q_AMPLITUDE: 5,
  QRS_R_DURATION: 10,
  QRS_R_AMPLITUDE: -120,
  QRS_S_DURATION: 10,
  QRS_S_AMPLITUDE: 130,
  GAP_2_DURATION: 10,
  T_WAVE_DURATION: 20,
  T_WAVE_AMPLITUDE: -15,
} as const;

export function ECGGraph({ bpm, isRunning }: ECGGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const bpmRef = useRef(bpm);
  const stateRef = useRef<{
    history: number[];
    baseline: number;
    lastBeatTime: number;
    phase: string;
    phaseProgress: number;
  }>({
    history: [],
    baseline: 0,
    lastBeatTime: 0,
    phase: "flat",
    phaseProgress: 0,
  });

  // Update BPM ref without restarting the animation
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Handle canvas resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        dpr = window.devicePixelRatio || 1;

        // Set canvas buffer size (actual pixels)
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Set display size (CSS pixels)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Initialize history - we need width points to fill 0 to width-1
        const state = stateRef.current;
        state.baseline = height / 2;
        const numPoints = Math.ceil(width);
        state.history = new Array(numPoints).fill(state.baseline);
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Animation loop
    const render = (time: number) => {
      if (!isRunning || width === 0 || height === 0) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const state = stateRef.current;
      state.baseline = height / 2;

      const currentBpm = bpmRef.current || DEFAULT_BPM;
      const beatInterval = MS_PER_MINUTE / currentBpm;
      const timeSinceLastBeat = time - state.lastBeatTime;

      if (timeSinceLastBeat > beatInterval) {
        state.lastBeatTime = time;
        state.phase = "p_start";
        state.phaseProgress = 0;
      }

      let yOffset = 0;

      if (state.phase !== "flat") {
        state.phaseProgress++;

        if (state.phase === "p_start") {
          if (state.phaseProgress < ECG_PHASES.P_WAVE_DURATION) {
            yOffset =
              ECG_PHASES.P_WAVE_AMPLITUDE *
              Math.sin(
                (state.phaseProgress / ECG_PHASES.P_WAVE_DURATION) * Math.PI
              );
          } else {
            state.phase = "gap_1";
            state.phaseProgress = 0;
          }
        } else if (state.phase === "gap_1") {
          if (state.phaseProgress > ECG_PHASES.GAP_1_DURATION) {
            state.phase = "qrs";
            state.phaseProgress = 0;
          }
        } else if (state.phase === "qrs") {
          const qrsTotalDuration =
            ECG_PHASES.QRS_Q_DURATION +
            ECG_PHASES.QRS_R_DURATION +
            ECG_PHASES.QRS_S_DURATION;

          if (state.phaseProgress < ECG_PHASES.QRS_Q_DURATION) {
            yOffset =
              ECG_PHASES.QRS_Q_AMPLITUDE *
              (state.phaseProgress / ECG_PHASES.QRS_Q_DURATION);
          } else if (
            state.phaseProgress <
            ECG_PHASES.QRS_Q_DURATION + ECG_PHASES.QRS_R_DURATION
          ) {
            const progress = state.phaseProgress - ECG_PHASES.QRS_Q_DURATION;
            yOffset =
              ECG_PHASES.QRS_Q_AMPLITUDE +
              ECG_PHASES.QRS_R_AMPLITUDE *
                (progress / ECG_PHASES.QRS_R_DURATION);
          } else if (state.phaseProgress < qrsTotalDuration) {
            const progress =
              state.phaseProgress -
              ECG_PHASES.QRS_Q_DURATION -
              ECG_PHASES.QRS_R_DURATION;
            const minY =
              ECG_PHASES.QRS_Q_AMPLITUDE + ECG_PHASES.QRS_R_AMPLITUDE;
            yOffset =
              minY +
              ECG_PHASES.QRS_S_AMPLITUDE *
                (progress / ECG_PHASES.QRS_S_DURATION);
          } else {
            state.phase = "gap_2";
            state.phaseProgress = 0;
          }
        } else if (state.phase === "gap_2") {
          if (state.phaseProgress > ECG_PHASES.GAP_2_DURATION) {
            state.phase = "t_wave";
            state.phaseProgress = 0;
          }
        } else if (state.phase === "t_wave") {
          if (state.phaseProgress < ECG_PHASES.T_WAVE_DURATION) {
            yOffset =
              ECG_PHASES.T_WAVE_AMPLITUDE *
              Math.sin(
                (state.phaseProgress / ECG_PHASES.T_WAVE_DURATION) * Math.PI
              );
          } else {
            state.phase = "flat";
            state.phaseProgress = 0;
          }
        }
      }

      // Add new point and remove oldest
      const newY = state.baseline + yOffset;
      state.history.shift();
      state.history.push(newY);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x < width; x += GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.moveTo(width, 0);
      ctx.lineTo(width, height);

      for (let y = 0; y < height; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();

      const historyLength = state.history.length;

      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const fadeStart = Math.max(0, width - FADE_DISTANCE);
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(0, 255, 157, 0)");
      gradient.addColorStop(fadeStart / width, LINE_COLOR);
      gradient.addColorStop(0.95, LINE_COLOR);
      gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = LINE_WIDTH;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowColor = "rgba(0, 255, 157, 0.8)";

      for (let i = 0; i < historyLength; i++) {
        const x = i * (width / (historyLength - 1));
        const y = state.history[i];

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      const lastX = (historyLength - 1) * (width / (historyLength - 1));
      const lastY = state.history[historyLength - 1];

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = DOT_SHADOW_BLUR;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.arc(lastX, lastY, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isRunning]); // Removed bpm from dependencies to prevent restart

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
