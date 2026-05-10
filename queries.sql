-- Matador Mentor Sample Queries

-- 1. Find all available tutors for a specific subject (e.g., 'CS4354')
SELECT
    tutor_id,
    first_name,
    last_name,
    hourly_rate,
    subject_code,
    subject_name,
    slot_id,
    start_time,
    end_time,
    mode,
    location
FROM available_tutor_search_view
WHERE subject_code = 'CS4354'
ORDER BY start_time ASC;


-- 2. Aggregate tutor reviews: average rating and total reviews per tutor
SELECT
    tutor_id,
    first_name,
    last_name,
    total_reviews,
    average_rating
FROM tutor_performance_view
ORDER BY average_rating DESC, total_reviews DESC;


-- 2. Alternative: Calculate average rating and total number of reviews per tutor (using tables)
SELECT 
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    COUNT(r.review_id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
FROM TUTOR t
JOIN USER u 
    ON t.user_id = u.user_id
LEFT JOIN BOOKING b 
    ON t.user_id = b.tutor_id
LEFT JOIN REVIEW r 
    ON b.booking_id = r.booking_id
GROUP BY t.user_id, u.first_name, u.last_name
ORDER BY average_rating DESC, total_reviews DESC;


-- 3. Find a student's upcoming bookings
SELECT
    booking_id,
    subject_code,
    subject_name,
    tutor_first_name,
    tutor_last_name,
    start_time,
    end_time,
    mode,
    location,
    booking_status
FROM student_booking_view
WHERE student_id = 151
  AND start_time > CURRENT_TIMESTAMP
  AND booking_status IN ('confirmed', 'pending')
ORDER BY start_time ASC;


-- 4. Calculate total revenue generated from completed bookings with completed payments
SELECT
    COALESCE(SUM(amount), 0) AS total_revenue
FROM admin_booking_overview_view
WHERE payment_status = 'completed'
  AND booking_status = 'completed';


-- 5. Concurrency Control Demonstration: Lock an availability slot for booking
START TRANSACTION;

-- Lock the selected slot so no other transaction can book it at the same time
SELECT 
    slot_id, 
    slot_status
FROM AVAILABILITY_SLOT
WHERE slot_id = 5
FOR UPDATE;

-- Only book the slot if it is still available
UPDATE AVAILABILITY_SLOT
SET slot_status = 'booked'
WHERE slot_id = 5
AND slot_status = 'available';

-- Insert the booking only after the slot is successfully marked as booked
-- Replace the sample values with actual application values
INSERT INTO BOOKING (
    student_id,
    tutor_id,
    subject_code,
    slot_id,
    booking_status,
    request_note
)
VALUES (
    151,
    22,
    'CS4354',
    5,
    'pending',
    'Student requested help with database design.'
);


-- 6. List all subjects offered by each tutor
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    s.subject_code,
    s.name AS subject_name
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
JOIN TUTOR_SUBJECT ts ON t.user_id = ts.tutor_id
JOIN SUBJECT s ON ts.subject_code = s.subject_code
ORDER BY u.last_name, u.first_name, s.subject_code;


-- 6 Alternative: List subjects offered by tutors who currently have available slots
SELECT DISTINCT
    tutor_id,
    first_name,
    last_name,
    subject_code,
    subject_name
FROM available_tutor_search_view
ORDER BY last_name, first_name, subject_code;


-- 7. Find tutors who have no upcoming available slots
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name
FROM TUTOR t
JOIN USER u
    ON t.user_id = u.user_id
LEFT JOIN available_tutor_search_view av
    ON t.user_id = av.tutor_id
WHERE av.slot_id IS NULL
ORDER BY u.last_name, u.first_name;


-- 8. Count bookings by status for each student
SELECT
    student_id,
    booking_status,
    COUNT(booking_id) AS total_bookings
FROM student_booking_view
GROUP BY student_id, booking_status
ORDER BY student_id, booking_status;


-- 8 Alternative: Count bookings by status for each student with names
SELECT
    st.user_id AS student_id,
    u.first_name,
    u.last_name,
    b.booking_status,
    COUNT(b.booking_id) AS total_bookings
FROM STUDENT st
JOIN USER u 
    ON st.user_id = u.user_id
LEFT JOIN BOOKING b 
    ON st.user_id = b.student_id
GROUP BY st.user_id, u.first_name, u.last_name, b.booking_status
ORDER BY st.user_id, b.booking_status;


-- 9. Rank tutors by total completed revenue
SELECT
    tutor_id,
    first_name,
    last_name,
    total_sessions,
    total_reviews,
    average_rating,
    total_revenue,
    RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank
FROM tutor_performance_view
ORDER BY revenue_rank;


-- 10. Find the most popular subjects based on booking activity
SELECT
    subject_code,
    subject_name,
    COUNT(booking_id) AS total_bookings,
    COUNT(DISTINCT student_id) AS unique_students,
    ROUND(AVG(amount), 2) AS avg_payment_amount
FROM admin_booking_overview_view
GROUP BY subject_code, subject_name
ORDER BY total_bookings DESC, unique_students DESC;


-- 10 Alternative: Most popular subjects based on completed paid sessions
SELECT
    subject_code,
    subject_name,
    COUNT(booking_id) AS completed_bookings,
    COUNT(DISTINCT student_id) AS unique_students,
    ROUND(AVG(amount), 2) AS avg_payment_amount
FROM admin_booking_overview_view
WHERE booking_status = 'completed'
  AND payment_status = 'completed'
GROUP BY subject_code, subject_name
ORDER BY completed_bookings DESC, unique_students DESC;

COMMIT;
