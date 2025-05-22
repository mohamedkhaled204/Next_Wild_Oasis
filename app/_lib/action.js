"use server"

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth"
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

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

    const { data, error } = await supabase
        .from("guests")
        .update(updateData)
        .eq("id", session.user.guestId)
        .select()

    if (error)
        throw new Error(`Guest could not be updated: ${error.message}`);
    revalidatePath("/account/profile")
}


export async function updateReserVation(formData) {
    const session = await auth()
    if (!session) throw new Error("You are not logged in.")

    // 1) parse & validate
    const bookingId = Number(formData.get("bookingId"))
    const numGuests = Number(formData.get("numGuests"))
    const observations = formData.get("observations")?.slice(0, 1000) ?? ""

    if (
        !bookingId ||
        isNaN(numGuests) ||
        numGuests < 1 ||
        !observations.trim()
    ) {
        throw new Error("Please select a valid number of guests and add observations.")
    }

    // 2) build payload
    const updateResData = { numGuests, observations }

    // 3) update, filtering by BOTH booking.id and guestId
    const { data, error } = await supabase
        .from("bookings")
        .update(updateResData)
        .eq("id", bookingId)
        .eq("guestId", session.user.guestId)
        .select()
        .maybeSingle()

    if (error) {
        console.error(error)
        throw new Error("Failed to update booking due to a database error.")
    }
    if (!data) {
        // no row matched id+guestId
        throw new Error("No matching booking found—or you’re not the owner.")
    }

    // 4) success!
    revalidatePath("/account/reservations")
    redirect("/account/reservations")
}



export async function createBookings(createBookingWithData, formData) {
    const session = await auth()
    if (!session) throw new Error("You are not logged in.")

    const newBooking = {
        startDate: createBookingWithData.startDate,
        endDate: createBookingWithData.endDate,
        numNights: createBookingWithData.numNights,
        cabinPrice: createBookingWithData.cabinPrice,
        cabinId: createBookingWithData.cabinId,
        numGuests: Number(formData.get("numGuests")),
        observations: formData.get("observations"),
        hasBreakfast: false,
        isPaid: false,
        status: "unconfirmed",
        guestId: session.user?.guestId,
        extraPrice: 0,
        totalPrice: createBookingWithData.cabinPrice,
    }

    console.log(newBooking)
    const { error } = await supabase
        .from("bookings")
        .insert([newBooking])

    if (error) {
        console.error(error);
        throw new Error("Booking could not be created");
    }
    revalidatePath(`cabins/${createBookingWithData.cabinId}`)
    redirect("/cabins/thankyou")
}


export async function deleteBookings(bookingId) {
    const session = await auth();
    if (!session)
        throw new Error("You Are Not Logged In");
    const bookingsGuests = await getBookings(session.user?.guestId)
    const bookingsGuestsIds = bookingsGuests.map((el) => el.id)
    if (!bookingsGuestsIds.includes(bookingId))
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