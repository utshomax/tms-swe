

var firebaseConfig = {
    apiKey: "AIzaSyDniEFNhNnRYzsOCYCAjuAMfl-_sD-_f0A",
    authDomain: "salman-4747c.firebaseapp.com",
    databaseURL: "https://salman-4747c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "salman-4747c",
    storageBucket: "salman-4747c.appspot.com",
    messagingSenderId: "159704710699",
    appId: "1:159704710699:web:4e0845a8c8c72a663eb46e"
  };
  firebase.initializeApp(firebaseConfig);
  
  // Get a reference to the appointments collection in the database
  var appointmentsRef = firebase.database().ref('appointments');
  
  // Get the form element
  var form = document.querySelector("#add-appointment form");
  
  // Listen for form submission
  form.addEventListener("submit", function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
  
    // Get the form input values
    var date = form.elements.date.value;
    var time = form.elements.time.value;
    var duration = form.elements.duration.value;
    var attendees = form.elements.attendees.value;
    var venue = form.elements.venue.value;
    var purpose = form.elements.purpose.value;
  
    // Create a new appointment object
    var appointment = {
      date: date,
      time: time,
      duration: duration,
      attendees: attendees,
      venue: venue,
      purpose: purpose
    };
  
    // Add the appointment to the database
    appointmentsRef.push(appointment)
      .then(function(docRef) {
        console.log("Appointment added with ID: ", docRef.id);
        sendEmailToAttendees(attendees, date, time, duration, venue, purpose)
        // Clear the form after successful submission
        form.reset();
      })
      .catch(function(error) {
        console.error("Error adding appointment: ", error);
      });
  });


  appointmentsRef.on('value', (snapshot) => {
  const appointmentsTable = document.getElementById('appointments');

  appointmentsTable.innerHTML = '';

  snapshot.forEach((appointment) => {
    const appointmentData = appointment.val();
    const appointmentKey = appointment.key;
    const appointmentRow = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = appointmentData.date;
    appointmentRow.appendChild(dateCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = appointmentData.time;
    appointmentRow.appendChild(timeCell);

    const durationCell = document.createElement('td');
    durationCell.textContent = appointmentData.duration;
    appointmentRow.appendChild(durationCell);

    const attendeesCell = document.createElement('td');
    attendeesCell.textContent = appointmentData.attendees;
    appointmentRow.appendChild(attendeesCell);

    const venueCell = document.createElement('td');
    venueCell.textContent = appointmentData.venue;
    appointmentRow.appendChild(venueCell);

    const purposeCell = document.createElement('td');
    purposeCell.textContent = appointmentData.purpose;
    appointmentRow.appendChild(purposeCell);
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function() {
      // Remove the appointment from the database
      appointmentsRef.child(appointmentKey).remove()
        .then(function() {
          sendEmailToAttendees(appointmentData.attendees, appointmentData.date, appointmentData.time, appointmentData.duration, appointmentData.venue, appointmentData.purpose, 'delete')
          console.log("Appointment deleted with ID: ", appointmentKey);
        })
        .catch(function(error) {
          console.error("Error deleting appointment: ", error);
        });

      // Remove the appointment row from the table
      appointmentsTable.removeChild(appointmentRow);
    });
    deleteCell.appendChild(deleteButton);
    appointmentRow.appendChild(deleteCell);

    appointmentsTable.appendChild(appointmentRow);
  });
});

function sendEmailToAttendees(attendees, date, time, duration, venue, purpose, type='invite') {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("Email sent to attendees.");
      }
    };
  
    var apiKey = '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';
    var url = 'https://api.sendinblue.com/v3/smtp/email';
  
    var userEmail = 'salman@tmsapp.com';
    var message = "Dear Attendee,\n\nYou are invited to an appointment on " + date + " at " + time + " for a duration of " + duration + " at " + venue + ". The purpose of the appointment is: " + purpose + ".\n\nPlease let us know if you are able to attend.\n\nThank you,\n" + userEmail;
    if(type === 'delete') {
      message = "Dear Attendee,\n\nThe appointment on " + date + " at " + time + " for a duration of " + duration + " at " + venue + " has been cancelled.\n\nThank you,\n" + userEmail;
    }
    var data = {
      "sender": {"name": "TMS APP", "email": userEmail},
      "to": [{"email": attendees}],
      "subject": "Appointment Invitation",
      "textContent": message
    };
  
    request.open("POST", url);
    request.setRequestHeader("accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("api-key", apiKey);
    request.send(JSON.stringify(data));
  }
  