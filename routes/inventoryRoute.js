// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// build the add inventory page
router.get("/", utilities.handleErrors(invController.buildManagement))

// build the add inventory page
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// build the add inventory page
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

module.exports = router;