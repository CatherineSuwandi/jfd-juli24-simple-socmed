const bcrypt        = require('bcryptjs')
const mysql         = require('mysql2')
const db            = require('../config/database').db
const eksekusi      = require('../config/database').eksekusi
const m_user        = require('../model/m_user')

let cari_username   = function(username) {
    return eksekusi(mysql.format(
        "SELECT * FROM user WHERE username = ?",
        [username]
    ))
}

module.exports =
{
    form_login: function(req,res) {
        if (req.session.user) {
            res.redirect('/feed')
        } else {
            let dataview = {
                message: req.query.msg
            }
            res.render('auth/form-login', dataview)
        }
    },


proses_login: async function(req,res) {
    let username    = req.body.form_username
    let password    = req.body.form_password
    let user        = await cari_username(username)

    console.log(user)
    if (user.length > 0 ) {
        let passwordCocok = bcrypt.compareSync(password, user[0].password)
        if (passwordCocok) {
            // set data session user yg login
            req.session.user = user

            // arahkan ke halaman feed
            res.redirect('/feed')
        } else {
            let message = 'Password incorrect'
            res.redirect(`/login?msg=${message}`)
        }
    } else {
        let message = 'User not found, please Sign Up'
        res.redirect(`/login?msg=${message}`)
    }
},

    cek_login: function(req,res,next) {
        if (req.session.user) {
            next()
        } else {
            let message = 'Session has ended, please login again'
            res.redirect(`/login?msg=${message}`)
        }
    },

    proses_logout: function(req,res) {
        req.session.destroy((err)=>{
            res.redirect('/')
        })
    },

    form_signup: function (req,res) {
        res.render('auth/new')
    },

    proses_signup: async function(req, res) {
        // Log the request body
        console.log(req.body); // Make sure the data is coming through
    
        // Get the form data
        let { form_username, form_password, form_namalengkap } = req.body;
    
        // Check if any field is undefined or null
        if (!form_username || !form_password || !form_namalengkap) {
            res.redirect('/signup?msg=All fields are required');
            return;
        }
    
        // Hash the password
        let hashedPassword = bcrypt.hashSync(form_password, 10);
    
        // Create a user object
        let user = {
            username: form_username,
            password: hashedPassword,
            nama_lengkap: form_namalengkap
        };
    
        try {
            // Use insert_user method from m_user model
            let insert = await m_user.insert_user(user);
            if (insert.affectedRows > 0) {
                res.redirect('/login');
            } else {
                res.redirect('/signup?msg=Could not create user, try again.');
            }
        } catch (error) {
            console.error(error);
            res.redirect('/signup?msg=Error occurred, try again.');
        }
    }
    
}