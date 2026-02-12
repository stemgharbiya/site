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

type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  locale: string;
  nav: {
    primary: NavItem[];
    cta: NavItem;
  };
  footer: {
    explore: FooterLink[];
    admissions: FooterLink[];
    quickLinks: FooterLink[];
    legal: FooterLink[];
    address: string;
    mapUrl: string;
  };
  social: {
    github: string;
    linkedin: string;
    facebook: string;
  };
  keywords: string[];
};

export const siteConfig: SiteConfig = {
  name: "STEM Gharbiya",
  title: "STEM Gharbiya - A Public STEM High School in Egypt",
  description:
    "STEM Gharbiya is a public STEM high school in Egypt focused on project-based learning, innovation, and research-driven education.",
  url: "https://stemgharbiya.app",
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
          { label: "Faculty & Staff", href: "/about/faculty-staff", icon: "faculty" },
          { label: "Facilities", href: "/about/facilities", icon: "facilities" },
          { label: "Dorm", href: "/about/dorm", icon: "dorm" },
          { label: "Academics", href: "/about/academics", icon: "academics" },
          { label: "Developers", href: "/about/developers", icon: "developers" },
        ],
      },
      { label: "Admission", href: "/admission", icon: "admission" },
      { label: "Contact", href: "/contact", icon: "contact" },
      { label: "Portal", href: "https://portal.stemgharbiya.app", icon: "portal" },
    ],
    cta: { label: "Apply now", href: "/admission", icon: "apply" },
  },
  footer: {
    explore: [
      { label: "About the school", href: "/about/school" },
      { label: "Academics", href: "/about/academics" },
      { label: "Facilities", href: "/about/facilities" },
      { label: "Dorm life", href: "/about/dorm" },
    ],
    admissions: [
      { label: "Requirements", href: "/admission" },
      { label: "Application timeline", href: "/admission" },
      { label: "Entrance exam", href: "/admission" },
      { label: "Talk to admissions", href: "/contact" },
    ],
    quickLinks: [
      { label: "Contact", href: "/contact" },
      { label: "Developers", href: "/about/developers" },
      { label: "Portal", href: "https://portal.stemgharbiya.app" },
      { label: "Apply now", href: "/admission" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    address: "Galaa St., Tanta, Gharbiya, Egypt",
    mapUrl: "https://maps.app.goo.gl/qAHoUc5avbPMAyoU8",
  },
  social: {
    github: "https://github.com/stemgharbiya",
    linkedin: "https://linkedin.com/school/gharbiya-stem-high-school/",
    facebook: "https://www.facebook.com/groups/1791197197762388/",
  },
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
