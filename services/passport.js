const HttpsProxyAgent = require('https-proxy-agent');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  //console.log('**************** passport.serializeUser *********')
  //console.log(user)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //console.log('############### passport.deserializeUser '+ id +' ###############')
  User.findById(id).then(user => {
    done(null, user);
  });
});

const gStrategy = new GoogleStrategy(
  {
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    //console.log('********************');
    //console.log(profile)
    const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
  }
) 

  
 
const agent = new HttpsProxyAgent(keys.HTTP_PROXY);
gStrategy._oauth2.setAgent(agent);

passport.use(gStrategy);

 
