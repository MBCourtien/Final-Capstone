import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { listReservations , listTables , freeTable} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today , asDateString } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import ReservationList from "../ReservationList/ReservationList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */


function Dashboard() {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const [dashDate, setDashDate] = useState(useQuery().get("date") || today());
    const history = useHistory()



    useEffect(loadDashboard, [dashDate]);

    function loadDashboard() {

        const abortController = new AbortController();
        setReservationsError(null);
        listReservations({ date: dashDate }, abortController.signal)
            .then(setReservations)
            .catch(setReservationsError);

        listTables({}, abortController.signal)
            .then(setTables)
            .catch(setReservationsError);

        return () => abortController.abort();
    }

    async function finishHandler(event) {
        const abortController = new AbortController();
        event.preventDefault();
        if (window.confirm("Is this table ready to seat new guests? This cannot be undone.")) {
            await freeTable(event.target.name, abortController.signal)
            history.go(0)
        }



    }

    let uniqueKey = 30000;

    function changeDayHandler(event) {
        event.preventDefault()

        const startDate = new Date(`${dashDate} 00:00`)
        const grab = startDate.getDate()

        if (event.target.name === "today") {
            setDashDate(today());
            return
        }

        event.target.name === "previous" ? startDate.setDate(grab - 1) : startDate.setDate(grab + 1)

        setDashDate(asDateString(startDate))
    }


    return (
        <main>
            <h1>Dashboard</h1>
            <div className="d-md-flex mb-3">
                <h4 className="mb-0">Reservations for date: {dashDate}</h4>
                <button name="previous" onClick={(event) => changeDayHandler(event)}>previous</button>
                <button name="today" onClick={(event) => changeDayHandler(event)}>today</button>
                <button name="next" onClick={(event) => changeDayHandler(event)}>next</button>
            </div>
            <ErrorAlert error={reservationsError} />
            <ReservationList reservations={reservations} />
            <div className="row-md">
                {tables.map((table, index) => {
                    return (
                        <div className="card" key={uniqueKey + index}>
                            <div className="card-body">
                                <h5 className="card-title">{`${table.table_name} - capacity: ${table.capacity}`}</h5>
                                {table.reservation_id && <div><p className="card-text" data-table-id-status={`${table.table_id}`}>Occupied</p>
                                    <button name={table.table_id} data-table-id-finish={table.table_id} onClick={(event) => finishHandler(event)} type="submit">Finish</button></div>
                                }
                                {!table.reservation_id && <p className="card-text" data-table-id-status={`${table.table_id}`}>Free</p>}
                            </div>
                        </div>
                    )

                })}
            </div>

        </main>
    );
}




export default Dashboard;
