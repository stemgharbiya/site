type SchemaNode = Record<string, unknown>;
import { type SiteConfig } from "../data/constants";

type BreadcrumbItem = {
  name: string;
  item: string;
};

type ItemListEntity = {
  name: string;
  url: string;
  description?: string;
  sameAs?: string[];
};

export type { SchemaNode, BreadcrumbItem, ItemListEntity };

export function cleanCanonicalUrl(url: string, fallbackSiteUrl: string) {
  const parsed = new URL(url || fallbackSiteUrl);
  parsed.hash = "";
  parsed.search = "";
  return parsed.href;
}

export function getGlobalSchemaIds(siteUrl: string) {
  const normalizedSiteUrl = siteUrl.endsWith("/")
    ? siteUrl.slice(0, -1)
    : siteUrl;
  return {
    website: `${normalizedSiteUrl}/#website`,
    organization: `${normalizedSiteUrl}/#organization`,
    highSchool: `${normalizedSiteUrl}/#highschool`,
  };
}

export function buildWebSiteNode(
  siteConfig: SiteConfig,
  websiteId: string,
): SchemaNode {
  return {
    "@id": websiteId,
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function buildOrganizationNodes(
  siteConfig: SiteConfig,
  organizationId: string,
  highSchoolId: string,
): SchemaNode[] {
  const logoUrl = `${siteConfig.url}/web-app-manifest-512x512.png`;

  const educationalOrganization: SchemaNode = {
    "@id": organizationId,
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
    address: {
      "@type": "PostalAddress",
      postalCode: siteConfig.postalCode,
      streetAddress: siteConfig.address,
      addressLocality: "Tanta",
      addressRegion: "Gharbiya",
      addressCountry: "EG",
    },
    sameAs: siteConfig.social.map((social) => social.href),
  };

  const highSchool: SchemaNode = {
    "@id": highSchoolId,
    "@type": "HighSchool",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    branchOf: {
      "@id": organizationId,
    },
  };

  return [educationalOrganization, highSchool];
}

export function buildWebPageNode(params: {
  pageType?: string;
  pageUrl: string;
  pageName: string;
  pageDescription: string;
  websiteId: string;
  organizationId: string;
}): SchemaNode {
  const {
    pageType = "WebPage",
    pageUrl,
    pageName,
    pageDescription,
    websiteId,
    organizationId,
  } = params;

  return {
    "@id": `${pageUrl}#webpage`,
    "@type": pageType,
    name: pageName,
    description: pageDescription,
    url: pageUrl,
    isPartOf: {
      "@id": websiteId,
    },
    about: {
      "@id": organizationId,
    },
  };
}

export function buildBreadcrumbListNode(params: {
  pageUrl: string;
  items: BreadcrumbItem[];
}): SchemaNode {
  const { pageUrl, items } = params;

  return {
    "@id": `${pageUrl}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildEntityItemListNode(params: {
  id: string;
  name: string;
  pageUrl: string;
  entities: ItemListEntity[];
}): SchemaNode {
  const { id, name, pageUrl, entities } = params;

  return {
    "@id": `${pageUrl}#${id}`,
    "@type": "ItemList",
    name,
    numberOfItems: entities.length,
    itemListElement: entities.map((entity) => ({
      "@type": "Organization",
      name: entity.name,
      url: entity.url,
      ...(entity.description ? { description: entity.description } : {}),
      ...(entity.sameAs?.length ? { sameAs: entity.sameAs } : {}),
    })),
  };
}

export function toSchemaArray(
  structuredData?: SchemaNode | SchemaNode[],
): SchemaNode[] {
  if (!structuredData) {
    return [];
  }
  return Array.isArray(structuredData) ? structuredData : [structuredData];
}
