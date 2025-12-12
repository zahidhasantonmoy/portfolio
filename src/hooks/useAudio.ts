"use client";
import { useCallback, useRef, useEffect } from 'react';

export const useAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on first user interaction if possible, or lazily
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }, []);

    const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Resume context if suspended (browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playClick = useCallback(() => {
        // Sharp, high-pitched mechanical click
        playTone(1200, 'sine', 0.1, 0.05);
        setTimeout(() => playTone(600, 'square', 0.05, 0.02), 10);
    }, []);

    const playHover = useCallback(() => {
        // Very subtle high tick
        playTone(800, 'sine', 0.03, 0.01);
    }, []);

    const playSuccess = useCallback(() => {
        // Major chord arpeggio
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // C Major
            setTimeout(() => playTone(freq, 'sine', 0.4, 0.05), i * 100);
        });
    }, []);

    const playSwoosh = useCallback(() => {
        // White noise swoosh approximation
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        // Filter to make it "whooshy"
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.2);
        filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }, []);

    return { playClick, playHover, playSuccess, playSwoosh };
};
