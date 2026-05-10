-- VIEW 1: Student View
-- Purpose: Allows students to see their bookings, tutor details,
-- subject details, slot time, location, and booking status.

CREATE VIEW student_booking_view AS
SELECT
    b.student_id,
    b.booking_id,
    s.subject_code,
    s.name AS subject_name,
    tutor_user.first_name AS tutor_first_name,
    tutor_user.last_name AS tutor_last_name,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,
    b.booking_status,
    b.request_note
FROM BOOKING b
JOIN SUBJECT s
    ON b.subject_code = s.subject_code
JOIN TUTOR t
    ON b.tutor_id = t.user_id
JOIN USER tutor_user
    ON t.user_id = tutor_user.user_id
JOIN AVAILABILITY_SLOT a
    ON b.slot_id = a.slot_id;


-- VIEW 2: Tutor View
-- Purpose: Allows tutors to see their scheduled sessions,
-- including student details, subject, time, location, and status.

CREATE VIEW tutor_schedule_view AS
SELECT
    b.tutor_id,
    b.booking_id,
    student_user.first_name AS student_first_name,
    student_user.last_name AS student_last_name,
    s.subject_code,
    s.name AS subject_name,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,
    b.booking_status,
    b.request_note
FROM BOOKING b
JOIN STUDENT st
    ON b.student_id = st.user_id
JOIN USER student_user
    ON st.user_id = student_user.user_id
JOIN SUBJECT s
    ON b.subject_code = s.subject_code
JOIN AVAILABILITY_SLOT a
    ON b.slot_id = a.slot_id;


-- VIEW 3: Admin / DBA Booking Overview View
-- Purpose: Gives admins a full overview of bookings,
-- including student, tutor, subject, slot, payment, and review status.

CREATE VIEW admin_booking_overview_view AS
SELECT
    b.booking_id,
    b.booking_status,
    b.created_at AS booking_created_at,

    b.student_id,
    student_user.first_name AS student_first_name,
    student_user.last_name AS student_last_name,

    b.tutor_id,
    tutor_user.first_name AS tutor_first_name,
    tutor_user.last_name AS tutor_last_name,

    b.subject_code,
    s.name AS subject_name,

    a.slot_id,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,

    p.payment_id,
    p.amount,
    p.payment_status,
    p.paid_at,

    r.review_id,
    r.rating,
    r.comment
FROM BOOKING b
JOIN STUDENT st
    ON b.student_id = st.user_id
JOIN USER student_user
    ON st.user_id = student_user.user_id
JOIN TUTOR t
    ON b.tutor_id = t.user_id
JOIN USER tutor_user
    ON t.user_id = tutor_user.user_id
JOIN SUBJECT s
    ON b.subject_code = s.subject_code
JOIN AVAILABILITY_SLOT a
    ON b.slot_id = a.slot_id
LEFT JOIN PAYMENT p
    ON b.booking_id = p.booking_id
LEFT JOIN REVIEW r
    ON b.booking_id = r.booking_id;


-- VIEW 4: Tutor Performance View
-- Purpose: Helps admins or students compare tutors using
-- completed sessions, review count, average rating, and revenue.

CREATE VIEW tutor_performance_view AS
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT b.booking_id) AS total_sessions,
    COUNT(DISTINCT r.review_id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
    COALESCE(SUM(
        CASE 
            WHEN p.payment_status = 'completed' THEN p.amount
            ELSE 0
        END
    ), 0) AS total_revenue
FROM TUTOR t
JOIN USER u
    ON t.user_id = u.user_id
LEFT JOIN BOOKING b
    ON t.user_id = b.tutor_id
LEFT JOIN REVIEW r
    ON b.booking_id = r.booking_id
LEFT JOIN PAYMENT p
    ON b.booking_id = p.booking_id
GROUP BY t.user_id, u.first_name, u.last_name;


-- VIEW 5: Available Tutor Search View
-- Purpose: Allows students to search available tutors by subject,
-- time, mode, and hourly rate.

CREATE VIEW available_tutor_search_view AS
SELECT
    t.user_id AS tutor_id,
    u.first_name,
    u.last_name,
    t.hourly_rate,
    ts.subject_code,
    s.name AS subject_name,
    a.slot_id,
    a.start_time,
    a.end_time,
    a.mode,
    a.location,
    a.slot_status
FROM TUTOR t
JOIN USER u
    ON t.user_id = u.user_id
JOIN TUTOR_SUBJECT ts
    ON t.user_id = ts.tutor_id
JOIN SUBJECT s
    ON ts.subject_code = s.subject_code
JOIN AVAILABILITY_SLOT a
    ON t.user_id = a.tutor_id
WHERE a.slot_status = 'available'
  AND a.start_time > CURRENT_TIMESTAMP;

