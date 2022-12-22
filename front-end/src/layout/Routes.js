import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import ReservationForm from "../ReservationForm/ReservationForm";
import TableForm from "../TableForm/TableForm";
import OccupyTable from "../TableForm/OccupyTable";
import Search from "../search/search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {

    return (
        <Switch>
            <Route exact={true} path="/">
                <Redirect to={"/dashboard"} />
            </Route>
            <Route exact={true} path="/reservations">
                <Redirect to={"/dashboard"} />
            </Route>
            <Route exact={true} path="/search">
                <Search />
            </Route>
            <Route path="/reservations/:reservation_id/seat" exact={true}>
                <OccupyTable />
            </Route>
            <Route path="/reservations/:reservation_id/edit" exact={true}>
                <ReservationForm />
            </Route>
            <Route path="/reservations/new" exact={true}>
                <ReservationForm />
            </Route>
            <Route path="/tables/new">
                <TableForm />
            </Route>
            <Route path="/dashboard">
                <Dashboard />
            </Route>
            <Route>
                <NotFound />
            </Route>
        </Switch>
    );
}

export default Routes;