// ============================================================
// BACKPANEL — JSON-LD Structured Data (TypeScript)
// WebApplication, BreadcrumbList, FAQPage, Organization
// ============================================================

interface SchemaOrgBase {
  "@context": string;
  "@type": string;
}

interface OrganizationSchema extends SchemaOrgBase {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  areaServed: { "@type": string; name: string };
  contactPoint: { "@type": string; email: string; contactType: string };
}

interface WebApplicationSchema extends SchemaOrgBase {
  "@type": "WebApplication";
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  description: string;
  browserRequirements: string;
  offers: {
    "@type": string;
    lowPrice: string;
    highPrice: string;
    priceCurrency: string;
    offerCount: string;
  };
  provider: OrganizationSchema;
  areaServed: { "@type": string; name: string };
}

interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbListSchema extends SchemaOrgBase {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
}

interface FAQAnswer {
  "@type": "Answer";
  text: string;
}

interface FAQQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: FAQAnswer;
}

interface FAQPageSchema extends SchemaOrgBase {
  "@type": "FAQPage";
  mainEntity: FAQQuestion[];
}

const SITE_URL = "https://thebackpanel.github.io" as const;

export const organizationSchema: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BACKPANEL",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo_lockup.png`,
  description:
    "Bengaluru's only RTO-certified auto-rickshaw back-panel advertising network for startups.",
  areaServed: { "@type": "City", name: "Bengaluru" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "founders@backpanel.in",
    contactType: "customer service",
  },
};

export const webAppSchema: WebApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BACKPANEL",
  url: SITE_URL,
  applicationCategory: "MarketingApplication",
  operatingSystem: "Web",
  description:
    "Auto back-panel advertising platform for startups. RTO-certified, eco-vinyl, all-inclusive campaigns in Bengaluru.",
  browserRequirements: "Requires a modern web browser with JavaScript enabled.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "15000",
    highPrice: "120000",
    priceCurrency: "INR",
    offerCount: "3",
  },
  provider: organizationSchema,
  areaServed: { "@type": "City", name: "Bengaluru" },
};

export const breadcrumbSchema: BreadcrumbListSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "How It Works", item: `${SITE_URL}/#how` },
    { "@type": "ListItem", position: 3, name: "Proof", item: `${SITE_URL}/#proof` },
    { "@type": "ListItem", position: 4, name: "Pricing", item: `${SITE_URL}/#pricing` },
    { "@type": "ListItem", position: 5, name: "Contact", item: `${SITE_URL}/#contact` },
  ],
};

export const faqSchema: FAQPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is BACKPANEL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BACKPANEL is Bengaluru's only RTO-certified auto-rickshaw back-panel advertising network. We put your brand on the back of autos, targeting specific neighbourhoods with eco-vinyl, bilingual creatives, and full legal compliance.",
      },
    },
    {
      "@type": "Question",
      name: "How much does auto advertising cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing starts at ₹15,000–20,000 per month for 10 autos in your target neighbourhood. The Neighbourhood plan (25 autos) is ₹35,000–45,000. Saturation (50+ autos) is ₹80,000–1.2L. All plans include print, install, RTO sign-off, ad tax, GPS proof, eco-vinyl, and a founder video.",
      },
    },
    {
      "@type": "Question",
      name: "Is auto-rickshaw advertising legal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — when done right. BACKPANEL operates exclusively on back-panels with full RTO and municipal sign-off, per auto, per city. We use eco-vinyl, stay inside the 75% ad area rule, carry the NOC, and pay the ad tax. No hood stickers or gray-zone tactics.",
      },
    },
    {
      "@type": "Question",
      name: "What is the estimated reach per auto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each auto generates approximately 8,000–12,000 impressions per day based on transit OOH benchmarks. At an estimated ₹0.33 CPM, this makes BACKPANEL one of the most cost-effective outdoor advertising channels available to startups in Bengaluru.",
      },
    },
    {
      "@type": "Question",
      name: "What is Pitch on Wheels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pitch on Wheels is our viral contest where founders record a 30-second pitch. The best entries win 50 free back-panels and a filmed Reel. It is designed to generate LinkedIn reach and community engagement beyond just the physical ad.",
      },
    },
  ],
};

export const allSchemas: SchemaOrgBase[] = [
  webAppSchema,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
];
