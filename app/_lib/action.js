"use server"

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth"
import { supabase } from "./supabase";
import { getBookings } from "./data-service";

export async function updateGuest(formData) {
    const session = await auth();
    if (!session)
        throw new Error("You Are Not Logged In");

    const nationalID = formData.get("nationalID")?.trim();
    const nationalityRaw = formData.get("nationality")?.trim();
    const [nationality, countryFlag] = nationalityRaw?.includes("%")
        ? nationalityRaw.split("%")
        : [nationalityRaw, null];

    if (!nationalID || !countryFlag || !nationality)
        throw new Error("All fields must be filled properly.");

    if (!/^\d{6,12}$/.test(nationalID))
        throw new Error("National ID must be 6 to 12 digits.");

    if (!session.user?.guestId)
        throw new Error("User ID is missing.");

    const updateData = { nationalID, countryFlag, nationality };

;
    const { data, error } = await supabase
        .from("guests")
        .update(updateData)
        .eq("id", session.user.guestId)
        .select()
 
    if (error)
        throw new Error(`Guest could not be updated: ${error.message}`);
    revalidatePath("/account/profile")
}

export async function deleteReservation(bookingId) {
    const session = await auth();
    if (!session)
        throw new Error("You Are Not Logged In");
    const bookingsGuests = await getBookings(session.user?.guestId)
    const bookingsGuestsIds = bookingsGuests.map((el)=> el.id)
    if(!bookingsGuestsIds.includes(bookingId)) 
        throw new Error("You Are Not Allowed To Delete This Booking")
    const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

    if (error) {
        console.error(error);
        throw new Error("Booking could not be deleted");
    }
    revalidatePath("/account/reservations")
}

export async function signInAction() {
    await signIn("google", { redirectTo: '/account' });
}

export async function signOutAction() {
    await signOut({ redirectTo: "/" });
}