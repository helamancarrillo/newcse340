const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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
  const invData = await invModel.getInventoryByInvId(inv_id)
  const reviewData = await reviewModel.getReviewsByInvId(inv_id)
  const screen_name = (res.locals.loggedin === 1) ? `${res.locals.accountData.account_firstname.charAt(0)}${res.locals.accountData.account_lastname}` : ""
  const grid = await utilities.buildInventoryDetailGrid(invData)
  const reviews = await utilities.buildInventoryReviewSection(reviewData)
  let nav = await utilities.getNav()
  const vehicleTitle = `${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    grid,
    screen_name,
    reviews,
    review_text: "",
    inv_id,
    errors: null,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav() 
  const classificationSelect = await utilities.buildClassificationList() 
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  })
}

/* ***************************
 *  Build Add Classification view
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
 *  Build Add Inventory view
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
    const classificationSelect = await utilities.buildClassificationList()
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect,
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

    const classificationSelect = await utilities.buildClassificationList()
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build Edit Inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()  
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  const classList = await utilities.buildClassificationList(itemData.classification_id)
  res.render("./inventory/edit-inventory", {
    title: `Modify: ${itemName}`,
    nav,
    classList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Build Delete Inventory view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()  
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/delete-inventory", {
    title: `Delete: ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    })
}

/* ***************************
 *  Edit Inventory
 * ************************** */
invCont.editInventory = async function(req, res, next) { 
  let nav = await utilities.getNav()
  const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

  const editResult = await invModel.editInventory(inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)

  if (editResult) { 
    const itemName = editResult.inv_make + " " + editResult.inv_model   
    req.flash(
      "notice",
      `The ${itemName} has been successfully modified.`
    )
    res.redirect("/inv/")
    
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classList: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Delete Inventory
 * ************************** */
invCont.deleteInventory = async function(req, res, next) { 
  let nav = await utilities.getNav()
  const { inv_id } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) { 
    req.flash(
      "notice",
      `The vehicle has been successfully deleted.`
    )
    res.redirect("/inv/")
    
  } else {
    
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("./inventory/delete-inventory", {
    title: `Delete`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    })
  }
}

module.exports = invCont