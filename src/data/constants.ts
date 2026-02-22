import type { IconKey } from "./icons";

type NavItem = {
  label: string;
  href: string;
  icon: IconKey;
  children?: NavItem[];
};

type FooterLink = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: IconKey;
};

type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  email: string;
  locale: string;
  nav: {
    primary: NavItem[];
  };
  footer: {
    explore: FooterLink[];
    admissions: FooterLink[];
    quickLinks: FooterLink[];
    address: string;
    mapUrl: string;
  };
  social: SocialLink[];
  keywords: string[];
};

export const siteConfig: SiteConfig = {
  name: "STEM Gharbiya",
  title: "STEM Gharbiya - A Public STEM High School in Egypt",
  description:
    "STEM Gharbiya is a public STEM high school in Egypt focused on project-based learning, innovation, and research-driven education.",
  url: "https://stemgharbiya.app",
  email: "team@stemgharbiya.app",
  locale: "en",
  nav: {
    primary: [
      { label: "Home", href: "/", icon: "home" },
      {
        label: "About",
        href: "/about/school",
        icon: "info",
        children: [
          { label: "School", href: "/about/school", icon: "school" },
          {
            label: "Faculty & Staff",
            href: "/about/faculty-staff",
            icon: "faculty",
          },
          {
            label: "Facilities",
            href: "/about/facilities",
            icon: "facilities",
          },
          { label: "Dorm", href: "/about/dorm", icon: "dorm" },
          { label: "Academics", href: "/about/academics", icon: "academics" },
          { label: "Admission", href: "/about/admission", icon: "admission" },
        ],
      },
      { label: "Alumni", href: "/alumni", icon: "graduates" },
      { label: "Contact Us", href: "/contact", icon: "contact" },
      {
        label: "Portal",
        href: "https://portal.stemgharbiya.app",
        icon: "portal",
      },
    ],
  },
  footer: {
    explore: [
      { label: "About the school", href: "/about/school" },
      { label: "Academics", href: "/about/academics" },
      { label: "Facilities", href: "/about/facilities" },
      { label: "Dorm life", href: "/about/dorm" },
    ],
    admissions: [
      { label: "Eligibility", href: "/about/admission" },
      { label: "How to join", href: "/about/admission" },
      { label: "Entrance exam", href: "/about/admission" },
      { label: "Have a question?", href: "/contact" },
    ],
    quickLinks: [
      { label: "Contact us", href: "/contact" },
      { label: "Developers", href: "/about/developers" },
      { label: "Portal", href: "https://portal.stemgharbiya.app" },
      { label: "Learn how to join", href: "/about/admission" },
    ],
    address: "Galaa St., Tanta, Gharbiya, Egypt",
    mapUrl: "https://maps.app.goo.gl/qAHoUc5avbPMAyoU8",
  },
  social: [
    {
      label: "GitHub",
      href: "https://github.com/stemgharbiya",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/school/gharbiya-stem-high-school/",
      icon: "linkedin",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/groups/1791197197762388/",
      icon: "facebook",
    },
  ],
  keywords: [
    "STEM Gharbiya",
    "STEM school",
    "Egypt",
    "Gharbiya",
    "project-based learning",
    "research",
    "innovation",
  ],
};
