import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'zod';

const alumniCollection = defineCollection({
    loader: file('./src/data/alumni.json'),
    schema: ({ image }) => z.object({
        id: z.string(),
        year: z.number(),
        students: z.array(
            z.object({
                name: z.string(),
                image: image(),
                class: z.string(),
                classRank: z.string().optional(),
                nationalRank: z.string().optional(),
                socialMedia: z.object({
                    cv: z.string().optional(),
                    website: z.string().optional(),
                    email: z.string().optional(),
                    linkedin: z.string().optional(),
                    facebook: z.string().optional(),
                    instagram: z.string().optional()
                }).optional(),
                university: z.object({
                    logo: image(),
                    name: z.string(),
                    classYear: z.number(),
                    major: z.string().optional(),
                    financialAid: z.string().optional()
                })
            })
        )
    })
});

export const collections = { alumniCollection };