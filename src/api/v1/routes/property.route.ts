import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
  propertyIdParamSchema,
} from "../validations/property.validation";

const router = Router();

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get(
  "/",
  validate(getPropertiesQuerySchema),
  PropertyController.getProperties,
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 */
router.get(
  "/:id",
  validate(propertyIdParamSchema),
  PropertyController.getPropertyById,
);

router.post(
  "/",
  validate(createPropertySchema),
  PropertyController.createProperty,
);

router.put(
  "/:id",
  validate(updatePropertySchema),
  PropertyController.updateProperty,
);

router.delete(
  "/:id",
  validate(propertyIdParamSchema),
  PropertyController.deleteProperty,
);

export default router;
