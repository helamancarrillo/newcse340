//Needed Resources
const express = require("express")
const router = new express.Router()
const acctController = require("../controllers/accountController")
const utilities = require("../utilities/")
const acctValidate = require("../utilities/account-validation")

// build the login form page
router.get("/login", utilities.handleErrors(acctController.buildLogin))

// build the registration form page
router.get("/register", utilities.handleErrors(acctController.buildRegister))

// build the account management page
router.get("/", 
    utilities.checkLogin,
    utilities.handleErrors(acctController.buildAccountMgmt))

// create the logout path
router.get("/logout", utilities.handleErrors(acctController.accountLogout))

// build the account edit page
router.get("/edit/:account_id", 
    utilities.checkLogin,
    utilities.checkUserMatch, //checks to confirm the logged in user matches the one being edited
    utilities.handleErrors(acctController.buildEditAccount))

// register new account
router.post(
    "/register",
    acctValidate.registationRules(),
    acctValidate.checkRegData,
    utilities.handleErrors(acctController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    acctValidate.loginRules(),
    acctValidate.checkLoginData,
    utilities.handleErrors(acctController.accountLogin)
)

// Update account information
router.post(
    "/edit-account",
    acctValidate.accountEditRules(),
    acctValidate.checkEditData,
    utilities.handleErrors(acctController.editAccount)
)

// Update password
router.post(
    "/edit-password",
    acctValidate.passwordRules(),
    acctValidate.checkPassword,
    utilities.handleErrors(acctController.editPassword)
)

module.exports = router