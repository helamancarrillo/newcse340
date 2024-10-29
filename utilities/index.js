const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
//   console.log(data)
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the select list of classification items
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = `<select name="classification_id" `
  classificationList += `id="classificationList" ` 
  classificationList += `required>`
  classificationList += `<option value=''>Choose a Classification</option>`
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += ` selected `
    }
    classificationList += `>${row.classification_name}</option>`
  })
  classificationList += `</select>`
  return classificationList
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = `<ul id="inv-display">`
      data.forEach(vehicle => { 
        grid += `<li class="car-card">`
        grid += `<div class="image-container">`
        grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`
        grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">`
        grid += `</a></div>`
        grid += `<div class="namePrice">`
        grid += `<hr>`
        grid += `<h2 class="car-card-heading">`
        grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ` 
        grid += `${vehicle.inv_make} ${vehicle.inv_model} details">` 
        grid += `${vehicle.inv_make} ${vehicle.inv_model}</a>`
        grid += `</h2>`
        grid += `<span>$${new Intl.NumberFormat(`en-US`).format(vehicle.inv_price)}</span>`
        grid += `</div>`
        grid += `</li>`
      })
      grid += `</ul>`
    } else { 
      grid += `<p class="notice">Sorry, no matching vehicles could be found.</p>`
    }
    return grid
  }

  Util.buildInventoryDetailGrid = async function(invData) {
    let grid
    grid = `<div id=details-container>`
    grid += `<div class="image-container">`
    grid += `<img src="${invData.inv_image}" alt="Image of ${invData.inv_make} ${invData.inv_model} on CSE Motors" id="vehicle-img-large">` 
    grid += `</div>`
    grid += `<section id="vehicle-details">`
    grid += `<h2 class="section-title">${invData.inv_make} ${invData.inv_model} Details</h2>`
    grid += `<table><tbody>`
    grid += `<tr><td><span class="details-label">Price: $${new Intl.NumberFormat('en-US').format(invData.inv_price)}</span></td></tr>`
    grid += `<tr><td><span class="details-label">Description: </span>`
    grid += `<span class="details-text">${invData.inv_description}</span></td></tr>`
    grid += `<tr><td><span class="details-label">Color: </span>`
    grid += `<span class="details-text">${invData.inv_color}</span></td></tr>`
    grid += `<tr><td><span class="details-label">Miles: </span>`
    grid += `<span class="details-text">${new Intl.NumberFormat('en-US').format(invData.inv_miles)}</span></td></tr>`
    grid += `</tbody></table></section></div>`
    return grid
  }

  Util.buildInventoryReviewSection = async function(reviewData) {
    let section = ""
    // if there is at least one review
    if (reviewData.length > 0) {
      section += `<ul class="review-list">`

      reviewData.forEach(review => {
        // set screenName = the first character of firstname and then lastname
        const screenName = `${review.account_firstname.charAt(0)}${review.account_lastname}`
        // format the date to MMMM d yyyy
        const reviewDate = new Date(review.review_date).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})
        
        section += `<li class="review">`
        section += `<p class="review-list-heading"><span id="screen-name">${screenName}</span> wrote on ${reviewDate}:</p>`
        section += `<hr>`
        section += `<p class="reviews-text">${review.review_text}</p>`
        section += `</li>`
      })
      section += `</ul>`
    } else {  //if no reviews exist then add this message
      section += `<p class="review-first-note">Start the conversation with a review.</p>`
    }

    return section
  }

  Util.buildAccountReviewList = async function(reviewData) {
    let reviews = ""

    if (reviewData.length > 0 ) {
      reviews += `<ol>`
      // make a list of each review item
      reviewData.forEach(review => {
        const vehicle = `${review.inv_year} ${review.inv_make} ${review.inv_model}`
        // format the date to MMMM d yyyy
        const reviewDate = new Date(review.review_date).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})
        
        reviews += `<li>Reviewed the ${vehicle} on ${reviewDate} | `
        reviews += `<a class="review-link" href="/review/edit/${review.review_id}">Edit</a> | <a class="review-link" href="/review/delete/${review.review_id}">Delete</a></li>`
      })
      reviews += `</ol>`
    } else { //if no reviews post this message
      reviews += `<p class="mgmt-text">You have no reviews to display.</p>`
    }

    return reviews
  }

  Util.buildErrorMessage = async function(error) {
    let message
    message = `<div id="error-page">`
    message += `<h2>${error.message}</h2>`
    message += `<img src="images/site/error.webp" width="600" height="400" loading="lazy" alt="Photo of 1 + 1 = 3 on chalkboard" id="error-img">`
    message += `<div><a href="https://www.pexels.com/photo/1-1-3-text-on-black-chalkboard-374918/" target="_blank" id="photo-source">Photo by George Becker</a></div>`
    message += `</div>`
    return message
  }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
*  Check Login
* ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
*  Check if Employee or Admin level authorization
* ************************************ */
Util.checkAuthorized = (req, res, next) => {
  Util.checkLogin(req, res, () => {
    if (res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin") {
      next()
    } else {
      req.flash("notice", "Unauthorized. You do not have permission to access the page.")
      return res.redirect("/account/login")
    }
  })
}

Util.checkUserMatch = (req, res, next) => {
  Util.checkLogin(req, res, () => {
    if (res.locals.accountData.account_id == req.params.account_id) {
      next()
    } else {
      req.flash("notice", "Unauthorized. You do not have permission to access the page.")
      return res.redirect("/account/login")  
    }
  })
}

module.exports = Util