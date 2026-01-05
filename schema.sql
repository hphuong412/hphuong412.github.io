-- ================================================================
-- FPT KNOWLEDGE MANAGEMENT SYSTEM - WITH REAL PASSWORD HASHES
-- Import vào XAMPP phpMyAdmin
-- ================================================================

-- Xóa database cũ (nếu có)
DROP DATABASE IF EXISTS fpt_knowledge_db;

-- Tạo database mới
CREATE DATABASE fpt_knowledge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Chọn database
USE fpt_knowledge_db;

-- ================================================================
-- BẢNG 1: department (Phòng ban)
-- ================================================================
CREATE TABLE department (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO department (department_name) VALUES 
('IT Department'),
('Student Affairs'),
('Human Resources'),
('Academic Department');

-- ================================================================
-- BẢNG 2: role (Vai trò)
-- ================================================================
CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO role (role_name, description) VALUES 
('admin', 'System Administrator'),
('user', 'Regular User'),
('staff', 'Staff Member');

-- ================================================================
-- BẢNG 3: user (Người dùng) - WITH REAL HASHES!
-- ================================================================
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT DEFAULT 2,
    department_id INT,
    employee_id VARCHAR(50),
    position VARCHAR(100),
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert users with REAL password hashes
-- Password for admin: admin123 
-- Password for user: user123
INSERT INTO user (username, password, email, full_name, phone, role_id, department_id, employee_id, position, is_active) VALUES
('admin', '$2b$10$SCCOCOaps3egjbvefq/hsOIzkoh3SJcqH4TPoKBwCBEKP1Gp81VNe', 'admin@fpt.edu.vn', 'Admin User', '0901234567', 1, 1, 'EMP001', 'System Administrator', TRUE),
('user', '$2b$10$TPYKOAslceO8ebq8bPefXusGIxvtiNWVAX9ovJHq7EYtPJymzZZuO', 'user@fpt.edu.vn', 'Regular User', '0901234568', 2, 2, 'EMP002', 'Student', TRUE);

-- ================================================================
-- BẢNG 4: course (Khóa học)
-- ================================================================
CREATE TABLE course (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(100),
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO course (course_code, course_name, description, created_by, status, category, author, start_date) VALUES
('REACT101', 'Introduction to React', 'Learn the basics of React and modern web development', 1, 'active', 'Web Development', 'John Doe', '2024-01-15'),
('JS201', 'Advanced JavaScript', 'Deep dive into JavaScript ES6+ features', 1, 'active', 'Programming', 'Jane Smith', '2024-02-01');

-- ================================================================
-- BẢNG 5: course_content (Nội dung khóa học)
-- ================================================================
CREATE TABLE course_content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    content_title VARCHAR(200) NOT NULL,
    content_type VARCHAR(50) DEFAULT 'video',
    content_description TEXT,
    content_text TEXT,
    file_url TEXT,
    video_url TEXT,
    duration VARCHAR(20),
    order_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO course_content (course_id, content_title, content_description, content_type, duration, order_number) VALUES
(1, 'Getting Started', 'Introduction to React basics', 'video', '10:30', 1),
(1, 'JSX Basics', 'Understanding JSX syntax', 'video', '15:45', 2),
(2, 'Arrow Functions', 'Learn arrow function syntax', 'video', '12:20', 1),
(2, 'Async/Await', 'Mastering async programming', 'video', '18:30', 2);

-- ================================================================
-- BẢNG 6: enrollment (Đăng ký khóa học)
-- ================================================================
CREATE TABLE enrollment (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    completion_date DATETIME NULL,
    status VARCHAR(20) DEFAULT 'enrolled',
    completed_chapters JSON,
    progress INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO enrollment (user_id, course_id, completed_chapters, progress) VALUES
(2, 1, '[1]', 50),
(2, 2, '[]', 0);

-- ================================================================
-- BẢNG 7: document (Tài liệu)
-- ================================================================
CREATE TABLE document (
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    document_name VARCHAR(200) NOT NULL,
    description TEXT,
    content LONGTEXT,
    category VARCHAR(100),
    image TEXT,
    file_path TEXT,
    created_by INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO document (document_name, description, content, category, created_by, status) VALUES
('React Best Practices 2024', 'Comprehensive guide to React development', 'This document covers modern React patterns including hooks, context, and performance optimization...', 'Web Development', 2, 'approved'),
('JavaScript ES2024 Features', 'Latest JavaScript features and updates', 'Explore the newest additions to JavaScript including new array methods, improved async handling...', 'Programming', 2, 'approved'),
('Machine Learning Fundamentals', 'Introduction to ML concepts', 'Comprehensive guide to ML basics covering supervised learning, neural networks, and practical applications...', 'AI & ML', 2, 'pending');

-- ================================================================
-- BẢNG 8: tag (Tags)
-- ================================================================
CREATE TABLE tag (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    name_tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES document(document_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag (document_id, name_tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tag (document_id, name_tag) VALUES 
(1, 'React'),
(1, 'JavaScript'),
(1, 'Frontend'),
(2, 'JavaScript'),
(2, 'ES6'),
(3, 'AI'),
(3, 'Machine Learning');

-- ================================================================
-- BẢNG 9: comment (Comments)
-- ================================================================
CREATE TABLE comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    content_text TEXT NOT NULL,
    parent_comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES document(document_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO comment (document_id, user_id, content_text) VALUES
(1, 1, 'Great article! Very helpful for beginners.'),
(1, 2, 'Thanks for sharing this resource!'),
(2, 2, 'Looking forward to trying these new features.');
-- ================================================================
-- BẢNG 9: feedback)
-- ================================================================
CREATE TABLE feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  chapter_id INT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  rating INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_role ON user(role_id);
CREATE INDEX idx_course_status ON course(status);
CREATE INDEX idx_course_category ON course(category);
CREATE INDEX idx_document_status ON document(status);
CREATE INDEX idx_document_category ON document(category);
CREATE INDEX idx_document_created_by ON document(created_by);
CREATE INDEX idx_enrollment_user ON enrollment(user_id);
CREATE INDEX idx_enrollment_course ON enrollment(course_id);
CREATE INDEX idx_comment_document ON comment(document_id);
CREATE INDEX idx_comment_user ON comment(user_id);

-- ================================================================
-- VIEWS FOR EASY QUERYING
-- ================================================================

-- View: Users with role names
CREATE VIEW v_users_with_roles AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.full_name,
    u.phone,
    u.employee_id,
    u.position,
    u.is_active,
    r.role_name,
    d.department_name,
    u.created_at
FROM user u
LEFT JOIN role r ON u.role_id = r.role_id
LEFT JOIN department d ON u.department_id = d.department_id;

-- View: Courses with author info
CREATE VIEW v_courses_full AS
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    c.description,
    c.category,
    c.status,
    c.start_date,
    c.end_date,
    c.author,
    u.full_name as created_by_name,
    u.email as author_email,
    c.created_at,
    (SELECT COUNT(*) FROM course_content WHERE course_id = c.course_id) as chapter_count,
    (SELECT COUNT(*) FROM enrollment WHERE course_id = c.course_id) as enrollment_count
FROM course c
LEFT JOIN user u ON c.created_by = u.user_id;

-- View: Documents with author info
CREATE VIEW v_documents_full AS
SELECT 
    d.document_id,
    d.document_name,
    d.description,
    d.content,
    d.category,
    d.status,
    d.created_at,
    d.updated_at,
    u.full_name as author_name,
    u.email as author_email,
    u.user_id as created_by,
    approver.full_name as approved_by_name,
    d.approved_at
FROM document d
LEFT JOIN user u ON d.created_by = u.user_id
LEFT JOIN user approver ON d.approved_by = approver.user_id;

-- ================================================================
-- HOÀN THÀNH!
-- ================================================================
SELECT 'Database setup completed successfully!' as Message;
SELECT 'Users created:' as Info;
SELECT username, full_name, role_name FROM v_users_with_roles;