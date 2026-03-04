import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "zod";

const alumniCollection = defineCollection({
  loader: file("./src/data/alumni.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      year: z.number(),
      students: z.array(
        z.object({
          name: z.string(),
          image: image(),
          class: z.string(),
          classRank: z.string().optional(),
          nationalRank: z.string().optional(),
          socialMedia: z
            .object({
              cv: z.string().optional(),
              website: z.string().optional(),
              email: z.string().optional(),
              linkedin: z.string().optional(),
              facebook: z.string().optional(),
              instagram: z.string().optional(),
            })
            .optional(),
          university: z.object({
            logo: image(),
            name: z.string(),
            classYear: z.number(),
            major: z.string().optional(),
            financialAid: z.string().optional(),
          }),
        }),
      ),
    }),
});

const staffCollection = defineCollection({
  loader: file("./src/data/staff.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      committee: z.string().optional(),
      avatar: image(),
      email: z.string().optional(),
      bio: z.string().optional(),
    }),
});

const teamCollection = defineCollection({
  loader: file("./src/data/team.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(["current", "former"]),
      role: z.string(),
      avatar: image(),
      email: z.string().optional(),
      bio: z.string().optional(),
      social: z.record(z.string(), z.string()).optional(),
    }),
});

const clubsCollection = defineCollection({
  loader: file("./src/data/clubs.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      image: image(),
      short: z.string().optional(),
      description: z.string().optional(),
      website: z.string().optional(),
      social: z.record(z.string(), z.string()).optional(),
      supervisor: z.string().optional(),
      president: z.string().optional(),
      type: z.string().optional(),
    }),
});

const academicsCollection = defineCollection({
  loader: file("./src/data/academics.json"),
  schema: z.object({
    id: z.string(),
    skills: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      }),
    ),
    courses: z.array(
      z.object({
        name: z.string(),
        level: z.string(),
        credits: z.number(),
        subject: z.string(),
      }),
    ),
    capstoneProjects: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        outcomes: z.array(z.string()),
        year: z.string(),
      }),
    ),
    gradingSystem: z.array(
      z.object({
        grade: z.string(),
        percentage: z.string(),
      }),
    ),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    ),
  }),
});

const facilitiesCollection = defineCollection({
  loader: file("./src/data/facilities.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      tagline: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      activities: z.array(z.string()),
      imageSlots: z.array(
        z.object({
          label: z.string(),
          suggestedFile: z.string().optional(),
          image: image().optional(),
        }),
      ),
    }),
});

export const collections = {
  alumniCollection,
  staffCollection,
  clubsCollection,
  academicsCollection,
  teamCollection,
  facilitiesCollection,
};
