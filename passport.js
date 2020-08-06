const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//Models
const UserModel = require('./models/UserModel');

// LOCAL STRATEGY
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        //Find the user given the email
        const user = await UserModel.findOne({ email });

        //If not, handle it
        if (!user) return done(null, false);

        //Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        //If not, handle it
        if (!isMatch) {
          return done(null, false);
        }

        //Otherwise, return the user
        done(null, user);
      } catch (error) {
        // done({ error_message: 'User is not registered' }, false);
        console.error(error);
        done(error, false);
      }
    }
  )
);

// JSON WEB TOKENS STRATEGY
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
      secretOrKey: process.env.jwt_secret,
    },
    async (payload, done) => {
      try {
        //Find user specified in token
        const user = await UserModel.findById(payload.sub);

        console.log(payload.sub);

        //If user doesn't exists, handle it
        if (!user) {
          return done(null, false);
        }

        //Otherwise, return the token
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});
