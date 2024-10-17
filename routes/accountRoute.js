
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

router.get("/", utilities.handleErrors(acctController.buildAccountMgmt))

//registering the new account 
router.post("/register",regValidate.registationRules(),regValidate.checkRegData,utilities.handleErrors(acctController.registerAccount))

// Process the login attempt
router.post("/login",regValidate.loginRules(),regValidate.checkLoginData, utilities.handleErrors(acctController.accountLogin))

module.exports = router