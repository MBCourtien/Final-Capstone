import React, { useState } from "react";
import { listReservations } from "../utils/api";
import ReservationList from "../ReservationList/ReservationList";






function Search() {

    const [mobile, setMobile] = useState("")
    const [reservations, setReservations] = useState([])
    const [setReservationsError] = useState(null);
    const [noReservations, setNoReservations] = useState(false);




    function handleChange({target}) {
        setMobile(target.value)
    }

    function submitHandler(event) {
        event.preventDefault();
        const abortController = new AbortController();
        setReservationsError(null);
        listReservations({ mobile_number: mobile }, abortController.signal)
            .then(response => {
                response.length > 0 ? setReservations(response) : setNoReservations(true)
            })
            .catch(setReservationsError);

    }


    return (
        <div>
            <form onSubmit={(event) => submitHandler(event)}>
                <label to="mobile_number">Enter a customer's phone number</label>
                <input name="mobile_number" value={mobile} onChange={handleChange} />
                <button type="submit">Find</button>
            </form>
            <ReservationList reservations={reservations} />
            {noReservations === true && <p>No reservations found</p>}
        </div>



    )
}

export default Search