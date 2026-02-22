import { ICONS, type IconKey } from "../data/icons";

export type SocialLink = {
  href: string;
  label: string;
  icon: string;
  isExternal: boolean;
};

const toLabel = (key: string) =>
  key.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeHref = (key: string, value: string) => {
  if (key.toLowerCase() === "email" && !value.startsWith("mailto:")) {
    return `mailto:${value}`;
  }

  return value;
};

export const buildSocialLinks = (
  social: Record<string, unknown> | undefined,
  socialIconByKey: Partial<Record<string, IconKey>>,
  fallbackIcon: IconKey = "chat",
): SocialLink[] => {
  const links: SocialLink[] = [];

  for (const [key, rawValue] of Object.entries(social ?? {})) {
    if (typeof rawValue !== "string") continue;

    const value = rawValue.trim();
    if (!value) continue;

    const href = normalizeHref(key, value);
    const iconKey = socialIconByKey[key.toLowerCase()] ?? fallbackIcon;

    links.push({
      href,
      label: toLabel(key),
      icon: ICONS[iconKey],
      isExternal: !href.startsWith("mailto:"),
    });
  }

  return links;
};
