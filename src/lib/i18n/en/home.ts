/**
 * English copy for /. OWNED BY ONE AGENT — see features/i18n-rtl/FEATURE.md.
 *
 * THE NAMESPACE'S SHAPE IS DEFINED HERE, in the English file, and `dictionary.ts` only imports
 * it. That is what keeps this a single-owner file: growing the namespace never means editing a
 * file another agent also touches.
 *
 * ⚠️ EXTRACT VERBATIM. Every string moved here must be byte-identical to what the component
 * said before, including curly apostrophes (’ U+2019) and any em dash. The English render is
 * verified as a no-op, so a "tidied" string is a regression.
 *
 * ⚠️ NO JSX, NO HTML, NO MARKUP. Where a `<br>` or an inner `<span>` IS a colour boundary, the
 * element stays in the component and the two runs come here as separately-named keys.
 *
 * ARRAY TYPING, and it matters: use a fixed-length TUPLE where the count is layout (a grid's
 * cells, a nav's slots), and `readonly string[]` where the count is how the language happens to
 * WRAP. Pinning the second kind forbids the divergence Hebrew needs; leaving the first kind
 * loose lets a layout break through.
 *
 * ─── WHY THE REPEATING SETS ARE OBJECTS KEYED BY id, NOT ARRAYS ───────────────────────────
 * Five tenants, three stats, five badges and six testimonial cards all repeat. None of them is
 * an array here, because an array — even a tuple — only checks the COUNT. Every one of these
 * sets is already declared in its component as a table of MEASURED GEOMETRY keyed by `id`
 * (`iconBox`, `titleMax`, `bodyTracking`, `labelWidth`, `border`, `numberCellPhone`), and the
 * copy has to line up with the right row of that table, not merely be the right length. So the
 * component keeps its geometry table, the dictionary keys the copy by the same `id`, and each
 * component derives its id union from THIS type (`keyof HomeDict["whyRogo"]["tenants"]`).
 * Renaming or dropping an id then fails the build in the component, and a Hebrew file missing
 * one key fails it in `Translated<>`. A tuple would have caught neither.
 *
 * ─── THE THREE STAT VALUES ARE IN HERE, AND THEY DO NOT TRANSLATE ─────────────────────────
 * `200+` · `2×` · `24/6` stay Latin digits in every locale. They live in the dictionary anyway,
 * because they are rendered text and one of them is also an `aria-label` — the same call the
 * repo already makes for `chrome.footer.copyrightYear` ("© 2026") and `copyrightHolder`
 * ("clix"). LogoCarousel's thirteen tool names go the other way and stay in the component:
 * those are trademarks paired 1:1 with an icon slug, i.e. structural data, not copy.
 */

/**
 * A stat label's second half. Typed WIDE on purpose — `as const` would infer the literal type
 * `null` from row 1 and then `Translated<>` would pass it through unwidened, forbidding Hebrew
 * from breaking a label English does not break. Line splitting is the language's business
 * (contract §3), so the type has to allow either.
 */
type StatTail = string | null;

