const express = require("express");

const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} = require("../controllers/providers");

const bookingRouter = require("./bookings");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.use("/:providerId/bookings/", bookingRouter);

router
  .route("/")
  .get(getProviders)
  .post(protect, authorize("admin"), createProvider);

router
  .route("/:id")
  .get(getProvider)
  .put(protect, authorize("admin"), updateProvider)
  .delete(protect, authorize("admin"), deleteProvider);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Provider:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - tel
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the provider
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name:
 *           type: string
 *           description: Car Rental Provider name
 *         address:
 *           type: string
 *           description: House No., Street, Road, Province
 *         tel:
 *           type: string
 *           description: Telephone number
 *       example:
 *         id: 609bda561452242d88d36e37
 *         name: Avis Rent A Car
 *         address: 121 สุขุมวิท กรุงเทพมหานคร
 *         tel: 02-2187000
 */

/**
 * @swagger
 * tags:
 *   - name: Providers
 *     description: The car rental providers managing API
 */

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Returns the list of all providers
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: The list of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 */

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: Provider data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       404:
 *         description: Provider not found
 */

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Create a new provider
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Provider'
 *     responses:
 *       201:
 *         description: Provider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Update provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Provider'
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Delete provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       404:
 *         description: Provider not found
 */