/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakToggle, TweakText, TweakColor */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   TWEAK DEFAULTS — editable on disk via __edit_mode_set_keys
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "crookedAmount": 2.2,
  "marqueeSpeed": 60,
  "showEditorialExtras": true,
  "ca": "0x00000000000000000000000000000000FL0MO",
  "twitterUrl": "https://x.com/flomo_fomo",
  "dexUrl": "https://dexscreener.com"
} /*EDITMODE-END*/;

/* ============================================================
   CROOKED — splits a string into per-char spans with pseudo-random rotation.
   Deterministic (seeded) so layout is stable between renders.
   ============================================================ */
function seededRand(i, seed = 7) {
  const x = Math.sin(i * 9301 + seed * 49297) * 233280;
  return x - Math.floor(x);
}

function Crooked({ text, amount = 2.2, seed = 1, className = "" }) {
  const chars = useMemo(() => {
    return text.split("").map((c, i) => {
      const r = (seededRand(i, seed) - 0.5) * 2 * amount;
      const y = (seededRand(i + 100, seed) - 0.5) * 2 * (amount * 0.6);
      return { c, r, y };
    });
  }, [text, amount, seed]);
  return (
    <span className={"crooked " + className}>
      {chars.map((ch, i) =>
      <span
        key={i}
        className="ch"
        style={{
          transform: `rotate(${ch.r}deg) translateY(${ch.y}px)`,
          whiteSpace: ch.c === " " ? "pre" : "normal"
        }}>
        
          {ch.c}
        </span>
      )}
    </span>);

}

/* ============================================================
   ICONS (inline, minimal)
   ============================================================ */
const IconTwitter = () =>
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>;

const IconDex = () =>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>;

const IconCopy = () =>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="1" />
    <path d="M5 15V5a1 1 0 0 1 1-1h10" />
  </svg>;


/* ============================================================
   HEADER
   ============================================================ */
