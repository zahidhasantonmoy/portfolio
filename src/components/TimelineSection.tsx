"use client";
import React from 'react';

const TIMELINE = [
  {
    year: '2022',
    title: 'First real job experience',
    text: 'Worked as a data analysis intern at Tech Solutions Ltd. — learning how data is used in a real company.',
  },
  {
    year: '2024',
    title: 'Won a competition',
    text: 'Winner of a software development competition — for a working project built under time pressure.',
  },
  {
    year: 'Now',
    title: 'Studying and building',
    text: 'B.Sc in Computer Science at BUBT, focused on AI and software. Building projects and taking freelance work.',
  },
];

const TimelineSection = () => {
  return (
    <div className="mt-[18px] grid gap-3">
      {TIMELINE.map((row) => (
        <div
          key={row.year}
          className="grid grid-cols-[78px_1fr] gap-4 rounded-2xl border-[1.5px] border-line-soft bg-card px-[18px] py-4"
        >
          <span className="font-display text-[19px] font-bold text-amber">{row.year}</span>
          <div>
            <h4 className="text-[16.5px] font-extrabold">{row.title}</h4>
            <p className="text-[14.5px] text-ink-soft">{row.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineSection;
