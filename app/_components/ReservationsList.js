"use client"

import { useOptimistic } from "react"
import ReservationCard from "./ReservationCard"
import { deleteBookings } from "../_lib/action";

function ReservationsList({bookings}) {
    const [optimisticBookings, optimisticDelete] = useOptimistic(bookings,(curBookings, bookingId)=> {
        return curBookings.filter((booking) => console.log(booking));
        })

    async function handleDelete(bookingId){
        await deleteBookings(bookingId)
        optimisticDelete(bookingId);
    }
    return (
        <ul className="space-y-6">
            {optimisticBookings.map((booking) => (
                <ReservationCard booking={booking} key={booking.id} onDelete={handleDelete} />
            ))}
        </ul>
    )
}

export default ReservationsList
