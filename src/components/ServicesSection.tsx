const SERVICES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Websites & web apps',
    text: 'A complete website for your business or idea — not just a pretty page, but one that works: people can sign up, pay, and manage things.',
    points: ['Online shop or business website', 'Login, payments and an admin panel', 'Looks good on phone and computer'],
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    title: 'Smart AI tools',
    text: 'Tools that use AI to answer questions, search your documents, or do repeat work for you — so you and your team save time every day.',
    points: ['A chat assistant for your website', 'Search inside your own documents', 'Automatic replies, summaries and reports'],
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
        <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 18.5" />
      </svg>
    ),
    title: 'Connecting your tools',
    text: 'You already use many apps. I connect them, so information moves by itself — no more copying and pasting the same thing again and again.',
    points: ['Connect payment, email and other apps', 'Jobs that run by themselves every day', 'Move data safely from one place to another'],
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: 'Advice & checking',
    text: 'Already have a website or an app? I look at it carefully and tell you, in plain words, what is slow, what is broken, and what to fix first.',
    points: ['Speed check and Google search check', 'Review of your code, with clear advice', 'Help choosing the right tools for your idea'],
  },
];

const PROCESS = [
  { num: '01', title: 'We talk', text: 'You tell me your idea, your time and your budget. No code yet.' },
  { num: '02', title: 'I send a plan', text: 'A clear written plan: what I will build, how long it takes, and the full price. No hidden cost.' },
  { num: '03', title: 'I build it', text: 'You see the work as it grows and can tell me what to change along the way.' },
  { num: '04', title: 'You launch', text: 'I put it online, hand it over, and show you how to use it.' },
];

const ServicesSection = () => {
  return (
    <section id="services" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">02 · Services</span>
        <h2>What I can build for you</h2>
        <p>
          Four kinds of work. <strong>Not sure which one you need?</strong> Send a message anyway — I will
          tell you honestly.
        </p>
      </div>

      <div className="mt-[26px] grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {SERVICES.map((svc) => (
          <div
            key={svc.title}
            className="rounded-[20px] border-[1.5px] border-line-soft bg-card p-[22px] transition-colors hover:border-cyan-deep"
          >
            <div className="mb-[14px] grid h-[50px] w-[50px] place-items-center rounded-[15px] border-[1.5px] border-line bg-card2 text-cyan">
              {svc.icon}
            </div>
            <h3 className="mb-[7px] text-[19.5px] font-extrabold leading-[1.2]">{svc.title}</h3>
            <p className="text-[15px] text-ink-soft">{svc.text}</p>
            <ul className="mb-0 ml-[17px] mt-[11px] grid list-disc gap-1 text-[14.5px] text-ink-soft">
              {svc.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2 lg:grid-cols-4" aria-label="How we work together">
        {PROCESS.map((step) => (
          <div
            key={step.num}
            className="rounded-[20px] border-[1.5px] border-line-soft bg-card2 p-5"
          >
            <div className="font-display text-[26px] font-black text-amber">{step.num}</div>
            <h4 className="mb-1 mt-[7px] text-[17px] font-extrabold">{step.title}</h4>
            <p className="text-[14.5px] text-ink-soft">{step.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-[18px] max-w-[72ch] text-base text-ink-soft">
        <strong className="text-ink">About price:</strong> every project is different, so there is no fixed
        price list. Send me a message about your project — I reply within 24 hours with a clear quote. You
        can pay per project, per hour, or talk about a part-time role.
      </p>
    </section>
  );
};

export default ServicesSection;
