const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const reviewModel = require("../models/review-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }


/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountMgmt(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const reviewData = await reviewModel.getReviewsByAccountId(account_id)
  const reviews = await utilities.buildAccountReviewList(reviewData)
  res.render("account", {
    title: "Account Management",
    nav,
    reviews,
    errors: null,
  })
}

/* ****************************************
*  Deliver account edit view
* *************************************** */
async function buildEditAccount(req, res, next) {
  //console.log("Executing buildEditAccount middleware");
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const userData = await accountModel.getAccountById(account_id)
  
  if (userData.success) {
    res.locals.accountData = userData.data;  

    res.render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id: userData.data.account_id,
      account_firstname: userData.data.account_firstname,
      account_lastname: userData.data.account_lastname,
      account_email: userData.data.account_email,
    })
  } else {
    req.flash("notice", userData.error)
    res.status(500).render("account/", {
      title: "Account Management",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  }

 /* ****************************************
 *  Process edit account info
 * ************************************ */
async function editAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const editResult = await accountModel.editAccount(account_id, account_firstname, account_lastname, account_email)
  
  if (editResult.success) {
    // Regenerate the JWT with the new information
    const accountData = {
      account_id: editResult.data.account_id,
      account_firstname: editResult.data.account_firstname,
      account_lastname: editResult.data.account_lastname,
      account_email: editResult.data.account_email,
      account_type: editResult.data.account_type
    };

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash(
      "notice",
      "Your account information has been successfully updated."
    ) 
    res.redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

}

/* ****************************************
 *  Process edit password
 * ************************************ */
async function editPassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error changing your password.')
    res.status(500).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname: res.locals.accountData.account_firstname || null,
      account_lastname: res.locals.accountData.account_lastname || null,
      account_email: res.locals.accountData.account_email || null,
    })
  }

  const editResult = await accountModel.editPassword(account_id, hashedPassword)
  
  if (editResult.success) {
    req.flash(
      "notice",
      "Your password has been successfully updated."
    ) 
    res.redirect("/account")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname: res.locals.accountData.account_firstname || null,
      account_lastname: res.locals.accountData.account_lastname || null,
      account_email: res.locals.accountData.account_email || null,
    })
  }
}


  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
 }


 /* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

  module.exports = { 
    buildLogin,
    buildRegister, 
    buildAccountMgmt, 
    buildEditAccount, 
    registerAccount, 
    accountLogin, 
    accountLogout, 
    editAccount, 
    editPassword 
  }