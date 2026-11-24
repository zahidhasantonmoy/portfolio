"use client";
import React from 'react';
import Image from 'next/image';
import TimelineSection from './TimelineSection';

const About = () => {
  return (
    <section id="story" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">04 · My story</span>
        <h2>The short version</h2>
        <p>The projects above are the long version.</p>
      </div>

      <div className="mt-[26px] grid gap-[26px] lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
        <figure className="overflow-hidden rounded-[22px] border-[1.5px] border-line-soft">
          <div className="relative h-[420px] w-full sm:h-[540px]">
            <Image
              src="/images/portrait-cafe.jpg"
              alt="Zahid Hasan Tonmoy out and about in Dhaka"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </figure>

        <div>
          <div className="text-[17.5px] text-ink-soft">
            <p className="mb-[13px]">
              My name is <strong className="text-ink">Zahid Hasan Tonmoy</strong>. I live in Mirpur, Dhaka,
              and I study Computer Science at BUBT university. I build things for the web, for phones, and
              with data.
            </p>
            <p className="mb-[13px]">
              What I enjoy most: taking a real problem and turning it into simple software that works. A shop
              that needs to sell online. Files that need to move from one phone to another. A drain that
              overflows in the rain. If it is a real problem, I like building the fix.
            </p>
            <p className="mb-[13px]">
              My mix is a little unusual: I write code, I work with data, and I also understand how people
              find and buy things online. So what I build is not just correct — it is made for real people to
              use.
            </p>
          </div>
          <TimelineSection />
        </div>
      </div>

      <div className="mt-[30px] overflow-hidden rounded-[22px] border-[1.5px] border-line-soft bg-card transition-colors hover:border-cyan-deep">
        <video
          controls
          preload="none"
          poster="/images/intro-poster.jpg"
          playsInline
          aria-label="Video: Zahid Hasan Tonmoy introduces himself in 10 seconds"
          className="block aspect-video w-full bg-black"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
          Your browser cannot play this video — everything in it is written in the story above.
        </video>
        <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1 px-5 pb-[18px] pt-4">
          <h3 className="text-[19px] font-extrabold">Meet me in 10 seconds</h3>
          <p className="text-[15px] text-ink-soft">
            A short video intro, recorded at my desk in Dhaka. Press play — it has sound.
          </p>
          <span className="ml-auto whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-cyan">
            0:10 · WITH SOUND
          </span>
        </div>
      </div>
    </section>
  );
};

export default About;
