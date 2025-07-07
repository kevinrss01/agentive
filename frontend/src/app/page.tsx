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
    'Agentive - Your AI-powered lifestyle assistant. Get personalized recommendations for travel, restaurants, and shopping through natural conversation. Real-time research, perfect results.',
};

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-3xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar
          banner={
            <Link
              href="/app"
              className="flex items-center gap-1 rounded-full bg-fuchsia-950/35 px-3 py-0.5 text-sm font-medium text-white hover:bg-fuchsia-950/30 leading-6"
            >
              New: AI that plans trips, finds restaurants, and shops for you
              <ChevronRightIcon className="size-4" />
            </Link>
          }
        />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
          <h1 className="font-display text-6xl font-medium tracking-tight text-gray-950 sm:text-8xl md:text-9xl leading-none">
            Live smarter.
          </h1>
          <p className="mt-8 max-w-lg text-xl font-medium text-gray-950/75 sm:text-2xl leading-7 sm:leading-8">
            Your AI assistant that searches the web in real-time for travel plans, restaurant
            recommendations, and the best shopping deals.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href="/app">Get started</Button>
            <Button variant="secondary" href="/app">
              Try with voice
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
          Everything you need for better living, instantly researched.
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
      <Subheading>Intelligent Living</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Your AI companion for travel, dining, and shopping decisions.
      </Heading>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Travel Planning"
          title="Perfect trips, instantly planned"
          description="Real-time flight searches, hotel comparisons, and personalized itineraries. Your AI remembers your preferences and finds hidden gems."
          graphic={
            <div className="flex size-full items-center justify-center">
              <img src="/images/plane.png" alt="Travel" className="h-32 w-32 object-contain" />
            </div>
          }
          fade={['bottom']}
          className="max-lg:rounded-t-3xl lg:col-span-3 lg:rounded-tl-3xl"
        />
        <BentoCard
          eyebrow="Restaurant Discovery"
          title="Find your perfect meal"
          description="From local favorites to Michelin stars, get recommendations based on your taste, dietary needs, and budget. Real-time availability and reviews."
          graphic={
            <div className="flex size-full items-center justify-center">
              <img src="/images/food.png" alt="Dining" className="h-32 w-32 object-contain" />
            </div>
          }
          fade={['bottom']}
          className="lg:col-span-3 lg:rounded-tr-3xl"
        />
        <BentoCard
          eyebrow="Smart Shopping"
          title="Best deals, zero effort"
          description="Compare prices across retailers, find discount codes, and track price drops. Your AI knows your style and budget preferences."
          graphic={
            <div className="flex size-full items-center justify-center">
              <img src="/images/shopping.png" alt="Shopping" className="h-32 w-32 object-contain" />
            </div>
          }
          className="lg:col-span-2 lg:rounded-bl-3xl"
        />
        <BentoCard
          eyebrow="Voice-Powered"
          title="Just ask, naturally"
          description="Speak or type in any language. Our AI understands context, remembers your preferences, and learns from every interaction."
          graphic={
            <div className="flex size-full pt-10 pl-10">
              <Keyboard highlighted={['Space']} />
            </div>
          }
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Real-time Research"
          title="Always current information"
          description="Live web searches ensure you get the latest prices, availability, and reviews. No outdated recommendations, ever."
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
        <Subheading dark>Advanced AI</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl text-white">
          Intelligence that makes everyday decisions effortless.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Deep Research"
            title="Expert-level recommendations"
            description="Our AI analyzes millions of data points - reviews, prices, trends, and expert opinions - to give you insights that would take hours to find manually."
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
            eyebrow="Learning AI"
            title="Gets smarter with you"
            description="Every interaction teaches our AI more about your preferences. It remembers your favorite cuisines, preferred airlines, shopping habits, and budget."
            graphic={<LogoTimeline />}
            // `overflow-visible!` is needed to work around a Chrome bug that disables the mask on the graphic.
            className="z-10 overflow-visible lg:col-span-2 lg:rounded-tr-3xl"
          />
          <BentoCard
            dark
            eyebrow="Multi-tasking"
            title="Handle everything at once"
            description="Planning a trip? Find flights, hotels, restaurants, and activities in one conversation. Our AI connects all the dots for you."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-3xl"
          />
          <BentoCard
            dark
            eyebrow="Always Available"
            title="Your 24/7 lifestyle assistant"
            description="Whether you need a last-minute dinner reservation, want to compare product prices, or plan a spontaneous weekend trip - we're always ready."
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

