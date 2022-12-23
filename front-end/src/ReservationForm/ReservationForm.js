import React, { useEffect, useState } from "react";
import { useHistory , useParams } from "react-router-dom";
import { addReservation , updatedReservation , readReservation} from "../utils/api";
import { today } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";


function ReservationForm() {

    let controller = new AbortController()
    let { reservation_id } = useParams()

    let history = useHistory()
    const [past, setPast] = useState(false)
    const [closed, setClosed] = useState(false)
    const [time, setTime] = useState(false)
    const [readError, setReadError] = useState(null);

    const initialFormData = {
        "first_name": "",
        "last_name": "",
        "mobile_number": "",
        "reservation_date": "",
        "reservation_time": "",
        "people": "",
    }

    const [formData, setFormData] = useState(initialFormData)



    useEffect(() => {

        let controller = new AbortController()
        async function grabRes(id)  {
            try {
                const current = await readReservation(id, controller.signal)
                setFormData({...current})
            } catch(error) {setReadError(error)}
        }

        if (reservation_id){
            grabRes(reservation_id)
        }

        return () => controller.abort()

    }, [])


    const handleChange = ({ target }) => {

        setFormData({
            ...formData,
            [target.name]: target.value
        })
        console.log(target.value)
    }

    function compareTime(formTime){
        let open = "10:30"
        let close = "21:30"

        if(open.localeCompare(formTime) === 1) {
            return true
        }

        if (close.localeCompare(formTime) === -1) {
            return true
        }

    }


    async function submitHandler(event) {
        event.preventDefault()
        console.log(reservation_id)
        const day = new Date(formData["reservation_date"]).getDay()
        if (day === 1) {
            if (formData["reservation_date"].localeCompare(today()) === -1) {
                setPast(true);
            }
            if (compareTime(formData["reservation_time"])) {
                setTime(true)
            }

            setClosed(true);
            return
        }

        if (formData["reservation_date"].localeCompare(today()) === -1) {

            if (compareTime(formData["reservation_time"])) {
                setTime(true)
            }


            setPast(true);
            return
        }



        if (compareTime(formData["reservation_time"])) {
            setTime(true)
            return
        }

        if (reservation_id) {
            console.log(formData.reservation_time)
            try {
                await updatedReservation(reservation_id, formData, controller.signal)
                history.push(`/dashboard?date=${formData.reservation_date}`)
            } catch (err) {setReadError(err)}
        } else {
            try {
                await addReservation(formData, controller.signal)
                history.push(`/dashboard?date=${formData.reservation_date}`)
            } catch (err) {setReadError(err)}
        }

    }





    return (
        <div>
            {closed === true && <h3 className="alert alert-danger">Date must be on operating business day</h3>}
            {past === true && <h3 className="alert alert-danger">Date must not be in the past</h3>}
            {time === true && <h3 className="alert alert-danger">Time must be during business hours</h3>}
            <ErrorAlert error={readError} />
            <form onSubmit={(event) => submitHandler(event)}>

                <label htmlFor="first_name">First Name:</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} required />

                <label htmlFor="last_name">Last Name:</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} required />

                <label htmlFor="mobile_number">Mobile Number:</label>
                <input name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />

                <label htmlFor="reservation_date">Reservation Date:</label>
                <input name="reservation_date" value={formData.reservation_date} onChange={handleChange} required type="date" />

                <label htmlFor="reservation_time">Reservation Time:</label>
                <input name="reservation_time" value={formData.reservation_time} onChange={handleChange} required type="time" />

                <label htmlFor="people">People:</label>
                <input name="people" value={formData.people} onChange={handleChange} required />

                <button type="submit">submit</button>
                <button type="cancel" onClick={() => history.push("/dashboard")}>CANCEL</button>

            </form>
        </div>
    )}



export default ReservationForm