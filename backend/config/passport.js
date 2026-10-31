import crypto from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/User.models.js';
import { UserRolesEnum } from '../utils/constants.js';
import { cookieStateStore } from './oauthState.js';

const safeUsername = (base) => {
  const clean =
    String(base || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 11) || 'user';
  return `${clean}+${crypto.randomBytes(4).toString('hex')}`;
};

const linkProvider = async (user, providerField, providerId, provider) => {
  const wasUnverified = !user.isEmailVerified;
  const update = {
    $set: {
      [providerField]: providerId,
      isEmailVerified: true,
      ...(wasUnverified ? { authProvider: provider } : {}),
    },
  };
  if (wasUnverified) {
    update.$unset = {
      password: '',
      refreshToken: '',
      forgotPasswordToken: '',
      forgotPasswordExpiry: '',
      emailVerificationToken: '',
      emailVerificationExpiry: '',
    };
  }
  await User.updateOne({ _id: user._id }, update);
  return User.findById(user._id);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
      store: cookieStateStore,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const verifiedEmail = profile.emails
            ?.find((email) => email.verified === true)
            ?.value?.trim()
            .toLowerCase();

          if (!verifiedEmail) {
            return done(null, false, { code: 'GOOGLE_EMAIL_NOT_VERIFIED' });
          }

          user = await User.findOne({ email: verifiedEmail });

          if (user) {
            user = await linkProvider(user, 'googleId', profile.id, 'google');
          } else {
            user = await User.create({
              googleId: profile.id,
              email: verifiedEmail,
              username: safeUsername(verifiedEmail.split('@')[0]),
              fullName: profile.displayName,
              authProvider: 'google',
              isEmailVerified: true,
              role: UserRolesEnum.USER,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/github/callback',
      allRawEmails: true,
      store: cookieStateStore,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const verifiedEmail = profile.emails
            ?.find((email) => email.verified)
            ?.value?.trim()
            .toLowerCase();

          if (!verifiedEmail) {
            return done(null, false, { code: 'GITHUB_EMAIL_NOT_VERIFIED' });
          }

          user = await User.findOne({ email: verifiedEmail });

          if (user) {
            user = await linkProvider(user, 'githubId', profile.id, 'github');
          } else {
            user = await User.create({
              githubId: profile.id,
              email: verifiedEmail,
              username: safeUsername(profile.username || `gh${profile.id}`),
              fullName:
                profile.displayName || profile.username || 'GitHub traveler',
              authProvider: 'github',
              isEmailVerified: true,
              role: UserRolesEnum.USER,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
