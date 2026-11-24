
/* GET CURRENT USER */

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}


/* GET ALL BOOKINGS */

function getBookings() {
    return JSON.parse(localStorage.getItem("bookings")) || [];
}


/* SAVE BOOKINGS */

function saveBookings(bookings) {
    localStorage.setItem("bookings", JSON.stringify(bookings));
}


/* WEBSITE NOTIFICATION */

let notificationTimer;

function showNotification(message) {

    const notification =
        document.getElementById("notification");

    const notificationMessage =
        document.getElementById("notificationMessage");

    notificationMessage.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function() {
        notification.classList.remove("show");
    }, 3000);
}


/* SHOW LOGIN OR REGISTER */

function showAuthPage(pageId) {

    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");
}


/* SHOW WEBSITE PAGES */

function showPage(pageId) {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        showAuthPage("login");
        return;
    }

    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    if (pageId === "dashboard") {
        updateDashboard();
    }

    if (pageId === "bookings") {
        displayBookings();
    }

    if (pageId === "profile") {
        displayProfile();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* REGISTER FORM */

document.getElementById("registerForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim().toLowerCase();

    const password =
        document.getElementById("registerPassword").value;

    let users =
        JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(function(user) {
        return user.email === email;
    });

    if (existingUser) {
        alert("This email is already registered.");
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("registerForm").reset();

    showAuthPage("login");

    showNotification("Registration successful! Please login.");

});


/* LOGIN FORM */

document.getElementById("loginForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim().toLowerCase();

    const password =
        document.getElementById("loginPassword").value;

    const users =
        JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(function(item) {
        return item.email === email &&
               item.password === password;
    });

    if (!user) {
        alert("Invalid email or password. Please try again.");
        return;
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    document.body.classList.remove("logged-out");
    document.body.classList.add("logged-in");

    document.getElementById("loginForm").reset();

    showPage("dashboard");

    showNotification("Login successful! Welcome to SportsHub.");

});


/* LOGOUT */

function logout() {

    localStorage.removeItem("currentUser");

    document.body.classList.remove("logged-in");
    document.body.classList.add("logged-out");

    showAuthPage("login");

    showNotification("You have logged out successfully.");

}


/* UPDATE DASHBOARD */

function updateDashboard() {

    const user = getCurrentUser();

    if (!user) return;

    document.getElementById("welcomeMessage").textContent =
        "Welcome, " + user.name + "!";

    const bookings = getBookings();

    const userBookings = bookings.filter(function(booking) {
        return booking.email === user.email;
    });

    document.getElementById("dashboardBookings").textContent =
        userBookings.length;
}


/* SELECT SPORT FROM FACILITIES */

function selectSport(sportName) {

    document.getElementById("sport").value = sportName;

    showPage("book");

}


/* SET MINIMUM BOOKING DATE */

function setMinimumDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    const minimumDate = year + "-" + month + "-" + day;

    document.getElementById("bookingDate").min = minimumDate;
}


/* BOOKING FORM */

document.getElementById("bookingForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        showAuthPage("login");
        return;
    }
    const bookingName =
    document.getElementById("bookingName").value.trim();

    const sport =
        document.getElementById("sport").value;

    const date =
        document.getElementById("bookingDate").value;

    const time =
        document.getElementById("bookingTime").value;

    const players =
        document.getElementById("players").value;

    if (!bookingName || !sport || !date || !time || !players) {
        alert("Please fill in all booking details.");
        return;
    }

    const selectedDate = new Date(date + "T00:00:00");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert("Please select today or a future date.");
        return;
    }

    let bookings = getBookings();

    const newBooking = {

        id: Date.now(),

        name: bookingName,
        email: user.email,
        sport: sport,

        date: date,

        time: time,

        players: players

    };

    bookings.push(newBooking);

    saveBookings(bookings);

    document.getElementById("bookingForm").reset();

    setMinimumDate();

    showPage("bookings");

    showNotification("Your booking has been confirmed successfully!");

});


/* DISPLAY BOOKINGS */

function displayBookings() {

    const user = getCurrentUser();

    if (!user) return;

    const bookingList =
        document.getElementById("bookingList");

    bookingList.innerHTML = "";

    const bookings = getBookings();

    const userBookings = bookings.filter(function(booking) {
        return booking.email === user.email;
    });

    if (userBookings.length === 0) {

        bookingList.innerHTML =
            '<div class="no-bookings">' +
            '<h3>No Bookings Found</h3>' +
            '<p>You have not booked any sports facility yet.</p>' +
            '<button onclick="showPage(\'facilities\')">' +
            'Explore Facilities</button></div>';

        return;
    }

    userBookings.forEach(function(booking) {

        const bookingCard =
            document.createElement("div");

        bookingCard.className = "booking-card";

        const heading = document.createElement("h3");
        heading.textContent = booking.sport;

        const name = document.createElement("p");
        name.textContent = "Name: " + booking.name;

        const date = document.createElement("p");
        date.textContent = "Date: " + booking.date;

        const time = document.createElement("p");
        time.textContent = "Time: " + booking.time;

        const players = document.createElement("p");
        players.textContent = "Players: " + booking.players;

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel Booking";

        cancelButton.addEventListener("click", function() {
            cancelBooking(booking.id);
        });

        bookingCard.appendChild(heading);
        bookingCard.appendChild(name);
        bookingCard.appendChild(date);
        bookingCard.appendChild(time);
        bookingCard.appendChild(players);
        bookingCard.appendChild(cancelButton);

        bookingList.appendChild(bookingCard);

    });

}


/* CANCEL BOOKING */

function cancelBooking(bookingId) {

    const bookings = getBookings();

    const updatedBookings = bookings.filter(function(booking) {
        return booking.id !== bookingId;
    });

    saveBookings(updatedBookings);

    displayBookings();

    updateDashboard();

    showNotification("Booking cancelled successfully.");

}


/* DISPLAY PROFILE */

function displayProfile() {

    const user = getCurrentUser();

    if (!user) return;

    document.getElementById("profileName").textContent =
        user.name;

    document.getElementById("profileEmail").textContent =
        user.email;

}


/* INITIAL WEBSITE SETUP */

document.addEventListener("DOMContentLoaded", function() {

    setMinimumDate();

    const user = getCurrentUser();

    if (user) {

        document.body.classList.remove("logged-out");
        document.body.classList.add("logged-in");

        showPage("dashboard");

    } else {

        document.body.classList.remove("logged-in");
        document.body.classList.add("logged-out");

        showAuthPage("login");

    }

});
