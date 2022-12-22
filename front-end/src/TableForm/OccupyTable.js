import React, { useEffect, useState } from "react";
import { useHistory , useParams} from "react-router-dom";
import { listTables , reserve } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function OccupyTable() {
    const [openTables, setOpenTables] = useState([]);
    const history = useHistory();
    const { reservation_id } = useParams()
    const initialFormData = { table_id: "", reservation_id: reservation_id};
    const [formData, setFormData] = useState({...initialFormData});
    const abortController = new AbortController();
    const [tableError, setTableError] = useState(null);

    const handleChange = ({ target }) => {

        setFormData({
            ...formData,
            [target.name]: target.value
        })

    }

    useEffect(loadDashboard, []);

    function loadDashboard() {



        listTables({}, abortController.signal)
            .then(setOpenTables)

        return () => abortController.abort();
    }

    async function submitHandler(event) {
        event.preventDefault()
        //add API call to update the table adding in reservation_id
        const params = {
            reservation_id: formData.reservation_id
        }
        try {
            await reserve(params, formData.table_id, abortController.signal)
            history.push('/dashboard')
        } catch (err) {
            setTableError(err)
        }

    }


    return (
        <div>

            <form onSubmit={(event) => submitHandler(event)}>
                <label for="table_id">Open Tables:</label>
                <ErrorAlert error={tableError} />
                <select name="table_id" id="table_id" onChange={handleChange} value={formData.table_id}>
                    <option value="">--No Table Selected--</option>
                    {openTables.map(table => {
                        return (<option value={`${table.table_id}`}>{`${table.table_name} - ${table.capacity}`}</option>)
                    })}

                </select>

                <button type="submit">SUBMIT</button>
                <button type="cancel" onClick={() => history.push("/dashboard")}>CANCEL</button>
            </form>
        </div>
    )

}


export default OccupyTable