function Masthead({ ca, twitterUrl, dexUrl }) {
  const [navOpen, setNavOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(function () {
    if (!navOpen) return;
    var onKey = function (e) { if (e.key === "Escape") setNavOpen(false); };
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }, [navOpen]);
  useEffect(function () {
    var onResize = function () {
      if (window.innerWidth > 900) setNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return function () { window.removeEventListener("resize", onResize); };
  }, []);
  const shortCa = useMemo(() => {
    if (!ca) return "0x000…000";
    if (ca.length <= 14) return ca;
    return ca.slice(0, 6) + "…" + ca.slice(-4);
  }, [ca]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = ca;document.body.appendChild(ta);ta.select();
      document.execCommand("copy");document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const closeNav = () => setNavOpen(false);
  return (
    <header className="masthead">
      <div className="container">
        <div className="masthead-inner">
          <div className="masthead-row-1">
            <div className="masthead-left">
              <span className="masthead-brand">$flomo</span>
              <span className="mono" style={{ color: "var(--muted)" }}>

</span>
            </div>
            <button
              type="button"
              className={"nav-burger" + (navOpen ? " is-open" : "")}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              aria-controls="main-nav"
              onClick={() => setNavOpen((o) => !o)}>
              <span className="nav-burger-lines" aria-hidden="true" />
            </button>
          </div>
          <nav className={"masthead-center" + (navOpen ? " is-open" : "")} id="main-nav">
            <a href="#who" className="nav-link" onClick={closeNav}>Who</a>
            <a href="#gallery" className="nav-link" onClick={closeNav}>Gallery</a>
            <a href="#about" className="nav-link" onClick={closeNav}>Manifesto</a>
            <a className="nav-link" href={twitterUrl} target="_blank" rel="noreferrer noopener" onClick={closeNav}>Community</a>
          </nav>
          <div className="masthead-right">
            <a className="pill twitter" href={twitterUrl} target="_blank" rel="noreferrer noopener">
              <IconTwitter /> Community
            </a>
            <a className="pill dex" href={dexUrl} target="_blank" rel="noreferrer noopener">
              <IconDex /> Dexscreener
            </a>
            <span className="ca-pill" title={ca}>
              <span className="ca-label">CA</span>
              <span className="ca-value">{shortCa}</span>
              <button className={"ca-copy" + (copied ? " copied" : "")} onClick={copy} aria-label="Copy contract address">
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          </div>
        </div>
      </div>
    </header>);}

/* ============================================================
   ISSUE META STRIP — masthead-style editorial line
   ============================================================ */
function IssueStrip() {
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();
  return (
    <div className="container">
      <div className="issue-strip">
        <div>
</div>
        <div className="dim">
</div>
        <div className="dim">
</div>
        <div style={{ textAlign: "right" }}>
</div>
      </div>
    </div>);}
/* ============================================================
   HERO
   ============================================================ */
function Hero({ crookedAmount }) {
  return (
    <section id="who" className="hero">
      <div className="container">

        <div className="hero-top">
          <div className="hero-issue">
</div>
          <div className="hero-kicker">
</div>
          <div className="hero-page">
</div>
        </div>

        <div className="hero-title-wrap">
          <div className="hero-who" style={{ fontFamily: "\"Permanent Marker\"" }}>
            Who is <span className="italic" style={{ fontFamily: "Caveat" }}>$flomo</span>?
          </div>
        </div>

        {/* Replace with main character image */}
        <div className="hero-image-wrap">
          <span className="corner tl"></span>
          <span className="corner tr"></span>
          <span className="corner bl"></span>
          <span className="corner br"></span>
          <img src="assets/hero-flork.png" alt="Main character placeholder" />
          <span className="hero-floater left"><span className="hero-arrow">→</span>him</span>
          <span className="hero-floater right">that's you ngmi<span className="hero-arrow" style={{ marginLeft: 6, marginRight: 0 }}>←</span></span>
          <span className="hero-image-caption">
</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Crooked text="$FLOMO — FLORK FOMO" amount={crookedAmount} seed={3} className="" />
          <div style={{ fontSize: "clamp(40px, 7vw, 84px)" }} aria-hidden="true" />
        </div>

        <div className="hero-billboard">
          <div>
            <div className="col-label">
</div>
            <div className="col-headline">welcome to flomo</div>
          </div>
          <div>
            <p className="hero-dropcap">
              You're awake at 4am sniping $SOL 20k mcaps on pump.fun.
              A WhatsApp sticker from 2013 is at 18M. A shrug with a bucket hat
              is outperforming your entire portfolio. Nothing personal — just an
              <span className="eth-diamond"></span>
              ETH season, served cold.
            </p>
          </div>
          <div>
            <div className="col-label" style={{ textAlign: "right" }}>Condition</div>
            <p style={{ textAlign: "right" }}>
              <strong>flomo</strong> <span style={{ color: "var(--muted)" }}>(n.)</span> —
              the specific dread of watching the wrong chain win
              while your notifications stay silent. Incurable, but community-supported.
            </p>
          </div>
        </div>
      </div>
    </section>);} /* ============================================================
TICKER
============================================================ */function Ticker() {
  const phrases = [
  "ETH SEASON",
  "FLORK FOMO",
  "DON'T TREAD ON ME",
  "WHATSAPP STICKER AT 18M",
  "GM TO THE BUCKET HAT",
  "MEME. BUT MAKE IT EDITORIAL.",
  "COPE RESPONSIBLY",
  "4AM IS A PERSONALITY"];

  const content =
  <>
      {phrases.map((p, i) =>
    <span key={i}>{p}<span className="dot" /></span>
    )}
    </>;

  return (
    <div className="ticker">
      <div className="ticker-track">
        {content}{content}{content}
      </div>
    </div>);

}

/* ============================================================
   GALLERY — 11 meme placeholders, editorial captions
   ============================================================ */
const MEMES = [
{ src: "assets/meme-01.png", caption: "mfw eth season", tag: "fig. 01" },
{ src: "assets/hero-flork.png", caption: "wen bridge", tag: "fig. 02" },
{ src: "assets/meme-03.png", caption: "bucket hat arc", tag: "fig. 03" },
{ src: "assets/meme-04.png", caption: "gn solana", tag: "fig. 04" },
{ src: "assets/about-flork.png", caption: "don't tread", tag: "fig. 05" },
{ src: "assets/meme-06.png", caption: "4am patrol", tag: "fig. 06" },
{ src: "assets/meme-07.png", caption: "cope gently", tag: "fig. 07" },
{ src: "assets/meme-08.png", caption: "2013 sticker", tag: "fig. 08" },
{ src: "assets/meme-09.png", caption: "shrug season", tag: "fig. 09" },
{ src: "assets/meme-10.png", caption: "fomo inbound", tag: "fig. 10" },
{ src: "assets/meme-11.png", caption: "long live flork", tag: "fig. 11" }];


function Gallery({ marqueeSpeed }) {
  const trackStyle = {
    animationDuration: `${marqueeSpeed}s`
  };
  const cards = MEMES.map((m, i) =>
  <article key={i} className={"meme-card" + (m.src ? "" : " placeholder")} data-index={i + 1}>
      {/* Replace MEME IMAGE {i+1} */}
      <span className="meme-index">{String(i + 1).padStart(2, "0")} / 11</span>
      {m.src ?
    <img src={m.src} alt={`Meme ${i + 1}`} /> :

    <>
          <span className="placeholder-tag">{m.tag}</span>
          <span className="placeholder-tag" style={{ borderStyle: "dashed" }}>
</span>
        </>}
      <span className="meme-caption">{m.caption}</span>
    </article>
  );

  return (
    <section id="gallery">
      <div className="container">
        <div className="section-header">
          <div className="section-label">
</div>
          <h2 className="section-title" style={{ fontFamily: "\"Permanent Marker\"" }}>
            Meme <span className="italic" style={{ fontFamily: "\"Permanent Marker\"" }}>Gallery</span>
          </h2>
          <div className="section-label right">
</div>
        </div>
        <div style={{ textAlign: "center", paddingBottom: 16 }}>
          <span className="section-sub">$flomo card collection</span>
        </div>
      </div>

      <div className="marquee-wrap" aria-label="Infinite meme marquee, hover to pause">
        <div className="marquee-track" style={trackStyle}>
          {cards}
          {cards /* duplicate for seamless loop */}
        </div>
      </div>

      <div className="container">
        <div className="marquee-footnote">
          <span>
</span>
          <span>
</span>
        </div>
      </div>
    </section>);} /* ============================================================
BIG WORD INTERSTITIAL
============================================================ */
function BigWord({ crookedAmount }) {
  return (
    <section className="bigword">
      <div className="container">
        <div className="sup">
</div>
        <div className="line1" style={{ fontFamily: "\"Permanent Marker\"" }}>
          a feeling, <span className="italic">finally</span>, named.
        </div>
        <div className="line2">
          <Crooked text="flomo" amount={crookedAmount + 0.5} seed={11} />
        </div>
      </div>
    </section>);
}

/* ============================================================
   ABOUT
   ============================================================ */
function About({ crookedAmount }) {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-head">
          <div className="about-kicker">
</div>
          <h2 className="about-title">
            <Crooked text="what is flomo" amount={crookedAmount} seed={5} />
          </h2>
        </div>
        <div className="about-grid">
          <div className="about-body">
            <p>
              Flomo is the feeling you get when a WhatsApp sticker from 2013 is
              outperforming the entire Solana memecoin market. Flomo is a movement.
            </p>
            <p>
              While you were grinding pump.fun, <span className="eth-diamond"></span> ETH
              was quietly building the biggest meme season in history. Flork leading it,
              and you missed it. That's <em>flomo</em>.
            </p>
            <p>
              But flomo isn't here to laugh at you. It is here to invite you.
              The bridge is open. ETH is waiting. The bucket hat fits everyone.
            </p>
            <p className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 28, letterSpacing: "0.2em" }}>

            </p>
          </div>

          {/* Replace with supporting meme image */}
          <div className="about-image">
            <div className="about-image-frame">
              <img src="assets/about-flork.png" alt="Supporting placeholder" />
            </div>
            <span className="about-image-tag"> DON'T TREAD ON ME</span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-value">01</div>
            <div className="stat-label">Chain · Ethereum</div>
          </div>
          <div className="stat">
            <div className="stat-value">SUPPLY: 1B</div>
            <div className="stat-label">Plates in the Collection</div>
          </div>
          <div className="stat">
            <div className="stat-value">LP: BURNED</div>
            <div className="stat-label">Preferred Exhibit Hour</div>
          </div>
          <div className="stat">
            <div className="stat-value">CONTRACT RENOUNCED</div>
            <div className="stat-label">Supply of Cope</div>
          </div>
        </div>
      </div>
    </section>);
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ ca, twitterUrl, dexUrl }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {await navigator.clipboard.writeText(ca);} catch {}
    setCopied(true);setTimeout(() => setCopied(false), 1400);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand" style={{ fontFamily: "\"Permanent Marker\"" }}>
              $flomo<span className="italic">.</span>
            </div>
            <p className="mono" style={{ marginTop: 20, color: "var(--muted)", lineHeight: 1.8 }}>
              An editorial meme coin<br />
              printed on Ethereum<br />
              read responsibly
            </p>
          </div>
          <div className="footer-col">
            <h4>COMMUNITY:</h4>
            <ul>
              <li><a className="twitter" href={twitterUrl} target="_blank" rel="noreferrer noopener">→ @flomo_fomo on X</a></li>
              <li><a className="dex" href={dexUrl} target="_blank" rel="noreferrer noopener">→ Dexscreener</a></li>
              <li><a href="#gallery">→ Gallery</a></li>
              <li><a href="#about">→ Manifesto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            {/* Replace footer image */}
            <div className="footer-image">
              <img src="assets/hero-flork.png" alt="Footer placeholder" />
            </div>
            <h4>Contract</h4>
            <ul>
              <li style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, wordBreak: "break-all", color: "var(--muted)" }}>{ca}</li>
              <li>
                <button
                  onClick={copy}
                  className="pill"
                  style={{ cursor: "pointer" }}>
                  
                  <IconCopy />
                  {copied ? "Copied to clipboard" : "Copy address"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-mid">
          <div className="disclaimer">
            This is a meme coin. Nothing here is financial advice. Do your own research —
            and please, touch grass between candles.
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ color: "var(--muted)" }}>
</div>
            <div className="mono" style={{ marginTop: 4 }}>
