/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";


const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value.toString())
  );


  return await fetchJson(url, { headers, signal }, [])
      .then(formatReservationDate)
      .then(formatReservationTime);
}

/*
* Sends POST request to server in order to add a new reservation
*/

export async function addReservation(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const put = {data: {
      ...params,
      people: parseInt(params.people)
    }}

  return await fetchJson(url, {signal, method: 'POST', body: JSON.stringify(put), headers});

}

export async function addTable(params, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const put = {data: {
      ...params,
      capacity: parseInt(params.capacity)
    }}

  return await fetchJson(url, {signal, method: 'POST', body: JSON.stringify(put), headers});

}

export async function listTables(params, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);

  return await fetchJson(url, { headers, signal }, [])

}

export async function reserve(params, id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${id}/seat`);
  const put = {data: {
      reservation_id: parseInt(params.reservation_id)
    }}

  return await fetchJson(url, {signal, method: 'PUT', body: JSON.stringify(put), headers});

}

export async function freeTable(id, signal){
  const url = new URL(`${API_BASE_URL}/tables/${id}/seat`);
  const destroy = {data: {
      table_id: parseInt(id)
    }}

  return await fetchJson(url, {signal, method: 'DELETE', body: JSON.stringify(destroy), headers});

}

export async function cancelReservation(id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${id}/status`)
  const cancel = {data: { status: "cancelled" }}

  return await fetchJson(url, {signal, method: 'PUT', body: JSON.stringify(cancel), headers})
}

export async function updatedReservation(id, params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${id}`)
  const format = params.reservation_time.split(":");
  const time = format.join(":")


  const updated = { data: {
      first_name: params.first_name,
      last_name: params.last_name,
      mobile_number: params.mobile_number,
      reservation_date: params.reservation_date,
      reservation_time: time,
      reservation_id: parseInt(id),
      people: parseInt(params.people)
    }}

  return await fetchJson(url, {signal, method: 'PUT', body: JSON.stringify(updated), headers})
}

export async function readReservation(id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${id}`)

  return await fetchJson(url, { headers, signal }, [])
      .then(formatReservationDate)
      .then(formatReservationTime)

}