const service = require("./reservations.service")
const moment = require("moment");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");




/**
 * List handler for reservation resources
 */
function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
      .toString(10)
      .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}

async function list(req, res) {

  const date = req.query.date;
  const today = asDateString(new Date());
  console.log(date)

  if (date){
    const data = await service.list(date)
    res.json({data});} else {
    const data = await service.list(today)
    res.json({data});
  }

}

function hasValidBody(bodyType) {
  return function (req, res, next) {
    const { data = {}} = req.body
    if (data[bodyType]) {
      return next()
    }
    next({ status: 400, message: `Must Include a ${bodyType}`})
  }
}

function empty(bodyType) {
  return function (req, res, next) {
    const { data = {}} = req.body

    if (data[bodyType].toString().length === 0) { return next({ status: 400, message: `${data[bodyType]} must not be empty`})}

    next()
  }
}

function validateDateIsPresent(req, res, next) {
  const { data = {}} = req.body
  const today = asDateString(new Date())

  if (data["reservation_date"].localeCompare(today) === -1) {
    next({status: 400, message: "reservation_date must today or in the future"})
  }
  next()


}

function validateBussinessIsOpen(req, res, next) {
  const { data = {}} = req.body
  const day = new Date(`${data["reservation_date"]} 00:00`).getDay()
  const dayWithout = new Date(data["reservation_date"])

  console.log(`day: ${day}`)
  console.log(`reservation Date: ${data["reservation_date"]}`)
  console.log(`day without: ${dayWithout}`)

  if (day === 2) {
    next({status: 400, message: "reservation_date must be on an operating bussiness day, bussiness is closed on date of reservation"})
  }
  next()
}

function validateOpenTime(req, res, next) {
  const { data = {}} = req.body
  const time = data["reservation_time"]

  let open = "10:30"
  let close = "21:30"

  if (open.localeCompare(time) === 1) {
    next({status: 400, message: "reservation_time is during time business is closed "})
  }

  if (close.localeCompare(time) === -1) {
    next({status: 400, message: "reservation_time is during time business is closed "})
  }

  next()

}

function validateDate(req, res, next) {
  const { data = {}} = req.body

  if (moment(data["reservation_date"], 'YYYY-MM-DD', true).isValid()) {return next()} else { return next({ status: 400, message:`reservation_date Must be A Valid Date`})}

}

function validateTime(req,res, next) {
  const { data = {}} = req.body

  if (moment(data["reservation_time"], 'HH:mm', true).isValid()) {return next()} else { return next({status: 400, message: "reservation_time must be a valid time"})}

}

function validatePeople(req, res, next) {
  const { data = {}} = req.body;
  const check = typeof data["people"];

  if(check !== "number") {return next({status: 400, message: "people must be a valid number"})}


  next()
}

function mobileIsNumber(req, res, next) {
  const { data = {}} = req.body;
  const check = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(data["mobile_number"])

  if (!check) {return next({status:404, message: "Mobile Number must be a valid 10 digit phone number"})}

  next()
}

async function create(req, res) {


  const data = await service.post(req.body.data)
  res.status(201).json({ data })
}

async function read(req, res, next) {
  const { reservationId } = req.params;
  const data = await service.read(reservationId)
  if (!data) {return next({status: 404, message: `${reservationId} does not exist`})}

  res.json({ data })
}

function validStatus(req, res, next) {
  const { data = {}} = req.body;
  let count = 0

  if (data.status !== "booked") {
    count += 1
  }

  if (data.status !== "seated") {
    count += 1
  }

  if (data.status !== "finished") {
    count += 1
  }

  if (data.status !== "cancelled") {
    count += 1
  }


  if (count === 4) {return next({status: 400, message: `${data.status} is an unknown status`}) }

  next()
}

function validNewStatus(req, res, next) {
  const { data = {}} = req.body;
  if (data.status === "seated" || data.status === "finished") {
    next({status: 400, message: "status must not be seated or finished"})
  }
  next()
}

async function isFinished(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id)
  if (!reservation) {return next({status: 404, message: `${reservation_id} does not exist`})}
  if (reservation.status === "finished") {return next({status: 400, message: "finished tables cannot be updated"})}
  next()
}

async function statusUpdate(req, res){
  const { data = {}} = req.body;
  const { reservation_id } = req.params;

  const response = await service.updateStatus(reservation_id, data.status)

  res.status(200).json({data: response})


}

async function mobileSearch(req, res, next) {
  const mobile_number = req.query.mobile_number;

  if (mobile_number) {
    const data = await service.search(mobile_number);

    data ? res.json({data}) : res.json({ data: [] })

  } else {
    next()
  }


}

async function put(req, res) {
  const reservation_id = res.locals.reservation.reservation_id

  const updatedTable = {
    ...req.body.data,
    reservation_id: reservation_id
  }

  const data = await service.update(updatedTable)
  res.status(200).json({ data })

}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const data = await service.read(reservationId)
  if (!data) {return next({status: 404, message: `${reservationId} does not exist`})}
  res.locals.reservation = data
  next()
}



module.exports = {
  list: [mobileSearch, asyncErrorBoundary(list)],
  create: [
    hasValidBody("first_name"),
    empty("first_name"),
    hasValidBody("last_name"),
    empty("last_name"),
    hasValidBody("mobile_number"),
    empty("mobile_number"),
    hasValidBody("reservation_date"),
    validateDateIsPresent,
    validateBussinessIsOpen,
    validateOpenTime,
    mobileIsNumber,
    empty("reservation_date"),
    hasValidBody("reservation_time"),
    empty("reservation_time"),
    hasValidBody("people"),
    empty("people"),
    validateDate,
    validateTime,
    validatePeople,
    validNewStatus,
    asyncErrorBoundary(create)],
  read,
  statusUpdate: [validStatus, asyncErrorBoundary(isFinished), asyncErrorBoundary(statusUpdate)],
  put : [
    reservationExists,
    hasValidBody("first_name"),
    empty("first_name"),
    hasValidBody("last_name"),
    empty("last_name"),
    hasValidBody("mobile_number"),
    empty("mobile_number"),
    hasValidBody("reservation_date"),
    validateDateIsPresent,
    validateBussinessIsOpen,
    validateOpenTime,
    mobileIsNumber,
    empty("reservation_date"),
    hasValidBody("reservation_time"),
    empty("reservation_time"),
    hasValidBody("people"),
    empty("people"),
    validateDate,
    validateTime,
    validatePeople,
    validNewStatus,
    asyncErrorBoundary(put)
  ]
};