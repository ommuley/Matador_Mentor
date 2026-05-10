# Matador Mentor — Project Execution Guide

This document explains how to set up, populate, and run the Matador Mentor database project, including the database schema, synthetic data, SQL views, queries, and web interface.

---

## 1. Generating the Synthetic Data

We use a Python script with the `Faker` library to generate realistic users, tutors, students, subjects, availability slots, bookings, payments, and reviews.

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

*Expected Output:* The script will output `"Successfully generated seed.sql with Matador Mentor synthetic data."` and create a new file called `seed.sql` in your project folder.

---

## 2. Setting Up the Database

The project is designed for MySQL. PostgreSQL may require minor syntax changes, especially for `AUTO_INCREMENT`.

Use a database environment such as MySQL Workbench, phpMyAdmin, or the MySQL CLI.

**Recommended execution order:**

1. Run `schema.sql`
2. Run `seed.sql`
3. Run `views.sql`
4. Run `queries.sql`

### 1. Create the Schema

Open your SQL client and run the contents of `schema.sql`. This creates the main tables:

* `USER`
* `TUTOR`
* `STUDENT`
* `SUBJECT`
* `TUTOR_SUBJECT`
* `AVAILABILITY_SLOT`
* `BOOKING`
* `PAYMENT`
* `REVIEW`

The schema includes primary keys, foreign keys, unique constraints, and referential integrity rules.

### 2. Populate the Data

Run the generated `seed.sql` file. This file contains the `INSERT INTO` statements needed to populate the database with synthetic sample data.

### 3. Create SQL Views

Run `views.sql` after creating and populating the tables. The project includes role-based views for different users:

* **Student View:** `student_booking_view` shows student bookings, tutor details, subject details, slot times, locations, and booking status.
* **Tutor View:** `tutor_schedule_view` shows tutor schedules with student, subject, time, location, and booking details.
* **Admin View:** `admin_booking_overview_view` gives admins a full overview of bookings, payments, and reviews.
* **Tutor Performance View:** `tutor_performance_view` summarizes sessions, reviews, ratings, and revenue.
* **Available Tutor Search View:** `available_tutor_search_view` allows students to search available tutors by subject, time, mode, and hourly rate.

---

## 3. Running and Testing Queries

Once the database is set up, populated, and the views are created, open `queries.sql` in your SQL client.

The file contains **10 total queries**:

* **Query 1:** Find available tutors for a specific subject, such as `CS4354`.
  Uses `available_tutor_search_view`.

* **Query 2:** Aggregate tutor reviews by calculating average rating and total reviews.
  Uses `tutor_performance_view`.

* **Query 3:** Find a specific student’s upcoming bookings.
  Uses `student_booking_view`.

* **Query 4:** Calculate total system revenue from completed bookings and completed payments.
  Uses `admin_booking_overview_view`.

* **Query 5:** Demonstrate concurrency control using `START TRANSACTION` and `FOR UPDATE`.
  Uses the base tables because row locking must be performed directly on the underlying tables.

*Note:* For Query 3 and Query 5, you may need to update the `student_id`, `slot_id`, `tutor_id`, or `subject_code` to match the generated data in your database.

* **Query 6:** List all subjects offered by each tutor.
* **Query 7:** Find tutors who have no upcoming available slots.
* **Query 8:** Count bookings by status for each student.
* **Query 9:** Rank tutors by total completed revenue.
* **Query 10:** Find the most popular subjects based on booking activity.

These queries demonstrate joins, views, aggregation, grouping, ranking, and transaction-based concurrency control.

---

## 4. Launching the Web Interface

The project includes a responsive frontend interface that acts as the Matador Mentor dashboard. It can be viewed directly in a browser.

**How to open it:**

1. Navigate to your project folder.
2. Double-click `index.html`.
3. Open it in Chrome, Safari, Edge, or Firefox.

**Features to test in the interface:**

* **Navigation:** Use the sidebar to switch between Dashboard, Find Tutor, Bookings, Payments, Reviews, and Admin views.
* **Role Switcher:** Switch between **Student**, **Tutor**, and **Admin** to see how the dashboard changes by role.
* **Concurrency Demo:** In the Admin tab, enter a slot ID and click **Acquire Lock** to simulate the concurrency control query.
* **Booking Modal:** In the Find Tutor tab, click a tutor card to view the booking overlay.
* **SQL Previews:** Click **View Generated SQL Query** to see the SQL query powering that page.

---

## 5. Recommended File Structure

```text
MatadorMentor/
│
├── schema.sql
├── seed.sql
├── views.sql
├── queries.sql
├── generate_data.py
├── README.md
└── web_interface/
    ├── index.html
    ├── templates/
    └── static/
```

---

## 6. Troubleshooting Notes

If you receive an error with the `USER` table name, wrap it in backticks:

```sql
SELECT * FROM `USER`;
```

If Query 3 returns no results, update the `student_id` to a valid student from the generated data.

If Query 5 fails because of foreign key constraints, make sure the selected `student_id`, `tutor_id`, `subject_code`, and `slot_id` exist and form a valid booking combination.

If a view fails to create, make sure all base tables were created before running `views.sql`.

If a query returns empty results, check whether the generated data contains matching statuses such as `available`, `pending`, `confirmed`, or `completed`.

---

## 7. Project Summary

Matador Mentor is a tutoring marketplace database that connects students with qualified tutors. The project demonstrates EER-to-relational mapping, specialization, bridge tables, primary and foreign keys, unique constraints, role-based views, joins, aggregation, ranking, and transaction-based concurrency control.

