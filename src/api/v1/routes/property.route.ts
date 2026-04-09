import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
  propertyIdParamSchema,
} from "../validations/property.validation";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, LAND, COMMERCIAL, CAR]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, PENDING, SOLD]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: bathrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of properties retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The property ID
 *     responses:
 *       200:
 *         description: Property details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  validate(propertyIdParamSchema),
  PropertyController.getPropertyById,
);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price, type, location]
 *             properties:
 *               title: { type: string, minLength: 3 }
 *               description: { type: string, minLength: 10 }
 *               price: { type: number, minimum: 0 }
 *               type: { type: string, enum: [APARTMENT, HOUSE, LAND, COMMERCIAL, CAR] }
 *               status: { type: string, enum: [AVAILABLE, PENDING, SOLD] }
 *               images: { type: array, items: { type: string, format: uri } }
 *               tags: { type: array, items: { type: string } }
 *               amenities: { type: array, items: { type: string } }
 *               bedrooms: { type: integer, minimum: 0 }
 *               bathrooms: { type: integer, minimum: 0 }
 *               featured: { type: boolean }
 *               location:
 *                 type: object
 *                 required: [address, city, state, country, latitude, longitude]
 *                 properties:
 *                   address: { type: string, minLength: 5 }
 *                   city: { type: string, minLength: 2 }
 *                   state: { type: string, minLength: 2 }
 *                   country: { type: string, minLength: 2 }
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  validate(createPropertySchema),
  PropertyController.createProperty,
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   put:
 *     summary: Update an existing property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The property ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 3 }
 *               description: { type: string, minLength: 10 }
 *               price: { type: number, minimum: 0 }
 *               type: { type: string, enum: [APARTMENT, HOUSE, LAND, COMMERCIAL, CAR] }
 *               status: { type: string, enum: [AVAILABLE, PENDING, SOLD] }
 *               images: { type: array, items: { type: string, format: uri } }
 *               tags: { type: array, items: { type: string } }
 *               amenities: { type: array, items: { type: string } }
 *               bedrooms: { type: integer }
 *               bathrooms: { type: integer }
 *               featured: { type: boolean }
 *               location:
 *                 type: object
 *                 properties:
 *                   address: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   country: { type: string }
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  validate(updatePropertySchema),
  PropertyController.updateProperty,
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The property ID
 *     responses:
 *       204:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  validate(propertyIdParamSchema),
  PropertyController.deleteProperty,
);

export default router;