function HowItWorksSection() {
  return (
    <div className="py-32 bg-gray-50">
      <Container>
        <div className="text-center">
          <Subheading>How it works</Subheading>
          <Heading as="h2" className="mt-2">
            Your personal AI assistant in 3 simple steps
          </Heading>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Tell us what you need</h3>
            <p className="mt-2 text-sm text-gray-600">
              Voice or type your request - "Plan a weekend in Paris", "Find me a great sushi place",
              or "I need a new laptop under $1000".
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">AI researches everything</h3>
            <p className="mt-2 text-sm text-gray-600">
              Our AI searches the entire web in real-time - comparing prices, reading reviews,
              checking availability, and finding hidden gems.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">
              Get perfect recommendations
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Receive personalized suggestions with direct links, insider tips, and alternatives -
              all tailored to your preferences and budget.
            </p>
          </div>
        </div>
        <div className="mt-16 text-center">
          <Button href="/app">Try it now - it's free</Button>
        </div>
      </Container>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'How does Agentive differ from other search engines or apps?',
      answer:
        'Agentive is conversational and comprehensive. Instead of searching multiple sites for flights, restaurants, and shopping separately, you can ask for everything in natural language and get personalized recommendations instantly.',
    },
    {
      question: 'Does it cost anything to use?',
      answer:
        'Agentive is free to use for all basic features. We offer optional premium features like API access, business tools, and advanced personalization for power users.',
    },
    {
      question: 'What can Agentive help me with?',
      answer:
        'Travel planning (flights, hotels, activities), restaurant discovery (reservations, reviews, dietary needs), shopping (price comparisons, deals, product recommendations), and anything else you need researched online.',
    },
    {
      question: 'How does the AI learn my preferences?',
      answer:
        'Every interaction teaches our AI about your preferences - favorite airlines, dietary restrictions, shopping budgets, preferred brands. It creates a personalized profile that improves over time.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes. We use enterprise-grade encryption and never share your personal data. Your preferences and conversation history are private and can be deleted anytime.',
    },
    {
      question: 'Can I use voice commands?',
      answer:
        "Absolutely! Speak naturally in any language. Ask complex questions like 'Find me a romantic restaurant in Paris with vegetarian options and book a table for Saturday' - our AI handles it all.",
    },
  ];

  return (
    <div className="py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Subheading>FAQ</Subheading>
          <Heading as="h2" className="mt-2">
            Frequently asked questions
          </Heading>
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have more questions?{' '}
            <Link href="/app" className="font-semibold text-pink-600 hover:text-pink-500">
              Try it yourself
            </Link>{' '}
            or{' '}
            <Link href="#" className="font-semibold text-pink-600 hover:text-pink-500">
              contact our team
            </Link>
          </p>
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
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-600">Trusted by travelers from</p>
          </div>
          <LogoCloud />
        </Container>
        <div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
          <Container className="pb-32">
            <Heading as="h2" className="max-w-3xl">
              Everything you need for better living, instantly researched.
            </Heading>
            <Screenshot
              width={1216}
              height={768}
              src="/screenshots/app.png"
              className="mt-16 h-[36rem] sm:h-auto sm:w-[76rem]"
            />
          </Container>
          <BentoSection />
        </div>
        <DarkBentoSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <Testimonials />
      <Footer />
    </div>
  );
}
