import { BentoCard } from '@/components/landing-page/bento-card';
import { Button } from '@/components/landing-page/button';
import { Container } from '@/components/landing-page/container';
import { Footer } from '@/components/landing-page/footer';
import { Gradient, GradientBackground } from '@/components/landing-page/gradient';
import { Keyboard } from '@/components/landing-page/keyboard';
import { Link } from '@/components/landing-page/link';
import { LinkedAvatars } from '@/components/landing-page/linked-avatars';
import { LogoCloud } from '@/components/landing-page/logo-cloud';
import { LogoCluster } from '@/components/landing-page/logo-cluster';
import { LogoTimeline } from '@/components/landing-page/logo-timeline';
import { Map } from '@/components/landing-page/map';
import { Navbar } from '@/components/landing-page/navbar';
import { Screenshot } from '@/components/landing-page/screenshot';
import { Testimonials } from '@/components/landing-page/testimonials';
import { Heading, Subheading } from '@/components/landing-page/text';
import { ChevronRightIcon } from '@heroicons/react/16/solid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  description:
    'Agentive helps you sell more by revealing sensitive information about your customers.',
};

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-3xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar
          banner={
            <Link
              href="#"
              className="flex items-center gap-1 rounded-full bg-fuchsia-950/35 px-3 py-0.5 text-sm font-medium text-white hover:bg-fuchsia-950/30 leading-6"
            >
              Agentive allow to plan you perfect trip, find the best restaurants and the best deals.
              <ChevronRightIcon className="size-4" />
            </Link>
          }
        />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
          <h1 className="font-display text-6xl font-medium tracking-tight text-gray-950 sm:text-8xl md:text-9xl leading-none">
            Close every deal.
          </h1>
          <p className="mt-8 max-w-lg text-xl font-medium text-gray-950/75 sm:text-2xl leading-7 sm:leading-8">
            Agentive helps you sell more by revealing sensitive information about your customers.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href="/app">Get started</Button>
            <Button variant="secondary" href="/pricing">
              See pricing
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function FeatureSection() {
  return (
    <div className="overflow-hidden">
      <Container className="pb-32">
        <Heading as="h2" className="max-w-3xl">
          A snapshot of your entire sales pipeline.
        </Heading>
        <Screenshot
          width={1216}
          height={768}
          src="/screenshots/app.png"
          className="mt-16 h-[36rem] sm:h-auto sm:w-[76rem]"
        />
      </Container>
    </div>
  );
}

function BentoSection() {
  return (
    <Container>
      <Subheading>Sales</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Know more about your customers than they do.
      </Heading>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Insight"
          title="Get perfect clarity"
          description="Agentive uses social engineering to build a detailed financial picture of your leads. Know their budget, compensation package, social security number, and more."
          graphic={
            <div
              className="h-80 bg-[url(/screenshots/profile.png)] bg-cover bg-no-repeat"
              style={{
                backgroundSize: '1000px 560px',
                backgroundPosition: 'left -109px top -112px',
              }}
            />
          }
          fade={['bottom']}
          className="max-lg:rounded-t-3xl lg:col-span-3 lg:rounded-tl-3xl"
        />
        <BentoCard
          eyebrow="Analysis"
          title="Undercut your competitors"
          description="With our advanced data mining, you’ll know which companies your leads are talking to and exactly how much they’re being charged."
          graphic={
            <div
              className="absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-cover bg-no-repeat"
              style={{ backgroundSize: '1100px 650px', backgroundPosition: 'left -38px top -73px' }}
            />
          }
          fade={['bottom']}
          className="lg:col-span-3 lg:rounded-tr-3xl"
        />
        <BentoCard
          eyebrow="Speed"
          title="Built for power users"
          description="It’s never been faster to cold email your entire contact list using our streamlined keyboard shortcuts."
          graphic={
            <div className="flex size-full pt-10 pl-10">
              <Keyboard highlighted={['LeftCommand', 'LeftShift', 'D']} />
            </div>
          }
          className="lg:col-span-2 lg:rounded-bl-3xl"
        />
        <BentoCard
          eyebrow="Source"
          title="Get the furthest reach"
          description="Bypass those inconvenient privacy laws to source leads from the most unexpected places."
          graphic={<LogoCluster />}
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Limitless"
          title="Sell globally"
          description="Agentive helps you sell in locations currently under international embargo."
          graphic={<Map />}
          className="max-lg:rounded-b-3xl lg:col-span-2 lg:rounded-br-3xl"
        />
      </div>
    </Container>
  );
}

function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-3xl bg-gray-900 py-32">
      <Container>
        <Subheading dark>Outreach</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl text-white">
          Customer outreach has never been easier.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Networking"
            title="Sell at the speed of light"
            description="Our AgentiveAI chat assistants analyze the sentiment of your conversations in real time, ensuring you're always one step ahead."
            graphic={
              <div
                className="h-80 bg-[url(/screenshots/networking.png)] bg-cover bg-no-repeat"
                style={{ backgroundSize: '851px 344px' }}
              />
            }
            fade={['top']}
            className="max-lg:rounded-t-3xl lg:col-span-4 lg:rounded-tl-3xl"
          />
          <BentoCard
            dark
            eyebrow="Integrations"
            title="Meet leads where they are"
            description="With thousands of integrations, no one will be able to escape your cold outreach."
            graphic={<LogoTimeline />}
            // `overflow-visible!` is needed to work around a Chrome bug that disables the mask on the graphic.
            className="z-10 overflow-visible lg:col-span-2 lg:rounded-tr-3xl"
          />
          <BentoCard
            dark
            eyebrow="Meetings"
            title="Smart call scheduling"
            description="Automatically insert intro calls into your leads' calendars without their consent."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-3xl"
          />
          <BentoCard
            dark
            eyebrow="Engagement"
            title="Become a thought leader"
            description="AgentiveAI automatically writes LinkedIn posts that relate current events to B2B sales, helping you build a reputation as a thought leader."
            graphic={
              <div
                className="h-80 bg-[url(/screenshots/engagement.png)] bg-cover bg-no-repeat"
                style={{ backgroundSize: '851px 344px' }}
              />
            }
            fade={['top']}
            className="max-lg:rounded-b-3xl lg:col-span-4 lg:rounded-br-3xl"
          />
        </div>
      </Container>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>
        <Container className="mt-10">
          <LogoCloud />
        </Container>
        <div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
          <FeatureSection />
          <BentoSection />
        </div>
        <DarkBentoSection />
      </main>
      <Testimonials />
      <Footer />
    </div>
  );
}
