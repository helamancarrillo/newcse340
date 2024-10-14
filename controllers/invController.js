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
 *  Build Add Classification View
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
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classList = await utilities.buildClassificationList()  
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classList,
    errors: null,
  })
}


/* ***************************
 *  Add New Classification
 * ************************** */
invCont.addClassification = async function(req, res, next) { 
  const { classification_name } = req.body
  
  const addResult = await invModel.addClassification(classification_name)
  if (addResult) {
    let nav = await utilities.getNav()
    
    req.flash(
      "notice",
      `${classification_name} has been successfully added.`
    )
    res.status(201).render("./inventory/management", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", `Something went wrong. Failed to add ${classification_name}.`)
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Add New Inventory
 * ************************** */
invCont.addInventory = async function(req, res, next) { 
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  
  const addResult = await invModel.addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)

  if (addResult) {    
    req.flash(
      "notice",
      `${inv_year} ${inv_make} ${inv_model} has been successfully added.`
    )

    res.status(201).render("./inventory/management", {
      title: "Add New Inventory",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", `Something went wrong. Failed to add to inventory.`)
    const classList = await utilities.buildClassificationList()
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classList,
      errors: null,
    })
  }
}


module.exports = invCont