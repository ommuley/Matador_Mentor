import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker()

NUM_USERS = 200
NUM_TUTORS = 50
NUM_STUDENTS = 150
NUM_SLOTS_PER_TUTOR = 5
NUM_BOOKINGS = 100

def generate_seed_data():
    with open('seed.sql', 'w') as f:
        f.write("-- Matador Mentor Synthetic Data Generation\n\n")

        # GENERATE USERS
        f.write("-- USERS\n")
        f.write("INSERT INTO USER (user_id, first_name, last_name, email, status, created_at) VALUES\n")
        users = []
        for i in range(1, NUM_USERS + 1):
            first_name = fake.first_name()
            last_name = fake.last_name()
            # Adding some TTU specific emails
            if random.random() > 0.5:
                email = f"{first_name.lower()}.{last_name.lower()}@ttu.edu"
            else:
                email = fake.unique.email()
            created_at = fake.date_time_between(start_date='-1y', end_date='now').strftime('%Y-%m-%d %H:%M:%S')
            status = random.choice(['active', 'active', 'active', 'suspended'])
            users.append(f"({i}, '{first_name}', '{last_name}', '{email}', '{status}', '{created_at}')")
        
        f.write(",\n".join(users) + ";\n\n")

        # SPLIT USERS INTO TUTORS AND STUDENTS
        tutor_ids = list(range(1, NUM_TUTORS + 1))
        student_ids = list(range(NUM_TUTORS + 1, NUM_USERS + 1))

        # GENERATE TUTORS
        f.write("-- TUTORS\n")
        f.write("INSERT INTO TUTOR (user_id, hourly_rate, meeting_mode, background_check_status) VALUES\n")
        tutors = []
        modes = ['online', 'in-person', 'hybrid']
        for t_id in tutor_ids:
            rate = round(random.uniform(15.0, 50.0), 2)
            mode = random.choice(modes)
            bg_status = random.choice(['cleared', 'cleared', 'pending'])
            tutors.append(f"({t_id}, {rate}, '{mode}', '{bg_status}')")
        f.write(",\n".join(tutors) + ";\n\n")

        # GENERATE STUDENTS
        f.write("-- STUDENTS\n")
        f.write("INSERT INTO STUDENT (user_id, major, grad_year) VALUES\n")
        students = []
        majors = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Mathematics', 'Physics', 'Biology']
        for s_id in student_ids:
            major = random.choice(majors)
            grad_year = random.randint(2024, 2028)
            students.append(f"({s_id}, '{major}', {grad_year})")
        f.write(",\n".join(students) + ";\n\n")

        # GENERATE SUBJECTS (including localized TTU courses)
        f.write("-- SUBJECTS\n")
        f.write("INSERT INTO SUBJECT (subject_code, name, level) VALUES\n")
        subjects_data = [
            ("CS4354", "Concepts of Database Systems", "Undergraduate"),
            ("CS3364", "Design and Analysis of Algorithms", "Undergraduate"),
            ("CS4352", "Operating Systems", "Undergraduate"),
            ("CS1411", "Programming Principles I", "Undergraduate"),
            ("CS1412", "Programming Principles II", "Undergraduate"),
            ("MATH2450", "Calculus III", "Undergraduate"),
            ("PHYS1408", "Principles of Physics I", "Undergraduate")
        ]
        subjects = [f"('{code}', '{name}', '{level}')" for code, name, level in subjects_data]
        f.write(",\n".join(subjects) + ";\n\n")

        # GENERATE TUTOR_SUBJECT (Qualifications)
        f.write("-- TUTOR_SUBJECT\n")
        f.write("INSERT INTO TUTOR_SUBJECT (tutor_id, subject_code) VALUES\n")
        tutor_subjects = []
        tutor_subject_map = {} # to keep track for bookings
        subject_codes = [s[0] for s in subjects_data]
        for t_id in tutor_ids:
            # Each tutor teaches 1 to 3 subjects
            num_subjects = random.randint(1, 3)
            taught_subjects = random.sample(subject_codes, num_subjects)
            tutor_subject_map[t_id] = taught_subjects
            for sub in taught_subjects:
                tutor_subjects.append(f"({t_id}, '{sub}')")
        f.write(",\n".join(tutor_subjects) + ";\n\n")

        # GENERATE AVAILABILITY_SLOT
        f.write("-- AVAILABILITY_SLOT\n")
        f.write("INSERT INTO AVAILABILITY_SLOT (slot_id, tutor_id, start_time, end_time, mode, location, slot_status) VALUES\n")
        slots = []
        slot_id = 1
        available_slots = []
        for t_id in tutor_ids:
            for _ in range(NUM_SLOTS_PER_TUTOR):
                # Random time next week
                start_time = datetime.now() + timedelta(days=random.randint(1, 14), hours=random.randint(8, 18))
                start_time = start_time.replace(minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=1)
                
                mode = random.choice(['online', 'in-person'])
                location = "Zoom" if mode == 'online' else random.choice(["TTU Library", "Holden Hall", "SUB"])
                
                slots.append(f"({slot_id}, {t_id}, '{start_time.strftime('%Y-%m-%d %H:%M:%S')}', '{end_time.strftime('%Y-%m-%d %H:%M:%S')}', '{mode}', '{location}', 'available')")
                available_slots.append((slot_id, t_id))
                slot_id += 1
        f.write(",\n".join(slots) + ";\n\n")

        # GENERATE BOOKINGS
        f.write("-- BOOKINGS\n")
        f.write("INSERT INTO BOOKING (booking_id, student_id, tutor_id, subject_code, slot_id, booking_status, request_note, created_at) VALUES\n")
        bookings = []
        payments = []
        reviews = []
        
        # We will pick a random subset of slots to be booked
        num_bookings = min(NUM_BOOKINGS, len(available_slots))
        booked_slots_info = random.sample(available_slots, num_bookings)
        
        booking_id = 1
        payment_id = 1
        review_id = 1

        for sl_id, t_id in booked_slots_info:
            s_id = random.choice(student_ids)
            subject_code = random.choice(tutor_subject_map[t_id])
            status = random.choice(['confirmed', 'completed', 'completed', 'canceled'])
            note = random.choice([fake.sentence(), ""])
            created_at = fake.date_time_between(start_date='-1m', end_date='now').strftime('%Y-%m-%d %H:%M:%S')
            
            bookings.append(f"({booking_id}, {s_id}, {t_id}, '{subject_code}', {sl_id}, '{status}', '{note}', '{created_at}')")
            
            # PAYMENT
            if status in ['confirmed', 'completed']:
                amount = round(random.uniform(15.0, 50.0), 2)
                method = random.choice(['Credit Card', 'PayPal', 'Venmo'])
                paid_at = (datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S') + timedelta(hours=random.randint(1,24))).strftime('%Y-%m-%d %H:%M:%S')
                payments.append(f"({payment_id}, {booking_id}, {amount}, '{method}', 'completed', '{paid_at}')")
                payment_id += 1

                # REVIEW
                if status == 'completed' and random.random() > 0.3: # 70% chance of review if completed
                    rating = random.randint(3, 5) if random.random() > 0.2 else random.randint(1, 3)
                    comment = fake.sentence() if rating > 3 else "Could have been better."
                    review_created_at = (datetime.strptime(paid_at, '%Y-%m-%d %H:%M:%S') + timedelta(days=random.randint(1,3))).strftime('%Y-%m-%d %H:%M:%S')
                    reviews.append(f"({review_id}, {booking_id}, {rating}, '{comment}', '{review_created_at}')")
                    review_id += 1
            
            booking_id += 1
        
        f.write(",\n".join(bookings) + ";\n\n")

        # Write PAYMENTS
        if payments:
            f.write("-- PAYMENTS\n")
            f.write("INSERT INTO PAYMENT (payment_id, booking_id, amount, method, payment_status, paid_at) VALUES\n")
            f.write(",\n".join(payments) + ";\n\n")

        # Write REVIEWS
        if reviews:
            f.write("-- REVIEWS\n")
            f.write("INSERT INTO REVIEW (review_id, booking_id, rating, comment, created_at) VALUES\n")
            f.write(",\n".join(reviews) + ";\n\n")

        print("Successfully generated seed.sql with Matador Mentor synthetic data.")

if __name__ == "__main__":
    generate_seed_data()
