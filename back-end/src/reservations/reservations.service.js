const knex = require("../db/connection")

function list(date) {
    return knex("reservations")
        .select("*")
        .where({reservation_date: date})
        .whereNot({status: "finished"})
        .then(response => {
            return  response.sort((a, b) => { return a.reservation_time.localeCompare(b.reservation_time)})
        })
}

function post(reservation) {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then(returned => returned[0])
}

function read(reservationId) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservationId })
        .first()

}

function updateStatus(res, status) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: res })
        .update({ status }, "status")
        .returning("*")
        .then(res => res[0])
}

function search(mobile_number) {
    return knex("reservations")
        .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, "")}%`
        )
        .orderBy("reservation_date");
}

function update(updatedReservation) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: updatedReservation.reservation_id })
        .update(updatedReservation, "reservation_id")
        .returning("*")
        .then(response => response[0])
}

module.exports = {
    list,
    post,
    read,
    updateStatus,
    search,
    update
}