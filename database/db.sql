-- Create a database
CREATE DATABASE IF NOT EXISTS  docapt;

-- Create the admin table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY ,
    username VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password VARCHAR(240) NOT NULL,
    isAdmin VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(200) NOT NULL,
  password VARCHAR(300) NOT NULL,
  date VARCHAR(100) DEFAULT NULL,
  fix_email VARCHAR(200) NOT NULL,
  username VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(100) DEFAULT NULL,
  company_name VARCHAR(100) DEFAULT NULL,
  isValid BOOLEAN DEFAULT false,
  facebook_link VARCHAR(1000) DEFAULT NULL,
  google_link VARCHAR(1000) DEFAULT NULL,
  temporaray_lock VARCHAR(100) DEFAULT NULL,
  isTemporaryLock BOOLEAN DEFAULT false,
  degree VARCHAR(300) DEFAULT NULL,
  uniqueId VARCHAR(200),
  active_time VARCHAR(200) DEFAULT NULL,
  email_message VARCHAR(600) DEFAULT NULL,
  sms_message VARCHAR(600) DEFAULT NULL,
  phato_path VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE users
ADD COLUMN phato_path VARCHAR(200) DEFAULT NULL;
ALTER TABLE users
MODIFY COLUMN temporaray_lock VARCHAR(100) DEFAULT '1234';




CREATE TABLE IF NOT EXISTS client_visitor (
    id INT AUTO_INCREMENT,
    client_id VARCHAR(200) DEFAULT NULL,
    method VARCHAR(40) DEFAULT NULL,
    name VARCHAR(200) DEFAULT NULL,
    email VARCHAR(200) DEFAULT NULL,
    number VARCHAR(200) DEFAULT NULL,
    date VARCHAR(200) DEFAULT NULL,
    review_method VARCHAR(200) DEFAULT 'pending',
    user_email VARCHAR(200) DEFAULT NULL,
    isSend BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id)
);

ALTER TABLE client_visitor
ADD COLUMN count INT DEFAULT 0,
ADD COLUMN max_send_msg INT DEFAULT 2,
ADD COLUMN unsubscribe BOOLEAN DEFAULT true;





CREATE TABLE IF NOT EXISTS private_review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(200),
    rating VARCHAR(200),
    textarea VARCHAR(1000),
    username VARCHAR(200),
    email VARCHAR(200),
    user_email VARCHAR(200),
    number VARCHAR(200),
    date VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS customer_support (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    text VARCHAR(1000) NOT NULL,
    image_path VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS user_marketing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unique_id VARCHAR(36) UNIQUE,  -- Assuming a UUID format for uniqueness
  name VARCHAR(200),
  email VARCHAR(200) ,
  user_email VARCHAR(200) , 
  phone VARCHAR(20) ,
  methods VARCHAR(10),
  content VARCHAR(2000),
  unsubscribe BOOLEAN DEFAULT FALSE,
  send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE qr_code (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unique_id VARCHAR(100) UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    valid BOOLEAN DEFAULT true,
    method VARCHAR(255) DEFAULT 'open_source'
);






CREATE TABLE open_private_review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id VARCHAR(255),
    rating VARCHAR(10),
    textarea VARCHAR(1000),
    username VARCHAR(255) DEFAULT 'open source',
    user_email VARCHAR(255) ,
    email VARCHAR(255) DEFAULT 'open source',
    number VARCHAR(255) DEFAULT 'open source',
    date VARCHAR(25)
);

-- shortcut
CREATE TABLE shortcutsql (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    google_link VARCHAR(255) DEFAULT NULL,
    facebook_link VARCHAR(255) DEFAULT NULL,
    yel_link VARCHAR(255) DEFAULT NULL,
    helth_link VARCHAR(255) DEFAULT NULL,
    user_email VARCHAR(255) NOT NULL,
    unique_id VARCHAR(255) NOT NULL,
    valid BOOLEAN DEFAULT true
);

CREATE TABLE public_review_shortcut (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    method VARCHAR(255) DEFAULT 'waiting'
);
ALTER TABLE public_review_shortcut
ADD COLUMN company_name VARCHAR(255) NOT NULL;

--24/2/2024
ALTER TABLE shortcutsql
ADD COLUMN custom_url VARCHAR(255) NOT NULL;
ALTER TABLE shortcutsql
ADD COLUMN custom_phato_url VARCHAR(255) NOT NULL;

--3/3/2024
ALTER TABLE shortcutsql
ADD COLUMN user_emial_view VARCHAR(255) DEFAULT NULL;
ALTER TABLE public_review_shortcut
ADD COLUMN user_emial_view VARCHAR(255) DEFAULT NULL;






