const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build inventory by id view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryByInvId(inv_id)
    const grid = await utilities.buildInventoryDetailGrid(data)
    let nav = await utilities.getNav()
    const vehicleTitle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      grid,
      errors: null,
    })
  }

  
/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}


/* ***************************
 *  Build management view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()  
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}


/* ***************************
 *  Build management view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()  
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    errors: null,
  })
}


module.exports = invCont