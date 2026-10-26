import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Clients from "@/components/sections/Clients";
import LandingVideo from "@/components/sections/LandingVideo";
import WhyRogo from "@/components/sections/WhyRogo";
import ByTheNumbers from "@/components/sections/ByTheNumbers";
import ClixFelixFooter from "@/components/clix/ClixFelixFooter";
import Footer from "@/components/sections/Footer";
import { fetchModels } from "@/lib/models";
import type { Locale } from "@/lib/i18n/config";
import { seedLocale, getDict } from "@/lib/i18n/server";
import { PageDictProvider } from "@/lib/i18n/LocaleProvider";

export default async function HomeRoute({ locale }: { locale: Locale }) {
  /* Seeded here as well as in the root layout: this body is the direct parent of
     every section, so a server component below it can never read the locale before
     it is set, regardless of layout ordering. */
  seedLocale(locale);

  /* Awaited here rather than fetched inside Nav so the ticker is in the server-rendered HTML.
     A strip that appeared after hydration would push the fixed header down 45px in front of
     the visitor. (The stock version had a second, harder reason — Yahoo sent no CORS header
     so the browser could not call it at all. OpenRouter does; this one is layout.) */
  const models = await fetchModels();

  return (
    /* Client components below this point read their strings with
       usePageDict("home"). Server components use getDict().home directly and do not
       need the provider at all — it is here for the client half only. */
    <PageDictProvider name="home" value={getDict().home}>
      <>
        {/* Nav is `position:fixed` in the original and sits OUTSIDE <main> — it overlays the
            hero rather than displacing it, which is why the hero carries pt-156/120 to clear
            the banner + header rather than the page carrying a top offset. */}
        <Nav models={models} />
        <main>
          <Hero />
          {/* ⚠️ `<Testimonials />` ("In our clients' own words") WAS HERE AND WAS REMOVED
              2026-10-26 at the user's request, against a screenshot of the block. The component,
              its QuoteCarousel, `home.testimonials` and public/testimonials/ are all still in
              the repo, only unmounted — so the quotes still ride in this page's RSC payload
              until that dictionary key goes.

              Added the same day in its place: the clients band, direction 5 ("Columns") of the
              five the user was shown. A server component; its lanes are pure CSS. It carries
              `#clients`, which the nav's Customers link and the footer's Work link were
              repointed to from `/#testimonials`. See Clients.tsx. */}
          <Clients />
          {/* Added 2026-08-18 — /clix's video treatment, on the home page's rhythm. Its
              padding is the small half of a gap shared with the band above — the testimonials
              until 2026-10-26, the clients band since. See LandingVideo.tsx. */}
          <LandingVideo />
          <WhyRogo />
          {/* ⚠️ `<Security />` USED TO BE THE LAST SECTION HERE AND WAS REMOVED 2026-08-18 at
              the user's request — the "Your systems, your data, your control" badge row.
              The standalone /security route is a DIFFERENT page and is untouched; the nav and
              footer still link to it. By the numbers carried the dark handover to `bg-ink`
              while it was the last section; since 2026-08-20 the wordmark closer below sits
              between them, so the tint now settles back to paper before the footer. */}
          <ByTheNumbers />
          {/* Added 2026-08-20 at the user's request — /clix's oversized-wordmark closer, as
              the last thing before the footer. A server component reading getDict().clix
              directly, so it needs no PageDictProvider and the "home" provider above it is
              irrelevant to it. The section paints no background of its own (see its header),
              so here it sits on the page's paper ground between the numbers' dark tint and
              the bg-ink footer. */}
          <ClixFelixFooter />
        </main>
        {/* Outside <main>, as in the original — `footer` is a landmark sibling, not page
            content. The closing CTA lives inside it rather than as its own section. */}
        <Footer />
      </>
    </PageDictProvider>
  );
}
