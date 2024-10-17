const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


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
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }


/* **************************************
* Build the detail view 
* ************************************ */
Util.buildInventoryDetailGrid = async function(data) {
  let grid
  grid = `<div id="details-container">`
  grid += `<div class="image-container">`
  grid += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors" id="vehicle-img-large">` 
  grid += `</div>`
  grid += `<section id="vehicle-details">`
  grid += `<h2 class="section-title">${data.inv_make} ${data.inv_model} Details</h2>`
  grid += `<table><tbody>`
  grid += `<tr><td><span class="details-label">Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</span></td></tr>`
  grid += `<tr><td><span class="details-label">Description: </span>`
  grid += `<span class="details-text">${data.inv_description}</span></td></tr>`
  grid += `<tr><td><span class="details-label">Color: </span>`
  grid += `<span class="details-text">${data.inv_color}</span></td></tr>`
  grid += `<tr><td><span class="details-label">Miles: </span>`
  grid += `<span class="details-text">${new Intl.NumberFormat('en-US').format(data.inv_miles)}</span></td></tr>`
  grid += `</tbody></table></section></div>`
  return grid
}

/* **************************************
* Build the error handler
* ************************************ */
Util.buildErrorMessage = async function(error) {
  let message
  message = `<div id="error-page">`
  message += `<h2>${error.message}</h2>`
  message += `<img src="images/site/error.webp" width="600" height="400" loading="lazy" alt="Error image" id="error-img">`
  message += `<div><a href="https://stock.adobe.com/hn/search?k=error&asset_id=297016511" target="_blank" id="photo-source">Image by Adobe Stock</a></div>`
  message += `</div>`
  return message
}




/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul>'
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



//Util.buildLoginForm = function() {
//  let form 
//  form = `<div class="form-card">
//      <fieldset id="fielset">
//      <form id="login-form">
//          <label>Email:
//          <input type="email" id="login-username" name="username" class="form-input"></label><br>
//          <label>Password:
//          <input type="password" id="login-password" name="password" class="form-input"></label><br>
//          <input type="submit" value="Login" class="form-button" title="Click here to login"> 
//      </form>
//      <div id="sign-up">
//          <span>No account?</span>
//          <a title="Click here to sign up" href="/account/register">Sign-up</a>
//      </div>
//      </fieldset>
//    </div>`
//  return form
//}
//
//
//Util.buildRegistrationForm = function () {
//  let form
//  form = `<div class="form-card">
//      <fieldset id="fielset">
//      <form id="register-form">
//          <p>*All fields are required</p>
//          <label>First Name:
//              <input type="text" name="account_firstname" class="form-input">
//            </label><br>
//          <label>Last Name:
//              <input type="text" name="account_lastname" class="form-input">
//          </label><br>
//          <label>Email:
//            <input type="email" name="account_email" class="form-input">
//          </label><br>
//          <label>Password:
//            <input type="password" name="account_password" class="form-input">
//          </label><br>
//          <section id="password-note">
//          <p>Passwords must be min 12 characters in length, 
//          contain at least 1 capital letter, contain at least 1 number,
//          and contain at least 1 special character </p>
//          </section>
//          <input type="submit" value="Register" class="form-button" title="Click here to submit registration">
//      </fieldset>
//      </form>
//  </div>`
//  return form;
//}





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



module.exports = Util