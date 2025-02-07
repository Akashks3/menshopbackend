require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://menshopbackend.onrender.com/auth/google/callback",
      scope:['profile','email'],
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log("profile", profile);

        let user = await User.findOne({ email: profile?.email }).lean().exec();

        if (!user) {
        
          user = await User.create({
            fname: profile.given_name,
            lname: profile.family_name,
            email: profile.email,
            profilePicture: profile.picture,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
