const service = require("./tables.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")


async function post(req, res) {
    const data = await service.post(req.body.data)
    res.status(201).json({ data })
}

async function list(req, res) {
    const data = await service.list()
    res.json({ data })
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

function checkZero(req, res, next) {
    const { data = {}} = req.body;
    const check = data["capacity"];

    if (check === 0) {return next({status: 400, message: "Capacity must not be 0"})}

    next()
}

function tableNameLength(req, res, next) {
    const { data = {}} = req.body;
    const check = data["table_name"];

    if (check.length === 1) { return next({status: 400, message: "table_name must be greater than one character"})}

    next()
}

function validateCapacity(req, res, next) {
    const { data = {}} = req.body;
    const check = typeof data["capacity"];

    console.log(check)

    if(check !== "number") {return next({status: 400, message: "capacity must be a valid number"})}


    next()

}

async function validReservation(req, res, next) {
    const { data = {}} = req.body;
    const check = data["reservation_id"];

    const reservation = await service.readRes(check);

    if (!reservation) { return next({ status: 404, message: `reservation_id ${check} does not exist`})}


    res.locals.reservation = reservation
    next()
}

async function sufficientCapacity(req, res, next) {
    const people = res.locals.reservation.people;
    const table = await service.read(req.params.table_id);
    const capacity = table.capacity;

    if (people > capacity) {return next({status: 400, message: "table does not have sufficient capacity"})}

    res.locals.table = table
    next()


}

function isReserved(req, res, next) {
    const table = res.locals.table;

    if (table.reservation_id) {return next({status: 400, message: "table is occupied"})}

    next()

}

async function put(req, res) {
    const reservation_id = res.locals.reservation.reservation_id

    const updatedTable = {
        ...req.body.data,
        table_id: req.params.table_id
    }

    await service.seatTable(reservation_id)


    const data = await service.update(updatedTable)
    res.status(200).json({ data })
}

function alreadySeated(req, res, next) {
    if (res.locals.reservation.status === "seated") {return next({status: 400, message: "table is already seated"})}
    next()
}


async function freeTable(req, res, next) {
    await service.finishTable(res.locals.table.reservation_id)
    const data = await service.freeTable(req.params.table_id)
    res.status(200).json({ data })
}

async function validTable(req, res, next) {
    const table = await service.read(req.params.table_id);
    if (!table) { return next({status: 404, message: `${req.params.table_id} not a valid table_id`})}
    res.locals.table = table
    next()
}

function validFreeUp(req, res, next) {
    if (!res.locals.table.reservation_id) {return next({status: 400, message: "table is not occupied"})}
    next()
}




module.exports = {
    post: [
        hasValidBody("table_name"),
        empty("table_name"),
        hasValidBody("capacity"),
        empty("capacity"),
        checkZero,
        tableNameLength,
        asyncErrorBoundary(validateCapacity),
        asyncErrorBoundary(post)],
    list,
    put: [
        hasValidBody("reservation_id"),
        asyncErrorBoundary(validReservation),
        sufficientCapacity,
        isReserved,
        alreadySeated,
        asyncErrorBoundary(put)
    ],
    freeTable: [
        asyncErrorBoundary(validTable),
        validFreeUp,
        asyncErrorBoundary(freeTable)]
}