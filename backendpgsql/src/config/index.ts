import dotenv from 'dotenv';
import prisma from './database';

dotenv.config();


export const config = {
	postgresUrl: process.env.DATABASE_URL || '',
	port: process.env.PORT || 5000,
	jwtSecret: process.env.JWT_SECRET || 'changeme',
};

export { prisma };
