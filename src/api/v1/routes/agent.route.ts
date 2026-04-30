import { Router } from "express";
import { 
    getAgent, 
    AgentProperties, 
    upgradeToAgent, 
    registerAgentFromScratch 
} from "../controllers/agent.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { 
    upgradeToAgentSchema, 
    registerAgentFromScratchSchema, 
    agentIdParamSchema 
} from "../validations/agent.validation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpgradeToAgent:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phone
 *         - bankCode
 *         - accountNumber
 *         - accountName
 *       properties:
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           example: "08012345678"
 *         bankCode:
 *           type: string
 *           example: "044"
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         accountName:
 *           type: string
 *           example: "John Doe"
 *     RegisterAgentFromScratch:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - fullName
 *         - phone
 *         - bankCode
 *         - accountNumber
 *         - accountName
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         userName:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "08012345678"
 *         bankCode:
 *           type: string
 *           example: "044"
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         accountName:
 *           type: string
 *           example: "John Doe"
 */

/**
 * @swagger
 * /api/v1/agents/register:
 *   post:
 *     summary: Register as an agent from scratch
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterAgentFromScratch'
 *     security:
 *       - csrfToken: []
 *     responses:
 *       201:
 *         description: Agent registered successfully
 */
router.post("/register", validate(registerAgentFromScratchSchema), registerAgentFromScratch);

/**
 * @swagger
 * /api/v1/agents/upgrade:
 *   post:
 *     summary: Upgrade existing user to agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpgradeToAgent'
 *     responses:
 *       201:
 *         description: Upgraded to agent successfully
 */
router.post("/upgrade", protect, validate(upgradeToAgentSchema), upgradeToAgent);

/**
 * @swagger
 * /api/v1/agents/{agentId}:
 *   get:
 *     summary: Get agent details
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent found
 */
router.get("/:agentId", validate(agentIdParamSchema), getAgent);

/**
 * @swagger
 * /api/v1/agents/{agentId}/properties:
 *   get:
 *     summary: Get agent properties
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Properties found
 */
router.get("/:agentId/properties", validate(agentIdParamSchema), AgentProperties);

export default router;
