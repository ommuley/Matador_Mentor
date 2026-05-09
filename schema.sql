-- Matador Mentor Database Schema
-- SQL Dialect: MySQL / PostgreSQL Compatible (Mostly standard SQL)

CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TUTOR (
    user_id INT PRIMARY KEY,
    hourly_rate DECIMAL(8,2) NOT NULL,
    meeting_mode VARCHAR(20) NOT NULL,
    background_check_status VARCHAR(30) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

CREATE TABLE STUDENT (
    user_id INT PRIMARY KEY,
    major VARCHAR(100),
    grad_year SMALLINT,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

CREATE TABLE SUBJECT (
    subject_code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(20)
);

CREATE TABLE TUTOR_SUBJECT (
    tutor_id INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    PRIMARY KEY (tutor_id, subject_code),
    FOREIGN KEY (tutor_id) REFERENCES TUTOR(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES SUBJECT(subject_code) ON DELETE CASCADE
);

CREATE TABLE AVAILABILITY_SLOT (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    mode VARCHAR(20) NOT NULL,
    location VARCHAR(150),
    slot_status VARCHAR(20) NOT NULL DEFAULT 'available',
    FOREIGN KEY (tutor_id) REFERENCES TUTOR(user_id) ON DELETE CASCADE
);

CREATE TABLE BOOKING (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    slot_id INT NOT NULL UNIQUE,
    booking_status VARCHAR(20) NOT NULL,
    request_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES STUDENT(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id, subject_code) REFERENCES TUTOR_SUBJECT(tutor_id, subject_code) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES AVAILABILITY_SLOT(slot_id) ON DELETE CASCADE
);

CREATE TABLE PAYMENT (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES BOOKING(booking_id) ON DELETE CASCADE
);

CREATE TABLE REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES BOOKING(booking_id) ON DELETE CASCADE
);
