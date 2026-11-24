"use client";
import { useState } from 'react';

const FAQS = [
  {
    q: 'Is Zahid free for work right now?',
    a: 'Yes. I take freelance projects and I am also open to full-time jobs — in websites, data work and AI tools. I work remotely, for clients in Bangladesh and in other countries.',
  },
  {
    q: 'What is he best at?',
    a: 'Building complete websites and web apps (the MERN way: MongoDB, Express, React, Node.js), working with data and simple AI models in Python, and making mobile apps with Flutter. The projects above show each of these.',
  },
  {
    q: 'Where is he based?',
    a: 'Mirpur, Dhaka, Bangladesh. Most of my work is remote, so your location does not matter.',
  },
  {
    q: 'What is his education?',
    a: 'I am studying for a B.Sc in Computer Science & Engineering at BUBT (Bangladesh University of Business and Technology), focused on AI, machine learning and software. Before that: a data analysis internship in 2022, and a software competition win in 2024.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">07 · Questions</span>
        <h2>Common questions</h2>
        <p>Tap a question to open the answer.</p>
      </div>

      <div className="mt-6 grid gap-[10px]">
        {FAQS.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl border-[1.5px] border-line-soft bg-card"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-5 py-[17px] text-left text-[17px] font-extrabold text-ink"
              >
                {faq.q}
                <span
                  className="flex-none text-[25px] font-black leading-none text-amber transition-transform duration-200"
                  style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {open && (
                <div className="max-w-[70ch] px-5 pb-[19px] text-ink-soft">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
