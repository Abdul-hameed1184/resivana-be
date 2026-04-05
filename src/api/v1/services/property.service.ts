import { prisma } from "../../../lib/prisma";
import { PropertyType, PropertyStatus } from "../../../generated/prisma/client";

export interface PropertyFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  agentId?: string;
  skip?: number;
  take?: number;
}

export class PropertyService {
  /**
   * Fetch all properties with optional filtering and pagination
   */
  static async getAllProperties(filters: PropertyFilters) {
    const {
      type,
      status,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      agentId,
      skip = 0,
      take = 10,
    } = filters;

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;
    if (bedrooms) where.bedrooms = { gte: bedrooms };
    if (bathrooms) where.bathrooms = { gte: bathrooms };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    return prisma.property.findMany({
      where,
      skip,
      take,
      include: {
        location: true,
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePics: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Fetch a single property by ID
   */
  static async getPropertyById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePics: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePics: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a new property
   */
  static async createProperty(data: any) {
    const { location, ...propertyData } = data;

    return prisma.property.create({
      data: {
        ...propertyData,
        location: {
          create: location,
        },
      },
      include: {
        location: true,
      },
    });
  }

  /**
   * Update an existing property
   */
  static async updateProperty(id: string, data: any) {
    const { location, ...propertyData } = data;

    const updateData: any = { ...propertyData };

    if (location) {
      updateData.location = {
        update: location,
      };
    }

    return prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        location: true,
      },
    });
  }

  /**
   * Delete a property
   */
  static async deleteProperty(id: string) {
    // Note: location is deleted via Cascade as defined in schema
    return prisma.property.delete({
      where: { id },
    });
  }
}