export const home = {
  hero: {
    /* Two sentences on two hard lines. Separate keys rather than one string with a `\n`,
       because the break is authored — see Hero.tsx's own note on why. */
    headlineA: "You bring the business.",
    headlineB: "We bring the intelligence.",
    tagline:
      "AI agents, automations and custom software, built around how your team already works.",
    /* Same words as `chrome.nav.cta`, deliberately duplicated rather than shared: this is the
       hero's own CTA and `chrome` is Nav + Footer only. If the two ever diverge, they diverge. */
    cta: "Let’s start",
  },

  logoCarousel: {
    /* The row's accessible name. The thirteen tool names themselves are NOT here — see the
       header note. */
    ariaLabel: "Tools we build with",
  },

  /* The band under the hero since 2026-10-26, in the slot the testimonials left. The fourteen
     company names are NOT here: they are trademarks paired 1:1 with a logo file, and stay in
     Clients.tsx for the same reason LogoCarousel's tool names do. (`eyebrow` and `countLabel`
     came out the same day, with the "Clients" kicker and the "14 companies" figure.) */
  clients: {
    heading: "Companies we’ve worked with",
    body: "A few of the teams we’ve designed, built and automated for.",
  },

  testimonials: {
    /**
     * The heading, as RUNS. `readonly string[]`, not a tuple: the count is line fitting.
     *
     * ⚠️ IT IS RENDERED TWICE — once inside a `tablet:hidden` span with a `<br>` between the
     * runs, once inside a `hidden tablet:inline` span with the runs JOINED BY A SINGLE SPACE.
     * Two copies used to be authored by hand and had to be kept in sync; they are now one
     * array, so they cannot drift. English sets 2 runs (2 lines on phone, 1 above 810).
     * Hebrew sets 1 (see he/home.ts), which is why this must not be pinned to a tuple.
     */
    heading: ["In our clients’", "own words"] as readonly string[],
    /* Keyed by clip id — the id also names the video and poster file in public/testimonials/.
       `role: ""` is not an oversight: `elyashiv-engineering` is a COMPANY, and the card holds
       the slot open with a non-breaking space rather than inventing a job title for a firm.
       See Testimonials.tsx's note. */
    clips: {
      "asaf-peretz": { name: "Asaf Peretz", role: "Founder, SalesIQ" },
      "adir-peretz": {
        name: "Adir Peretz",
        role: "Owner, video & photography studio",
      },
      "nevo-yahaloman": { name: "Nevo Yahaloman", role: "Founder" },
      "noam-tovi": { name: "Noam Tovi", role: "Owner, investments" },
      achituv: { name: "Achituv", role: "Vtechezena" },
      "elyashiv-engineering": { name: "Elyashiv Engineering", role: "" },
    },
    /**
     * The six client quotes, in `CLIP_IDS` order, read by `sections/QuoteCarousel.tsx`.
     *
     * ⚠️⚠️ THESE ARE TRANSLATIONS, AND THEY ARE THE ONLY STRINGS ON THIS PAGE THAT ARE NEITHER
     * THE CLIENT'S WORDS NOR SOURCED FROM ANYWHERE.
     *
     * Every one of these six clients spoke HEBREW. The user supplied their wording on
     * 2026-08-13 (`quote.md`, repo root) and `he/home.ts` carries it verbatim — that file is
     * the source of truth for what was actually said. What sits below is a faithful English
     * rendering written in-repo, because the English page needs one.
     *
     * So the usual direction of this file is INVERTED here. Everywhere else the English is
     * authored and the Hebrew is a translation of it; in this one block the Hebrew is the
     * original. If a client supplies their own English wording, it replaces the string below
     * and the Hebrew does not change.
     *
     * ⚠️ THE QUOTES ARE ALSO THE SWITCH. `sections/Testimonials.tsx` decides between the video
     * accordion and this carousel by testing whether all six are non-empty — a render flag
     * could not do that job, because `PageDictProvider` serialises this whole namespace into
     * the RSC payload and an unrendered string still ships. **Emptying any one of these six
     * silently reverts the landing page to the accordion.** That is the intended failure mode,
     * not a bug; read the block above `CLIP_IDS` there before changing it.
     *
     * ⚠️ LENGTH IS LAYOUT. `SLIDE_STYLE.quoteDesktop` in QuoteCarousel.tsx sets a per-slide font
     * size fitted to these character counts — 174 / 207 / 289 / 189 / 267 / 140 as shipped, with
     * the two past ~260 taking 32px and the rest 36px. English is the binding case at both sizes
     * (Hebrew is shorter in every slot). Re-measure, do not re-count, if any of these change.
     */
    slides: [
      {
        quote:
          "They built me an automation that saved me a load of hours dealing with clients, and "
          + "freed up and saved me a lot of time and money. So that is a strong recommendation from me.",
        name: "Nevo Yahaloman",
        role: "Founder",
      },
      {
        quote:
          "The scoping itself and the way the process was carried out were at a very, very high "
          + "standard. The prices were the best value I found, and the end product is the highest "
          + "quality there is. Highly recommended!",
        name: "Asaf Peretz",
        role: "Founder, SalesIQ",
      },
      {
        quote:
          "I was looking for a system that would make my business more efficient and get it moving "
          + "faster with AI, mainly to open a gap over my competitors. I joined clix and they gave me "
          + "quality one-on-one guidance. Profits went up, turnover went up, and of course the "
          + "clients were much happier too.",
        name: "Adir Peretz",
        role: "Owner, video and photography studio",
      },
      {
        quote:
          "I came across them and I genuinely felt responsibility, professionalism and a fast, "
          + "smart solution from their team. Thank you so much for everything you did for me. I "
          + "highly recommend them!",
        name: "Noam Tovi",
        role: "Owner, investments",
      },
      {
        quote:
          "I wanted to say a big thank you for the amazing service and for the possibilities you "
          + "opened up for me. Everything was done in good taste and with real care, from the first "
          + "sales conversation through to the precise understanding of exactly what we are doing "
          + "together.",
        name: "Achituv",
        role: "Vtechezena",
      },
      {
        quote:
          "A brilliant system. It saves us a lot of time and quite a few costs, and it brings sense "
          + "and order to your head. I recommend it to everyone!",
        name: "Elyashiv Engineering",
        role: "",
      },
    ],
    a11y: {
      controls: "Slideshow pagination controls",
      portraitAlt: "{name}, {role}",
    },
  },

  /* LandingVideo's mute toggle. These two keys existed for a few hours on 2026-08-18, died
     with the toggle the same day ("remove this"), and RETURNED WITH IT on 2026-08-19 when the
     user re-exported landing-vid.mp4 with an audio track — sound and the control travel
     together, per the rule in LandingVideo.tsx. Wording matches clix.video verbatim; the keys
     are here rather than read from the clix namespace because usePageDict enforces one
     namespace per route. */
  video: {
    unmute: "Unmute",
    mute: "Mute",
  },

  whyRogo: {
    /**
     * The sticky headline, as RUNS separated by a `<br>` at every tier. `readonly string[]` —
     * line fitting again.
     *
     * ⚠️ THE RENDER RE-ADDS THE SPACE BEFORE THE `<br>`. The original JSX was
     * `The quiet mechanisms <br />`, and that trailing space is in the shipped HTML. The
     * component reproduces it (`run + " "` on every run but the last), the same idiom
     * Footer.tsx uses for `chrome.footer.tagline`. Do not put the space in the string.
     */
    heading: ["The quiet mechanisms", "behind modern business"] as readonly string[],
    tenants: {
      agents: {
        title: "AI agents that do the work",
        body: "Autonomous agents for sales, support, research and operations. They work in your brand’s voice, on your data, following your processes. Multi-agent orchestration with memory and tool use, voice agents for inbound and outbound calls, and human approval wherever it matters.",
      },
      whatsapp: {
        title: "The channel they already use",
        body: "Assistants on WhatsApp Business that book, sell, support and follow up. Connected to your CRM, payments, calendar and catalogue, and handing off to a person the moment one is needed.",
      },
      crm: {
        title: "One true picture of every customer",
        body: "Modern CRM installed, configured and wired into the tools your team actually opens. Data modelling and migration, pipeline and reporting, AI enrichment and lead scoring, plus the training that makes it survive contact with the team.",
      },
      integrations: {
        title: "Every tool you use, feeding one brain",
        body: "We wire payments, accounting, marketing and support into one stack, with n8n, Make and custom code. End-to-end workflow design, webhooks and middleware, internal dashboards, and the monitoring and retries for when something upstream breaks.",
      },
      strategy: {
        title: "Not every problem needs AI",
        body: "The ones that do need the right AI. We audit, prioritise, and decide what to build, what to buy and what to leave alone, weighing return, security and whether the choice still holds up two years from now.",
      },
    },
  },

  byTheNumbers: {
    heading: "By the numbers",
    /**
     * ⚠️ `lead` CARRIES ITS OWN TRAILING SPACE where a `tail` follows it, and that is
     * load-bearing rather than sloppy. The two halves are separated by a
     * `<br className="hidden tablet:inline">`, so below 810 the break is `display:none` and the
     * two runs weld into one sentence — the trailing space is the only thing that keeps
     * "Support capacity," from touching "without". Row 1 has `tail: null` and therefore no
     * trailing space. Hebrew must follow the same rule for whichever rows it gives a tail.
     */
    stats: {
      automations: {
        value: "200+",
        lead: "Automations running in production",
        tail: null as StatTail,
      },
      capacity: {
        value: "2×",
        lead: "Support capacity, ",
        tail: "without new hires" as StatTail,
      },
      coverage: {
        value: "24/6",
        lead: "Sales coverage ",
        tail: "outside office hours" as StatTail,
      },
    },
  },

  /* ⚠️ `security` (heading + five badge labels) WAS REMOVED FROM THIS DICTIONARY 2026-08-18,
     with the home section it fed (src/components/sections/Security.tsx). The five statements
     are NOT lost: security/SecurityCompliance.tsx, security/SecurityBenefits.tsx and
     product/ProductSecurity.tsx carry their own copies in their own namespaces, which is what
     the deleted block's own comment said would happen. Nothing to reconcile here any more. */
} as const;

export type HomeDict = typeof home;
