const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ============================ Icons (line, geometric) ============================ */
const Icon = ({ name, size = 18 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'pos': return (<svg {...p}><rect x="3.5" y="4.5" width="17" height="14" rx="2"/><path d="M3.5 9h17"/><path d="M8 13.5h3.5"/><circle cx="16.5" cy="14" r="1.2"/></svg>);
    case 'inv': return (<svg {...p}><path d="M3.5 7.5 12 4l8.5 3.5v9L12 20l-8.5-3.5z"/><path d="M3.5 7.5 12 11l8.5-3.5"/><path d="M12 11v9"/></svg>);
    case 'pay': return (<svg {...p}><circle cx="12" cy="12" r="8"/><path d="M9.5 9.5h4.5a2 2 0 0 1 0 4H10l4 4"/><path d="M9 13.5h6"/></svg>);
    case 'waste': return (<svg {...p}><path d="M4 7.5h16"/><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2"/><path d="M6 7.5 7 20h10l1-12.5"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>);
    case 'floor': return (<svg {...p}><circle cx="12" cy="12" r="8"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M4 12h3"/><path d="M17 12h3"/><path d="m15.5 8.5-3 3.5 4.5 1.5"/></svg>);
    case 'arrow': return (<svg {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>);
    case 'check': return (<svg {...p} strokeWidth="1.8"><path d="m5 12 5 5 9-11"/></svg>);
    case 'spark': return (<svg {...p}><path d="M12 4v6"/><path d="M12 14v6"/><path d="M4 12h6"/><path d="M14 12h6"/></svg>);
    case 'clock': return (<svg {...p}><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>);
    default: return null;
  }
};

/* ============================ Brand mark (inline SVG, original) ============================ */
const Wordmark = ({ height = 22 }) => (
  <svg height={height} viewBox="0 0 240 44" xmlns="http://www.w3.org/2000/svg" aria-label="Kurokaa">
    <g fill="none" stroke="#0A0F22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* K */}
      <path d="M6 6 V38"/>
      <path d="M6 22 L22 6"/>
      <path d="M6 22 L22 38"/>
      {/* U */}
      <path d="M32 6 V28 a8 8 0 0 0 16 0 V6"/>
      {/* R */}
      <path d="M58 38 V6 h10 a7 7 0 0 1 0 14 H58"/>
      <path d="M64 20 L74 38"/>
      {/* O */}
      <circle cx="92" cy="22" r="14"/>
      {/* K */}
      <path d="M114 6 V38"/>
      <path d="M114 22 L130 6"/>
      <path d="M114 22 L130 38"/>
      {/* A */}
      <path d="M140 38 L152 6 L164 38"/>
      <path d="M145 28 H159"/>
      {/* A */}
      <path d="M172 38 L184 6 L196 38"/>
      <path d="M177 28 H191"/>
    </g>
    {/* gold dots in the A's */}
    <circle cx="152" cy="32" r="2.2" fill="#B07A22"/>
    <circle cx="184" cy="32" r="2.2" fill="#B07A22"/>
    <text x="206" y="14" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7D7C87">TM</text>
  </svg>
);

/* ============================ Countdown ============================ */
const LAUNCH = new Date('2026-09-15T09:00:00+05:30').getTime();
function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  return { d, h, m, s };
}

/* ============================ Type-cycle ticker ============================ */
const TICKER_LINES = [
  'a 3-day vacation, finally',
  'inventory that counts itself',
  'a Floor Manager that suggests the pivot',
  'payroll, closed before midnight',
  '2–3 decisions, every five minutes',
];
function useTicker(lines, { type = 38, hold = 1600, erase = 22 } = {}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | holding | erasing
  useEffect(() => {
    const full = lines[i];
    let id;
    if (phase === 'typing') {
      if (text.length < full.length) id = setTimeout(() => setText(full.slice(0, text.length + 1)), type);
      else id = setTimeout(() => setPhase('holding'), hold);
    } else if (phase === 'holding') {
      id = setTimeout(() => setPhase('erasing'), hold);
    } else {
      if (text.length > 0) id = setTimeout(() => setText(text.slice(0, -1)), erase);
      else { setPhase('typing'); setI((i + 1) % lines.length); }
    }
    return () => clearTimeout(id);
  }, [text, phase, i, lines, type, hold, erase]);
  return text;
}

/* ============================ Nav ============================ */
const NAV = [
  { id: 'story', n: '01', label: 'Our Story' },
  { id: 'why',   n: '02', label: 'Why Us' },
  { id: 'what',  n: '03', label: 'What We Do' },
  { id: 'contact', n: '04', label: 'Get in Touch' },
];

function Nav({ active, onCta }) {
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
  };
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Wordmark height={22} />
        </a>
        <div className="nav-links">
          {NAV.map(n => (
            <button key={n.id} className="nav-link" data-active={active === n.id} onClick={() => go(n.id)}>
              <span className="num">{n.n}</span>{n.label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={onCta}>Request Access</button>
      </div>
    </nav>
  );
}

/* ============================ Hero ============================ */
function Hero({ onSubmitted }) {
  const { d, h, m, s } = useCountdown(LAUNCH);
  const tick = useTicker(TICKER_LINES);
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');
  const heroRef = useRef(null);

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    if (!validEmail(email)) {
      setState('error');
      setError('That email doesn’t look right. Try again?');
      return;
    }
    setState('sending');
    setTimeout(() => {
      setState('success');
      onSubmitted?.(email);
    }, 1100);
  }, [email, onSubmitted]);

  const onMove = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    heroRef.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    heroRef.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section className="hero" id="top" ref={heroRef} onMouseMove={onMove}>
      <div className="hero-spotlight"/>
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><span className="dot"/>Coming soon · Private beta · Closed circle</span>
            <h1>
              The agentic<br/>
              <em>operating system</em><br/>
              for Indian<br/>
              restaurants.
            </h1>
            <p className="lede">
              Kurokaa runs five agents — POS, Inventory, Payroll, Waste Prevention,
              and a Floor Manager — every five minutes, synthesising your raw operations
              into two or three decisions worth making today.
            </p>

            <form className="capture" onSubmit={onSubmit} noValidate>
              {state !== 'success' ? (
                <>
                  <div className={`capture-row ${state === 'error' ? 'error' : ''}`}>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@your-restaurant.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                    />
                    <button type="submit" disabled={state === 'sending'}>
                      {state === 'sending' ? 'Reserving…' : 'Get early access'}
                      <Icon name="arrow" size={14}/>
                    </button>
                  </div>
                  <div className={`capture-help ${state === 'error' ? 'error' : ''}`}>
                    {state === 'error' ? (
                      <span>{error}</span>
                    ) : (
                      <>
                        <span className="pill"><span className="dot"/>147 restaurants waitlisted</span>
                        <span>No spam. We write once a month, when there's something worth saying.</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="capture-help success" style={{marginTop: 0}}>
                  <span className="pill" style={{borderColor: 'var(--gold)', color: 'var(--gold)'}}>
                    <span className="dot"/>You're on the list
                  </span>
                  <span>We'll be in touch from <b style={{color:'var(--ink)'}}>hello@kurokaa.com</b> before launch.</span>
                </div>
              )}
            </form>
          </div>

          <div className="hero-meta">
            <div className="meta-card">
              <span className="eyebrow"><span className="dot"/>What you'll wake up to</span>
              <div className="ticker">
                <span>{tick}</span><span className="cursor"/>
              </div>
            </div>
            <div className="meta-card">
              <span className="eyebrow"><span className="dot"/>Launch window — Q3 2026</span>
              <div className="countdown" style={{marginTop: 12}}>
                <div className="cd-cell"><div className="cd-num">{String(d).padStart(2,'0')}</div><div className="cd-lbl">Days</div></div>
                <div className="cd-cell"><div className="cd-num">{String(h).padStart(2,'0')}</div><div className="cd-lbl">Hours</div></div>
                <div className="cd-cell"><div className="cd-num">{String(m).padStart(2,'0')}</div><div className="cd-lbl">Minutes</div></div>
                <div className="cd-cell"><div className="cd-num">{String(s).padStart(2,'0')}</div><div className="cd-lbl">Seconds</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-foot">
          <div className="stat"><div className="num">5</div><div className="lbl">Specialist agents</div></div>
          <div className="stat"><div className="num"><em>5</em> min</div><div className="lbl">Decision loop</div></div>
          <div className="stat"><div className="num">3-tier</div><div className="lbl">Recipe schema</div></div>
          <div className="stat"><div className="num">↓<em>15</em>%</div><div className="lbl">Avoidable waste</div></div>
          <div className="stat"><div className="num">1</div><div className="lbl">Owner. Finally free.</div></div>
        </div>
      </div>
    </section>
  );
}

/* ============================ Story ============================ */
function Story() {
  return (
    <section className="scene" id="story">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="eyebrow"><span className="dot"/>01 — Our Story</span>
            <h2>Born in the heat of a <em>10 PM dinner rush.</em></h2>
          </div>
          <div className="right">
            <p>Kurokaa wasn't born in a sterile boardroom. It was built in the whites, by a chef who learned to code because the kitchen's brain was still stuck in the 90s.</p>
          </div>
        </div>

        <div className="story-layout">
          <figure className="story-figure" aria-hidden="true">
            <div className="figure-body"/>
            <div className="figure-glyph"><span>Kuro</span><span className="acc">.</span><span>kaa</span><span className="acc">.</span></div>
            <div className="figure-tag">
              <span>Park Plaza · Pan-Asian line</span>
              <span>22:00 IST</span>
            </div>
            <figcaption className="figure-cap">
              <b>Founder portrait placeholder.</b> Drop in a hi-res photo of Abhishek in the kitchen — black-and-white, shoulders-up, against the pass.
            </figcaption>
          </figure>

          <div>
            <div className="story-copy">
              <p className="dropcap">
                Our founder, <b>Abhishek Bose</b>, spent years in the whites as a professional chef in Pan-Asian kitchens before trading the ladle for the keyboard. As a full-stack developer and AI evaluator, he kept hitting the same wall: while the kitchen equipment had evolved, the <em>brain of the restaurant</em> was still stuck in the 90s.
              </p>
              <p>
                Reports came in three days late. Inventory was a guess. The owner was the integration layer — and the moment they stepped out of the building, the business started to drift.
              </p>
              <p>
                Kurokaa is the partner he wishes he had — a system that doesn't just record history, but actually helps you write it. We combine the grit of a 19-hour kitchen shift with the precision of high-tier agentic AI to give Indian restaurateurs <em>a seat at their own table again.</em>
              </p>
            </div>

            <div className="story-meta">
              <div className="kv"><div className="k">Founder</div><div className="v">Abhishek Bose</div></div>
              <div className="kv"><div className="k">Background</div><div className="v">Chef · Full-stack dev · AI evaluator</div></div>
              <div className="kv"><div className="k">Home base</div><div className="v">Kolkata, India</div></div>
              <div className="kv"><div className="k">Built since</div><div className="v">2024</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ Why ============================ */
const PILLARS = [
  {
    n: '01',
    h: <>Owner <em>Freedom.</em></>,
    p: 'A 3-day vacation shouldn\'t be a business risk. Kurokaa runs the floor when you can\'t — so stepping away stops costing you margin.',
    cta: 'Reclaim your week',
  },
  {
    n: '02',
    h: <>Librarian <em>→</em> Orchestrator.</>,
    p: 'You stop reading yesterday and start composing tomorrow. We hand you the levers — pricing, prep, staffing — before the shift, not after.',
    cta: 'Make the pivot',
  },
  {
    n: '03',
    h: <>Bandwidth, <em>bought back.</em></>,
    p: 'Inventory, payroll, floor strategy — automated at the invisible mental layer. Kurokaa doesn\'t just save you money. It buys you back your time.',
    cta: 'Get your hours back',
  },
];

function Why() {
  return (
    <section className="scene why-scene" id="why">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="eyebrow"><span className="dot"/>02 — Why Us</span>
            <h2>The books are late. <em>The decisions are early.</em></h2>
          </div>
          <div className="right">
            <p>In Indian restaurants, the owner is the integration layer. Step out of the building and everything drifts. Our north star is simple: <em style={{color:'var(--gold-2)', fontStyle:'italic'}}>Owner Freedom.</em></p>
          </div>
        </div>

        <div className="pillars">
          {PILLARS.map((pl) => (
            <article key={pl.n} className="pillar" tabIndex={0}>
              <div className="pn">{pl.n}</div>
              <h3>{pl.h}</h3>
              <p>{pl.p}</p>
              <div className="underline"><span className="arr"/>{pl.cta}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ What ============================ */
const AGENTS = [
  { icon: 'pos',   n: '01', name: 'POS Agent',          blurb: 'Listens to every transaction in real time. Reconciles the till, the kitchen, and the books — so closeout takes ten minutes, not two hours.', span: 's4', tag: 'Live · since boot' },
  { icon: 'inv',   n: '02', name: 'Inventory Agent',    blurb: 'A 3-tier recipe schema that tracks every gram of sauce. Knows when the cumin is short before the prep cook does.', span: 's8', tag: 'Recipe-aware · per-gram' },
  { icon: 'pay',   n: '03', name: 'Payroll Agent',      blurb: 'Hours, overtime, shift swaps, statutory deductions — closed nightly. Zero spreadsheets, zero surprises on payday.', span: 's6', tag: 'Nightly close · IND compliant' },
  { icon: 'waste', n: '04', name: 'Waste Prevention',   blurb: 'Cross-checks prep against forward demand. Flags the over-production before it becomes Sunday\'s loss.', span: 's6', tag: 'Pre-shift signal' },
  { icon: 'floor', n: '05', name: 'Floor Manager',      blurb: 'Reads the room. Suggests a menu pivot during a demand spike, reroutes covers, calls the next service window before you do.', span: 's8', tag: 'Conversational · in-shift' },
];

function What() {
  const [active, setActive] = useState(null);
  return (
    <section className="scene" id="what">
      <div className="wrap">
        <div className="section-head">
          <div className="left">
            <span className="eyebrow"><span className="dot"/>03 — What We Do</span>
            <h2>Five agents. <em>One brain.</em><br/>Every five minutes.</h2>
          </div>
          <div className="right">
            <p>Kurokaa is the first true Agentic Operating System for the Indian restaurant ecosystem. We don't replace your POS — we give it a brain. Hover any agent to see it run.</p>
          </div>
        </div>

        <div className="agents-grid">
          {AGENTS.map((a, i) => (
            <article
              key={a.n}
              className={`agent ${a.span}`}
              data-active={active === a.n}
              onMouseEnter={() => setActive(a.n)}
              onMouseLeave={() => setActive((prev) => prev === a.n ? null : prev)}
              tabIndex={0}
            >
              <div className="agent-head">
                <div>
                  <div className="agent-num">AGENT {a.n}</div>
                  <div className="agent-name" style={{marginTop: 8}}>{a.name}</div>
                </div>
                <div className="agent-icon"><Icon name={a.icon} size={18}/></div>
              </div>
              <div className="agent-blurb">{a.blurb}</div>
              <div className="agent-foot">
                <span>{a.tag}</span>
                <span>↻ every 5 min</span>
              </div>
            </article>
          ))}
        </div>

        <div className="what-stat-row">
          <div className="ws">
            <div className="v">2–<em>3</em></div>
            <div className="k">Decisions surfaced per cycle</div>
          </div>
          <div className="ws">
            <div className="v">↓<em>15</em><sup>%</sup></div>
            <div className="k">Avoidable waste, on average</div>
          </div>
          <div className="ws">
            <div className="v">0<em>×</em></div>
            <div className="k">POS replacements required</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ Message capture ============================ */
const ROLES = ['Owner', 'Operator', 'Chef', 'Investor', 'Press', 'Curious'];
const SIZES = ['1 outlet', '2–4 outlets', '5–10 outlets', '10+ outlets', 'Pre-opening'];

function MessageCapture() {
  const [form, setForm] = useState({ name: '', email: '', restaurant: '', role: 'Owner', size: '2–4 outlets', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tell us what to call you.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'A real email, please.';
    if (!form.message.trim() || form.message.trim().length < 12) e.message = 'A sentence or two — what should we know?';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setState('sending');
    setTimeout(() => setState('sent'), 1200);
  };

  return (
    <section className="scene msg-scene" id="contact">
      <div className="wrap">
        <div className="msg-grid">
          <div className="msg-left">
            <span className="eyebrow"><span className="dot"/>04 — Get in Touch</span>
            <h2>Tell us about your <em>restaurant.</em></h2>
            <p>
              We're hand-picking the first cohort. If you run a kitchen — or are about to — we'd like to hear from you.
              The more specific you are about where the operation hurts, the better the conversation.
            </p>
            <div className="quote">
              "The owner shouldn't be the integration layer.
              That's the whole reason we built this."
              <span className="who">Abhishek Bose · Founder</span>
            </div>
          </div>

          <div>
            {state === 'sent' ? (
              <div className="form-success">
                <div className="check"><Icon name="check" size={22}/></div>
                <h3>Message <em>received.</em></h3>
                <p>Thanks, {form.name.split(' ')[0]}. We'll write back within two business days — usually faster.</p>
              </div>
            ) : (
              <form className="form-card" onSubmit={submit} noValidate>
                <div className="form-row">
                  <div className={`field ${errors.name ? 'err' : ''}`}>
                    <label htmlFor="f-name">Your name</label>
                    <input id="f-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Abhishek Bose"/>
                    {errors.name && <div className="err-msg">{errors.name}</div>}
                  </div>
                  <div className={`field ${errors.email ? 'err' : ''}`}>
                    <label htmlFor="f-email">Email</label>
                    <input id="f-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@your-restaurant.com"/>
                    {errors.email && <div className="err-msg">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="f-rest">Restaurant / Group <span style={{color:'var(--ink-mute)'}}>(optional)</span></label>
                    <input id="f-rest" type="text" value={form.restaurant} onChange={(e) => set('restaurant', e.target.value)} placeholder="e.g. Park Plaza, Pan-Asian"/>
                  </div>
                  <div className="field">
                    <label htmlFor="f-size">Operation size</label>
                    <select id="f-size" value={form.size} onChange={(e) => set('size', e.target.value)}>
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>You are a…</label>
                  <div className="role-chips" role="radiogroup">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        role="radio"
                        aria-checked={form.role === r}
                        className="chip"
                        data-on={form.role === r}
                        onClick={() => set('role', r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`field ${errors.message ? 'err' : ''}`}>
                  <label htmlFor="f-msg">
                    What should we know?
                    <span className="count">{form.message.length} / 600</span>
                  </label>
                  <textarea
                    id="f-msg"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value.slice(0, 600))}
                    placeholder="The shift where everything broke. The metric you can't get to. The vacation you haven't taken. Any of it."
                  />
                  {errors.message
                    ? <div className="err-msg">{errors.message}</div>
                    : <div className="hint">We read every message. No CRM auto-responder, we promise.</div>}
                </div>

                <div className="submit-row">
                  <div className="privacy">By submitting you agree we may write back. We don't sell data, ever.</div>
                  <button className="submit-btn" type="submit" disabled={state === 'sending'}>
                    {state === 'sending' ? 'Sending…' : 'Send message'}
                    <Icon name="arrow" size={14}/>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ Footer ============================ */
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <Wordmark height={26}/>
            <div className="blurb">"The invisible force behind great operations." Pre-launch — built quietly, with operators, in Kolkata.</div>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#story">Our Story</a>
            <a href="#why">Why Us</a>
            <a href="#what">What We Do</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h4>Reach us</h4>
            <a href="mailto:hello@kurokaa.com">hello@kurokaa.com</a>
            <a href="mailto:abhishek@kurokaa.com">abhishek@kurokaa.com</a>
            <a href="#contact">Press inquiries</a>
            <a href="#contact">Pilot program</a>
          </div>
        </div>
        <div className="foot-bottom">
          <div>© 2026 Kurokaa™ — All rights reserved.</div>
          <div className="right">
            <span>Pre-deployment · v0.9</span>
            <span>Made in Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================ Root ============================ */
function App() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const ids = NAV.map(n => n.id);
    const onScroll = () => {
      const y = window.scrollY + 100;
      let cur = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goContact = () => {
    const el = document.getElementById('contact');
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
  };

  return (
    <>
      <Nav active={active} onCta={goContact}/>
      <Hero/>
      <Story/>
      <Why/>
      <What/>
      <MessageCapture/>
      <Footer/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
