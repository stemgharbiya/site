import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'zod';

const alumniCollection = defineCollection({
    loader: file('./data/alumni.json'),
    schema: ({image}) => z.object({
        alumni: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                image: image(),
                graduationYear: z.number()
            })
        )
    })
});

export const collections = { alumniCollection };