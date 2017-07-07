create database cmimc;
use cmimc;
create table accounts (
    account_id int not null auto_increment,
    email varchar(255),
    password varchar(255),
    salt varchar(511),
    primary key (account_id)
);
create table students (
    student_id int not null auto_increment,
    team_id int,
    active_year int,
    name varchar(255),
    email varchar(255),
    subject1 varchar(255),
    subject2 varchar(255),
    age int,
    tshirt varchar(31),
    primary key (student_id)
);
create table teams (
    team_id int not null auto_increment,
    account_id int,
    name varchar(255),
    chaperone_name varchar(255),
    chaperone_email varchar(255),
    chaperone_number varchar(31),
    paid boolean default false,
    primary key (team_id)
);
