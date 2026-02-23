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
        href: "/about",
        icon: "info",
        children: [
          { label: "School", href: "/about", icon: "school" },
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
          { label: "Activities", href: "/about/activities", icon: "clubs" },
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
      { label: "Home", href: "/" },
      { label: "Academics", href: "/about/academics" },
      { label: "Activities", href: "/about/activities" },
      { label: "Faculty & Staff", href: "/about/faculty-staff" },
      { label: "Alumni", href: "/alumni" },
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
      { label: "Contact Us", href: "/contact" },
      {
        label: "Admissions Contact",
        href: "/about/admission#contact-admissions",
      },
      {
        label: "Campus Location",
        href: "https://maps.app.goo.gl/qAHoUc5avbPMAyoU8",
      },
      { label: "Student Portal", href: "https://portal.stemgharbiya.app" },
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
