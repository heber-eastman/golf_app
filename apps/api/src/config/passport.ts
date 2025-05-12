import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import { authConfig } from './auth';
import { User } from '@golf-app/common';

// Only initialize Google strategy if credentials are present
if (authConfig.googleClientId && authConfig.googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: authConfig.googleClientId,
    clientSecret: authConfig.googleClientSecret,
    callbackURL: `${authConfig.callbackUrl}/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails?.[0].value });
      
      if (!user) {
        user = await User.create({
          email: profile.emails?.[0].value,
          name: profile.displayName,
          googleId: profile.id,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// Only initialize Apple strategy if credentials are present
if (authConfig.appleClientId && authConfig.appleTeamId && authConfig.appleKeyId && authConfig.applePrivateKey) {
  passport.use(new AppleStrategy({
    clientID: authConfig.appleClientId,
    teamID: authConfig.appleTeamId,
    keyID: authConfig.appleKeyId,
    privateKeyLocation: authConfig.applePrivateKey,
    callbackURL: `${authConfig.callbackUrl}/apple/callback`,
  }, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.email });
      
      if (!user) {
        user = await User.create({
          email: profile.email,
          name: profile.name?.firstName,
          appleId: profile.id,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

export default passport; 