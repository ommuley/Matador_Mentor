-- Matador Mentor Sample Queries

-- 1. Find all available tutors for a specific subject (e.g., 'CS4354')
SELECT 
    t.user_id,
    u.first_name, 
    u.last_name, 
    t.hourly_rate, 
    a.start_time, 
    a.end_time, 
    a.mode
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
JOIN TUTOR_SUBJECT ts ON t.user_id = ts.tutor_id
JOIN AVAILABILITY_SLOT a ON t.user_id = a.tutor_id
WHERE ts.subject_code = 'CS4354' 
  AND a.slot_status = 'available'
  AND a.start_time > CURRENT_TIMESTAMP
ORDER BY a.start_time ASC;


-- 2. Aggregate tutor reviews: Calculate average rating and total number of reviews per tutor
SELECT 
    t.user_id,
    u.first_name,
    u.last_name,
    COUNT(r.review_id) AS total_reviews,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM TUTOR t
JOIN USER u ON t.user_id = u.user_id
LEFT JOIN BOOKING b ON t.user_id = b.tutor_id
LEFT JOIN REVIEW r ON b.booking_id = r.booking_id
GROUP BY t.user_id, u.first_name, u.last_name
ORDER BY average_rating DESC, total_reviews DESC;


-- 3. Find a student's upcoming bookings
SELECT 
    b.booking_id,
    s.subject_code,
    s.name AS subject_name,
    u_tutor.first_name AS tutor_first_name,
    u_tutor.last_name AS tutor_last_name,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,
    b.booking_status
FROM BOOKING b
JOIN SUBJECT s ON b.subject_code = s.subject_code
JOIN TUTOR t ON b.tutor_id = t.user_id
JOIN USER u_tutor ON t.user_id = u_tutor.user_id
JOIN AVAILABILITY_SLOT a ON b.slot_id = a.slot_id
WHERE b.student_id = 151  -- Replace with specific student ID
  AND a.start_time > CURRENT_TIMESTAMP
  AND b.booking_status IN ('confirmed', 'pending')
ORDER BY a.start_time ASC;


-- 4. Calculate total revenue generated from completed sessions
SELECT 
    SUM(p.amount) AS total_revenue
FROM PAYMENT p
WHERE p.payment_status = 'completed';


-- 5. Concurrency Control Demonstration: Lock an availability slot for booking
-- (This would typically be executed within a transaction block in the application backend)
START TRANSACTION;

SELECT slot_id, slot_status 
FROM AVAILABILITY_SLOT 
WHERE slot_id = 5 FOR UPDATE; -- Acquires an exclusive lock to prevent double booking

-- Assume application logic checks if slot is available here
-- UPDATE AVAILABILITY_SLOT SET slot_status = 'booked' WHERE slot_id = 5;
-- INSERT INTO BOOKING (...) VALUES (...);

COMMIT;
