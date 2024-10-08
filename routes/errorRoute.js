const express = require("express")
const router = new express.Router()
const errController = require("../controllers/errorController")
const utilities = require("../utilities/")

router.get("/error-test",utilities.handleErrors(errController.throwError))

module.exports = router;