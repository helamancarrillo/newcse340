
//Account Routes
//Needed Resources
const express = require("express")
const router = new express.Router()
const acctController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
 

// deliver login view
router.get("/login", utilities.handleErrors(acctController.buildLogin))

//deliver registration view
router.get("/register", utilities.handleErrors(acctController.buildRegister))

// build the account management page
router.get("/", utilities.checkLogin,utilities.handleErrors(acctController.buildAccountMgmt))

// create the logout path
router.get("/logout", utilities.handleErrors(acctController.accountLogout))

// build the account edit page
router.get("/edit/:account_id", utilities.handleErrors(acctController.buildEditAccount))

//registering the new account 
router.post("/register",regValidate.registationRules(),regValidate.checkRegData,utilities.handleErrors(acctController.registerAccount))

// Process the login attempt
router.post("/login",regValidate.loginRules(),regValidate.checkLoginData, utilities.handleErrors(acctController.accountLogin))

// Update account information
router.post("/edit-account",regValidate.accountEditRules(),regValidate.checkEditData,utilities.handleErrors(acctController.editAccount))

// Update password
router.post("/edit-password",regValidate.passwordRules(),regValidate.checkPassword,utilities.handleErrors(acctController.editPassword))

module.exports = router