</div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} · $flomo editorial</span>
          <span>printed on <span className="eth-diamond" style={{ background: "currentColor" }}></span> ethereum</span>
          <span>
</span>
        </div>
      </div>
    </footer>);}
/* ============================================================
   TWEAKS PANEL
   ============================================================ */
function Tweaks({ tweaks, set }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Typography chaos">
        <TweakSlider
          label="Heading crookedness"
          value={tweaks.crookedAmount}
          min={0} max={6} step={0.1}
          onChange={(v) => set("crookedAmount", v)} />
        
      </TweakSection>
      <TweakSection title="Gallery">
        <TweakSlider
          label="Marquee speed (seconds per loop)"
          value={tweaks.marqueeSpeed}
          min={20} max={120} step={1}
          onChange={(v) => set("marqueeSpeed", v)} />
        
      </TweakSection>
      <TweakSection title="Contract & socials">
        <TweakText
          label="Contract address"
          value={tweaks.ca}
          onChange={(v) => set("ca", v)} />
        
        <TweakText
          label="Community (X) URL"
          value={tweaks.twitterUrl}
          onChange={(v) => set("twitterUrl", v)} />
        
        <TweakText
          label="Dexscreener URL"
          value={tweaks.dexUrl}
          onChange={(v) => set("dexUrl", v)} />
        
      </TweakSection>
    </TweaksPanel>);

}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [tweaks, set] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <Masthead ca={tweaks.ca} twitterUrl={tweaks.twitterUrl} dexUrl={tweaks.dexUrl} />
      <IssueStrip />
      <Hero crookedAmount={tweaks.crookedAmount} />
      <Ticker />
      <Gallery marqueeSpeed={tweaks.marqueeSpeed} />
      <BigWord crookedAmount={tweaks.crookedAmount} />
      <About crookedAmount={tweaks.crookedAmount} />
      <Footer ca={tweaks.ca} twitterUrl={tweaks.twitterUrl} dexUrl={tweaks.dexUrl} />
      <Tweaks tweaks={tweaks} set={set} />
    </>);

}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);