import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/User.models';
import { UserRolesEnum } from '../utils/constants';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
          } else {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              username:
                profile.emails[0].value.split('@')[0] + '_' + Date.now(),
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
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const email =
            profile.emails?.[0]?.value ||
            `${profile.username}@github-placeholder.com`;

          user = await User.findOne({ email });

          if (user) {
            user.githubId = profile.id;
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
          } else {
            await User.create({
              githubId: profile.id,
              email,
              username: profile.username + '_' + Date.now(),
              fullName: profile.displayName || profile.username,
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
