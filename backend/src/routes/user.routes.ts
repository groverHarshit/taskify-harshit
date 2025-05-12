import { Router } from 'express';
import { UserController } from '../controllers';
import { authMiddleware } from '../middleware';

const userRouter = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return a token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
userRouter.post('/login', UserController.login as any);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     description: Create a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - missing required fields
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
userRouter.post('/signup', UserController.signup as any);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: List all users
 *     description: Returns a list of all users with only _id and username fields
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by username
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       500:
 *         description: Internal server error
 */
userRouter.get('/users', authMiddleware as any, UserController.listUsers as any);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout a user and delete their session.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 */
userRouter.post('/logout', authMiddleware as any, UserController.logout as any);

userRouter.post('/create', UserController.createUser as any);

export const userRoutes = userRouter;
