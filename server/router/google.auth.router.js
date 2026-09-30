import express from 'express';
import passport from 'passport';
import { googleAuthController } from '../controllers/google.auth.controller.js';

const googleAuthRouter = express.Router();

googleAuthRouter.get('/', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

googleAuthRouter.get('/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login`,
        scope: ['profile', 'email']
    }), 
    googleAuthController.googleCallback
);

export default googleAuthRouter;