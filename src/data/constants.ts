import type { IconKey } from "./icons";

type NavItem = {
  label: string;
  href: string;
  icon: IconKey;
  variant?: string;
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

export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  email: string;
  locale: string;
  address: string;
  postalCode: number;
  mapUrl: string;
  nav: {
    primary: NavItem[];
  };
  footer: {
    explore: FooterLink[];
    admissions: FooterLink[];
    quickLinks: FooterLink[];
  };
  social: SocialLink[];
  keywords: string[];
};

export const siteConfig: SiteConfig = {
  name: "STEM Gharbiya",
  title: "STEM Gharbiya - A Public STEM High School in Egypt",
  description:
    "STEM Gharbiya is a public STEM high school in Egypt focused on project-based learning, innovation, and research-driven education.",
  url: "https://stemgh.org",
  email: "team@stemgh.org",
  locale: "en",
  address: "Galaa St., Tanta, Gharbiya, Egypt",
  postalCode: 6630083,
  mapUrl: "https://maps.app.goo.gl/qAHoUc5avbPMAyoU8",
  nav: {
    primary: [
      { label: "Home", href: "/", icon: "home" },
      {
        label: "About",
        href: "/about",
        icon: "info",
        children: [
          { label: "School", href: "/about", icon: "school" },
          {
            label: "Faculty & Staff",
            href: "/about/faculty-staff",
            icon: "faculty",
          },
          { label: "Dorm", href: "/about/dorm", icon: "dorm" },
          { label: "Academics", href: "/about/academics", icon: "academics" },
          { label: "Admission", href: "/about/admission", icon: "admission" },
          { label: "Activities", href: "/about/activities", icon: "clubs" },
        ],
      },
      { label: "Alumni", href: "/alumni", icon: "graduates" },
      { label: "Contact", href: "/contact", icon: "contact" },
    ],
  },
  footer: {
    explore: [
      { label: "Home", href: "/" },
      { label: "Academics", href: "/about/academics" },
      { label: "Activities", href: "/about/activities" },
      { label: "Faculty & Staff", href: "/about/faculty-staff" },
    ],
    admissions: [
      {
        label: "Eligibility Criteria",
        href: "/about/admission#eligibility-criteria",
      },
      {
        label: "Admission Process",
        href: "/about/admission#admission-process",
      },
      {
        label: "Required Documents",
        href: "/about/admission#required-documents",
      },
      { label: "Admission FAQ", href: "/about/admission#admission-faq" },
    ],
    quickLinks: [
      { label: "Alumni", href: "/alumni" },
      { label: "Contact", href: "/contact" },
      {
        label: "Admissions Contact",
        href: "/about/admission#contact-admissions",
      },
      {
        label: "Campus Location",
        href: "https://maps.app.goo.gl/qAHoUc5avbPMAyoU8",
      },
    ],
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
