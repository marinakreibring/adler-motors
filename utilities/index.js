const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


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
      +' on Adler Motors" /></a>'
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
* Build item detail view HTML - 
* ************************************ */
//to utilities/index.js 
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrencyUSD(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

function formatNumberWithCommas(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  return Number(value).toLocaleString('en-US');
}

/* **********************************
 * buildVehicleDisplay with fields
 * inv_id, inv_make, inv_model, inv_year, 
 ********************************** */
Util.buildVehicleDisplay = function (vehicle) {
  if (!vehicle) return '<p class="notice">No vehicle data provided.</p>';

  const price = formatCurrencyUSD(vehicle.inv_price);
  const mileage = formatNumberWithCommas(vehicle.inv_miles);
  // try possible options for img
  const imgSrc = vehicle.inv_image_full || vehicle.inv_image || '/images/no-image.png';
  const img = escapeHtml(imgSrc);
  const make = escapeHtml(vehicle.inv_make);
  const model = escapeHtml(vehicle.inv_model);
  const year = vehicle.inv_year;
  const color = escapeHtml(vehicle.inv_color);
  const description = escapeHtml(vehicle.inv_description);
  const identnummer = escapeHtml(vehicle.classification_id);

  return `
    <div class="vehicle-detail">
      <h2>Product article number: ${identnummer}</h2>
      <div class="vehicle-grid">
        <div class="vehicle-image">
          <img src="${img}" alt="${make} ${model}">
        </div>
        <div class="vehicle-info">
          <p class="price">${price}</p>
          <p><strong>Production Year:</strong> ${year}</p>
          <p><strong>Mileage:</strong> ${mileage} miles</p>
          <p><strong>Make:</strong> ${make}</p>
          <p><strong>Color:</strong> ${color}</p>
          <p class="description">${description}</p>
        </div>
      </div>
    </div>
  `;
}

/* **************************************
* Build the classification select list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

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
     req.flash("notice", "Please log in")
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
 *  Check Login - week 5
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
 * Check account type for Employee or Admin - week 5 assignment
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin')) {
    next()
  } else {
    req.flash("notice", "Please log in with an Employee or Admin account.")
    return res.redirect("/account/login")
  }
}

/* **************************************
 * EXPORT — must be LAST
 ************************************** */
module.exports = Util;