// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// build the add management page
router.get("/", utilities.handleErrors(invController.buildManagement))

// build the add classification page
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// build the add inventory page
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// add a new classification
router.post("/add-classification",invValidate.classificationRules(),invValidate.checkClassificationData,utilities.handleErrors(invController.addClassification))

// add new inventory
router.post("/add-inventory",invValidate.inventoryRules(),invValidate.checkNewInventoryData,utilities.handleErrors(invController.addInventory))

module.exports = router;