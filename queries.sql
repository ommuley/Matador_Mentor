-- Matador Mentor Sample Queries

-- 1. Find all available tutors for a specific subject (e.g., 'CS4354')
SELECT 
    t.user_id AS tutor_id,
    u.first_name, 
    u.last_name, 
    t.hourly_rate, 
    a.slot_id,
    a.start_time, 
    a.end_time, 
    a.mode,
    a.location
FROM TUTOR t
JOIN `USER` u 
    ON t.user_id = u.user_id
JOIN TUTOR_SUBJECT ts 
    ON t.user_id = ts.tutor_id
JOIN AVAILABILITY_SLOT a 
    ON t.user_id = a.tutor_id
WHERE ts.subject_code = 'CS4354'
  AND a.slot_status = 'available'
  AND a.start_time > CURRENT_TIMESTAMP
ORDER BY a.start_time ASC;


-- 2. Aggregate tutor reviews: average rating and total reviews per tutor
SELECT 
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    COUNT(r.review_id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating
FROM TUTOR t
JOIN `USER` u 
    ON t.user_id = u.user_id
LEFT JOIN BOOKING b 
    ON t.user_id = b.tutor_id
LEFT JOIN REVIEW r 
    ON b.booking_id = r.booking_id
GROUP BY t.user_id, u.first_name, u.last_name
ORDER BY average_rating DESC, total_reviews DESC;


-- 3. Find a student's upcoming bookings
SELECT 
    b.booking_id,
    s.subject_code,
    s.name AS subject_name,
    tutor_user.first_name AS tutor_first_name,
    tutor_user.last_name AS tutor_last_name,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,
    b.booking_status
FROM BOOKING b
JOIN SUBJECT s 
    ON b.subject_code = s.subject_code
JOIN TUTOR t 
    ON b.tutor_id = t.user_id
JOIN `USER` tutor_user 
    ON t.user_id = tutor_user.user_id
JOIN AVAILABILITY_SLOT a 
    ON b.slot_id = a.slot_id
WHERE b.student_id = 151
  AND a.start_time > CURRENT_TIMESTAMP
  AND b.booking_status IN ('confirmed', 'pending')
ORDER BY a.start_time ASC;


-- 4. Calculate total revenue generated from completed bookings with completed payments
SELECT 
    COALESCE(SUM(p.amount), 0) AS total_revenue
FROM PAYMENT p
JOIN BOOKING b 
    ON p.booking_id = b.booking_id
WHERE p.payment_status = 'completed'
  AND b.booking_status = 'completed';


-- 5. Concurrency Control Demonstration: Lock an availability slot for booking
-- (This would typically be executed within a transaction block in the application backend)
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


-- 7. Find tutors who have no upcoming available slots
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
LEFT JOIN AVAILABILITY_SLOT a
    ON t.user_id = a.tutor_id
    AND a.slot_status = 'available'
    AND a.start_time > CURRENT_TIMESTAMP
WHERE a.slot_id IS NULL
ORDER BY u.last_name, u.first_name;


-- 8. Count bookings by status for each student
SELECT
    s.user_id AS student_id,
    u.first_name,
    u.last_name,
    b.booking_status,
    COUNT(b.booking_id) AS total_bookings
FROM STUDENT s
JOIN USER u ON s.user_id = u.user_id
LEFT JOIN BOOKING b ON s.user_id = b.student_id
GROUP BY s.user_id, u.first_name, u.last_name, b.booking_status
ORDER BY s.user_id, b.booking_status;


-- 9. Rank tutors by total completed revenue
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT b.booking_id) AS completed_sessions,
    COALESCE(SUM(p.amount), 0) AS total_revenue,
    RANK() OVER (ORDER BY COALESCE(SUM(p.amount), 0) DESC) AS revenue_rank
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
LEFT JOIN BOOKING b 
    ON t.user_id = b.tutor_id
    AND b.booking_status = 'completed'
LEFT JOIN PAYMENT p 
    ON b.booking_id = p.booking_id
    AND p.payment_status = 'completed'
GROUP BY t.user_id, u.first_name, u.last_name
ORDER BY revenue_rank;


-- 10. Find the most popular subjects based on number of bookings
SELECT
    s.subject_code,
    s.name AS subject_name,
    COUNT(b.booking_id) AS total_bookings,
    COUNT(DISTINCT b.student_id) AS unique_students,
    ROUND(AVG(p.amount), 2) AS avg_payment_amount
FROM SUBJECT s
LEFT JOIN BOOKING b ON s.subject_code = b.subject_code
LEFT JOIN PAYMENT p 
    ON b.booking_id = p.booking_id
    AND p.payment_status = 'completed'
GROUP BY s.subject_code, s.name
ORDER BY total_bookings DESC, unique_students DESC;

COMMIT;
