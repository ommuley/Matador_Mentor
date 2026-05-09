# Matador Mentor — Project Execution Guide

This document explains how to set up, populate, and run all components of the Matador Mentor database project, including the database, the synthetic data, and the web interface.

## 1. Generating the Synthetic Data

We use a Python script with the `Faker` library to generate hundreds of realistic users, tutors, subjects, availability slots, and bookings.

**Prerequisites:**
You need Python installed along with the `faker` package.
```bash
# Install the required library
pip install faker
```

**Running the generator:**
```bash
# Run the data generation script
python generate_data.py
```
*Expected Output:* The script will output "Successfully generated seed.sql with Matador Mentor synthetic data." and you will see a new file called `seed.sql` in your project folder.

---

## 2. Setting Up the Database

The project is designed for MySQL (or PostgreSQL with minor tweaks). You will need a database environment (like MySQL Workbench, phpMyAdmin, or the MySQL CLI) to run the SQL scripts.

1. **Create the Schema:**
   Open your SQL client and run the contents of `schema.sql`. This will create all the necessary tables (`USER`, `TUTOR`, `STUDENT`, `SUBJECT`, `BOOKING`, etc.) with their respective primary and foreign key constraints.

2. **Populate the Data:**
   Run the `seed.sql` file that was generated in Step 1. This file contains hundreds of `INSERT INTO` statements that will populate your tables with synthetic data.

---

## 3. Running and Testing Queries

Once your database is set up and populated, you can test the functionality of the system using `queries.sql`.

Open `queries.sql` in your SQL client. It contains 5 specific queries corresponding to the project requirements:
- **Query 1:** Find available tutors for a specific subject (e.g., CS4354).
- **Query 2:** Aggregate tutor reviews (Average rating & Total reviews).
- **Query 3:** Find a specific student's upcoming bookings.
- **Query 4:** Calculate total system revenue.
- **Query 5:** Concurrency Control Demonstration (START TRANSACTION / FOR UPDATE).

*Note:* For Query 3 and Query 5, you may need to update the `student_id` or `slot_id` to match the generated data in your database.

---

## 4. Launching the Web Interface

The project includes a fully built, responsive frontend interface that acts as the "Dashboard" for Matador Mentor. It does not require a local server or backend to view the frontend design!

**How to open it:**
1. Navigate to your project folder.
2. Double-click the `index.html` file to open it directly in your web browser (Chrome, Safari, Edge, Firefox).

**Features to test in the Interface:**
- **Navigation:** Click the buttons on the left sidebar to switch between Dashboard, Find Tutor, Bookings, Payments, Reviews, and Admin views.
- **Role Switcher:** On the Dashboard, click between **Student**, **Tutor**, and **Admin**. Notice how the sidebar navigation adapts, and the statistics at the top of the dashboard dynamically change to match the role's perspective.
- **Concurrency Demo:** Go to the "Admin" tab. At the top, there is a "Concurrency Control Demo". Enter a slot ID and click "Acquire Lock" to see a live simulation of Query 5 running in a terminal.
- **Booking Modal:** Go to the "Find Tutor" tab and click on any tutor card to see the booking overlay.
- **SQL Previews:** Click "View Generated SQL Query" on any page to see the exact SQL from `queries.sql` that powers that specific view.
