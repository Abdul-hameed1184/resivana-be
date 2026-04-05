import { z } from "zod";
import { PropertyType, PropertyStatus } from "../../../generated/prisma/client";

const PropertyTypeEnum = z.nativeEnum(PropertyType);
const PropertyStatusEnum = z.nativeEnum(PropertyStatus);

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    price: z.number().positive("Price must be a positive number"),
    type: PropertyTypeEnum,
    status: PropertyStatusEnum.optional().default(PropertyStatus.AVAILABLE),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    bedrooms: z.number().int().nonnegative().optional().default(0),
    bathrooms: z.number().int().nonnegative().optional().default(0),
    featured: z.boolean().optional().default(false),
    agentId: z.string().uuid("Invalid agent ID format"),
    location: z.object({
      address: z.string().min(5, "Address too short"),
      city: z.string().min(2, "City too short"),
      state: z.string().min(2, "State too short"),
      country: z.string().min(2, "Country too short"),
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid property ID format"),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    type: PropertyTypeEnum.optional(),
    status: PropertyStatusEnum.optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    featured: z.boolean().optional(),
    location: z
      .object({
        address: z.string().min(5).optional(),
        city: z.string().min(2).optional(),
        state: z.string().min(2).optional(),
        country: z.string().min(2).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
  }),
});

export const getPropertiesQuerySchema = z.object({
  query: z.object({
    type: PropertyTypeEnum.optional(),
    status: PropertyStatusEnum.optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    agentId: z.string().uuid().optional(),
    skip: z.coerce.number().int().nonnegative().optional().default(0),
    take: z.coerce.number().int().positive().optional().default(10),
  }),
});

export const propertyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid property ID format"),
  }),
});
