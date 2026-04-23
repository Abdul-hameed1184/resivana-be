import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";

export class PropertyController {
  /**
   * GET /api/v1/properties
   */
  static async getProperties(req: Request, res: Response) {
    try {
      // req.query is already validated and cast to proper types by middleware
      const properties = await PropertyService.getAllProperties(
        req.query as any,
      );
      res.status(200).json(properties);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch properties" });
    }
  }

  /**
   * GET /api/v1/properties/:id
   */
  static async getPropertyById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const property = await PropertyService.getPropertyById(id);

      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      res.status(200).json(property);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch property" });
    }
  }

  /**
   * POST /api/v1/properties
   */
  static async createProperty(req: Request, res: Response) {
    try {
      // req.body is already validated by middleware
      const propertyData = {
        ...req.body,
        agentId: req.user?.id,
      };
      const property = await PropertyService.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to create property" });
    }
  }

  /**
   * PUT /api/v1/properties/:id
   */
  static async updateProperty(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const property = await PropertyService.updateProperty(id, req.body);
      res.status(200).json(property);
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Property not found" });
      }
      res
        .status(500)
        .json({ error: error.message || "Failed to update property" });
    }
  }

  /**
   * DELETE /api/v1/properties/:id
   */
  static async deleteProperty(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await PropertyService.deleteProperty(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Property not found" });
      }
      res
        .status(500)
        .json({ error: error.message || "Failed to delete property" });
    }
  }
}
