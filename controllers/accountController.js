const utilities = require("../utilities")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const login = utilities.buildLoginForm()
    res.render("account/login", {
      title: "Login",
      nav,
      login
    })
  }
  


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    const register = utilities.buildRegistrationForm()
    res.render("account/register", {
      title: "Register",
      nav,
      register,
    })
  }
  
  module.exports = { buildLogin, buildRegister }