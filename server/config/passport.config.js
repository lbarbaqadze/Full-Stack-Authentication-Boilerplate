import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleAuthModel } from '../models/google.auth.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await googleAuthModel.findUserByGoogleId(profile.id);

        if (!user) {
            const name = profile.name?.givenName || "User";
            const userData = {
                name,
                surname: profile.name?.familyName || name,
                email: profile.emails[0].value
            };
            const userId = await googleAuthModel.createGoogleUser(userData, profile.id);
            user = { user_id: userId };
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));