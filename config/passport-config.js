const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const db  = require('../config/database-config');
const helpers  = require('../config/helpers');

// Establish and maintained session via a cookie set in the user's browser.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
 
    db.query('SELECT * FROM user where user_id = ?', [id.user], (error, rows, fields) => {
        done(null,rows[0]);
    });
});

passport.use('signin', new LocalStrategy ({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    // session: false
}, (request, email, password, done) => {

        db.query('SELECT * FROM user where email = ?', [email], (error, rows, fields) => {

            if (rows.length > 0) {

                let flag = authenticatePassword(rows, password);

                if ( flag == true ) {
                    return done(null, {user: rows[0].user_id});
                } else {
                    return done(null, false, { message: 'Your password is incorrect.' });
                }

            } else {
                return done(null, false, { message: 'That email doesn\'t exist. Please check and try again.' });
            }
        });
    }
));

// To check whether the entered password is correct or not
let authenticatePassword = (rows, password) => {

    let flag = false;

    if (rows.length > 0) {

        let hashedPassword = rows[0].password;
        
        if (helpers.hash(password) === hashedPassword){
            flag = true;
        }
    }

    return flag;
};

module.exports = passport;