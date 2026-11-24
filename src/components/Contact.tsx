"use client";
import React, { useState } from 'react';
import { FaCheck, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NEED_OPTIONS = [
  'A website or web app',
  'A smart AI tool',
  'Connecting my tools / automation',
  'Advice & checking',
  'Something else',
];

const BUDGET_OPTIONS = [
  '৳25,000 or less',
  '৳25,000 – ৳100,000',
  'More than ৳100,000',
  "Let's discuss",
];

const WHEN_OPTIONS = ['As soon as possible', 'Within 1 month', 'In 2–3 months', 'No hurry'];

const WHATSAPP_URL =
  'https://wa.me/8801850077786?text=Hi%20Zahid%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20discuss%20a%20project.';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const need = String(formData.get('need') || '');
    const budget = String(formData.get('budget') || '');
    const when = String(formData.get('when') || '');
    const message = String(formData.get('message') || '').trim();

    setIsSubmitting(true);
    try {
      // /api/contact only accepts name/email/message, so need, budget and
      // when travel inside the message body (no mailto downgrade).
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message: `Need: ${need}\nBudget: ${budget}\nWhen: ${when}\n\nAbout the project:\n${message}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">08 · Contact</span>
        <h2>Start a project</h2>
      </div>

      <div className="mt-4 font-display text-[clamp(32px,6.6vw,62px)] font-black uppercase leading-[1.08]">
        Have a project?
        <br />
        <span className="text-cyan">Let&apos;s build it.</span>
      </div>
      <p className="mt-3 max-w-[72ch] text-[17.5px] text-ink-soft">
        Tell me what you want to make — a shop, an app, a tool. I reply within 24 hours with honest time and
        price, and a clear next step. <strong className="text-ink">No sales talk.</strong>
      </p>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-11">
        {isSuccess ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-[1.5px] border-line-soft bg-card p-8 text-center shadow-xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(34,197,94,0.1)]">
              <FaCheck className="text-3xl text-green" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-ink">Message Sent!</h3>
            <p className="text-ink-soft">
              Thanks for reaching out. I&apos;ll get back to you within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="mt-8 cursor-pointer rounded-lg border-[1.5px] border-line bg-card px-6 py-2 font-bold text-ink transition-colors hover:border-cyan hover:text-cyan"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="grid gap-[15px]">
            <div className="grid gap-[15px] sm:grid-cols-2">
              <div>
                <label htmlFor="f-name" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                  Your name *
                </label>
                <input
                  id="f-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="min-h-[50px] w-full rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
                />
              </div>
              <div>
                <label htmlFor="f-email" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                  Your email *
                </label>
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="min-h-[50px] w-full rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div className="grid gap-[15px] sm:grid-cols-2">
              <div>
                <label htmlFor="f-need" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                  What do you need?
                </label>
                <select
                  id="f-need"
                  name="need"
                  className="min-h-[50px] w-full rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
                >
                  {NEED_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-budget" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                  Budget
                </label>
                <select
                  id="f-budget"
                  name="budget"
                  className="min-h-[50px] w-full rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="f-when" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                When do you need it?
              </label>
              <select
                id="f-when"
                name="when"
                className="min-h-[50px] w-full rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
              >
                {WHEN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-msg" className="mb-1.5 block text-[14.5px] font-extrabold text-ink">
                Tell me about the project *
              </label>
              <textarea
                id="f-msg"
                name="message"
                required
                rows={4}
                className="min-h-[118px] w-full resize-y rounded-[13px] border-[1.5px] border-line bg-card px-[14px] py-3 text-base text-ink outline-none focus:border-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border-2 border-amber bg-amber px-6 py-[13px] text-[16.5px] font-black text-amber-ink transition-colors hover:border-cyan hover:bg-cyan hover:text-[#04121a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  Send message <FaPaperPlane className="text-sm" />
                </>
              )}
            </button>
            <p className="text-[13.5px] text-ink-mute">
              Your message goes straight to me — I reply within 24 hours.
            </p>
          </form>
        )}

        <div>
          <div className="grid gap-[10px]">
            <div className="rounded-2xl border-[1.5px] border-line-soft bg-card px-[18px] py-[15px]">
              <b className="mb-[3px] block font-mono text-[11.5px] uppercase tracking-[0.08em] text-cyan">
                Email
              </b>
              <a
                href="mailto:zahidhasantonmoy.dev@gmail.com"
                className="text-[17.5px] font-extrabold break-words hover:text-cyan"
              >
                zahidhasantonmoy.dev@gmail.com
              </a>
            </div>
            <div className="rounded-2xl border-[1.5px] border-line-soft bg-card px-[18px] py-[15px]">
              <b className="mb-[3px] block font-mono text-[11.5px] uppercase tracking-[0.08em] text-cyan">
                Phone / WhatsApp
              </b>
              <a href="tel:+8801850077786" className="text-[17.5px] font-extrabold hover:text-cyan">
                +880 1850 077786
              </a>
            </div>
            <div className="rounded-2xl border-[1.5px] border-line-soft bg-card px-[18px] py-[15px]">
              <b className="mb-[3px] block font-mono text-[11.5px] uppercase tracking-[0.08em] text-cyan">
                Where
              </b>
              <p className="text-[16.5px]">Mirpur, Dhaka, Bangladesh</p>
            </div>
            <div className="rounded-2xl border-[1.5px] border-line-soft bg-card px-[18px] py-[15px]">
              <b className="mb-[3px] block font-mono text-[11.5px] uppercase tracking-[0.08em] text-cyan">
                My main website
              </b>
              <a
                href="https://zahidhasantonmoy.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[17.5px] font-extrabold break-words hover:text-cyan"
              >
                zahidhasantonmoy.vercel.app ↗
              </a>
            </div>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[14px] flex min-h-[54px] items-center justify-center gap-[9px] rounded-[14px] border-2 border-[#128c4b] bg-[#128c4b] px-5 py-[13px] text-[16.5px] font-extrabold text-white transition-colors hover:border-[#0d7040] hover:bg-[#0d7040]"
          >
            Chat on WhatsApp — fastest reply
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
