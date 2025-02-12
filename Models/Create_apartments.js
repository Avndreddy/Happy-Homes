// Create Public Super User

// Table creation
function create_SuperUser_Table() {
  return `CREATE TABLE IF NOT EXISTS public.SuperUser (
    Admin_id SERIAL PRIMARY KEY,
    Admin_name VARCHAR(255) NOT NULL,
    Admin_email VARCHAR(255) UNIQUE NOT NULL,
    Admin_password VARCHAR(255) NOT NULL,
    Name_of_the_Builder VARCHAR(255) NOT NULL,
    Builder_contact_number VARCHAR(20) NOT NULL,
    Apartment_Name VARCHAR(20) NOT NULL UNIQUE,
    Apartment_Address VARCHAR(255) NOT NULL,
    Apartment_City VARCHAR(255) NOT NULL,
    Apartment_State VARCHAR(255) NOT NULL,
    Apartment_Pincode VARCHAR(20) NOT NULL,
    Apartment_Floors JSONB NOT NULL);`;
}

function insert_into_SuperUser_Table() {
  return `INSERT INTO public.SuperUser (
      Admin_name, Admin_email, Admin_password, Name_of_the_Builder, Builder_contact_number,
      Apartment_Name, Apartment_Address, Apartment_City, Apartment_State, Apartment_Pincode, Apartment_Floors
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;
}

// Create Individual Apartment Schema
function Individual_Apartment_Schema(Apartment_Name) {
  return `Create Schema IF NOT EXISTS ${Apartment_Name}`;
}

function Individual_Apartment_Table(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Flats 
    (Flat_number INT PRIMARY KEY,
    Floor INT NOT NULL,
    IsOccupied BOOLEAN DEFAULT FALSE,
    Occupied_by INT  DEFAULT NULL,
    Owner_id INT DEFAULT NULL);`;
}

function Individual_Users(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.User (
    User_id SERIAL PRIMARY KEY,
    User_name VARCHAR(255) NOT NULL,
    User_email VARCHAR(255) UNIQUE NOT NULL,
    User_password VARCHAR(255) NOT NULL,
    Flat_number INT DEFAULT NULL,
    Member_Type VARCHAR(255) NOT NULL,
    Occupied_Date DATE NOT NULL,
    Vacated_Date DATE  DEFAULT NULL,
    Family_Members JSONB DEFAULT NULL,
   CONSTRAINT fk_flat_number FOREIGN KEY (Flat_number) REFERENCES ${Apartment_Name}.Flats(Flat_number)
);`;
}

function Alter_Individual_Apartment_Table(Apartment_Name) {
  return `ALTER TABLE ${Apartment_Name}.Flats ADD CONSTRAINT fk_flat_owner_id FOREIGN KEY (Owner_id) REFERENCES ${Apartment_Name}.User(User_id);
    ALTER TABLE ${Apartment_Name}.Flats ADD CONSTRAINT fk_flat_occupied_by FOREIGN KEY (Occupied_by) REFERENCES ${Apartment_Name}.User(User_id);`;
}

function Individual_Apartment_Committee_Member_Table(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Committee_Member (
    Committee_Member_Id SERIAL PRIMARY KEY,
    User_Id INT NOT NULL UNIQUE,
    Member_Name VARCHAR(255) NOT NULL,
    Member_Role VARCHAR(255) NOT NULL,
    Member_Permissions JSONB NOT NULL,
    Member_since DATE NOT NULL,
    Member_until DATE  DEFAULT NULL,
    Member_status VARCHAR(255) NOT NULL,
    Member_Password VARCHAR(255) NOT NULL);`;
}

function insert_into_Apartment_Committee_Member_Table(Apartment_Name) {
  return `INSERT INTO ${Apartment_Name}.Committee_Member (User_Id, Member_Name, Member_Role, 
  Member_Permissions, Member_since, Member_until, Member_status, Member_Password
  ) 
VALUES (00, 'Admin User', 'Superuser', '{"access_level": "super", "can_vote": true, "can_edit": true, 
"can_delete": true, "can_manage_users": true, "can_manage_finances": true, "can_override_decisions": true}'::jsonb, 
'2015-01-01', NULL, 'Active', 'password');`;
}

function Individual_Users_Documents_Table(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.User_Documents (
    Document_id SERIAL PRIMARY KEY,
    User_id INT NOT NULL ,
    Document_Name VARCHAR(255) NOT NULL,
    Document_Type VARCHAR(255) NOT NULL,
    Flat_number INT DEFAULT NULL,
    Uploaded_by INT DEFAULT NULL,
    Document_Upload_at TIMESTAMP NOT NULL,
    Modified_by JSONB DEFAULT NULL,
    Modified_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_document_id FOREIGN KEY (User_id) REFERENCES ${Apartment_Name}.User(User_id),
    CONSTRAINT fk_Flat_number FOREIGN KEY (Flat_number) REFERENCES ${Apartment_Name}.Flats(Flat_number),
    CONSTRAINT fk_uploaded_by FOREIGN KEY (Uploaded_by) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id)
);`;
}

function Notice_Board_Table(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Notice_Board (
    Notice_Id SERIAL PRIMARY KEY,
    Notice_Title VARCHAR(255) NOT NULL,
    Notice_Description TEXT NOT NULL,
    Notive_Type VARCHAR(255) NOT NULL,
    Notice_Priority VARCHAR(255) NOT NULL,
    Created_by INT NOT NULL,
    Created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Attachment_Details JSONB DEFAULT NULL,
    CONSTRAINT fk_noticeboard_created_by  FOREIGN KEY (Created_by) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id)
);`;
}

function Complaints_Board(Apartment_Name) {
  return `Create TABLE ${Apartment_Name}.Complaints_Board (
    Complaint_id SERIAL PRIMARY KEY,
    Complaint_Title VARCHAR(255) NOT NULL,
    Complaint_Description TEXT NOT NULL,
    Complaint_Type VARCHAR(255) NOT NULL,
    Complaint_Status VARCHAR(255) NOT NULL,
    Created_by INT NOT NULL,
    Created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Comments JSONB DEFAULT NULL,
    Estimated_cost DECIMAL(10, 2) DEFAULT NULL,
    Fund_Requested DECIMAL(10, 2) DEFAULT NULL,
    ActualCost_used DECIMAL(10, 2) DEFAULT NULL,
    Funding_Status VARCHAR(255) NOT NULL,
    Approved_By INT DEFAULT NULL,
    Funding_date DATE DEFAULT NULL,
    Attachemnt JSONB DEFAULT NULL,
    CONSTRAINT fk_complaintsboard_created_by  FOREIGN KEY (Created_by) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id),
    CONSTRAINT fk_complaintsboard_approved_by FOREIGN KEY (Approved_By) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id)
    );`;
}

function Types_of_Funds(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Types_of_Funds (
    Types_of_Funds_id SERIAL PRIMARY KEY,
    Fund_Name VARCHAR(255) NOT NULL,
    Fund_Description VARCHAR(255) NOT NULL,
    Fund_Collection_Period VARCHAR(25) NOT NULL,
    Payment_Applicable_to JSONB NOT NULL,
    Fund_Amount DECIMAL(10,2) NOT NULL,
    isRecuring BOOLEAN NOT NULL DEFAULT FALSE,
    isOptional BOOLEAN NOT NULL DEFAULT FALSE,
    Fund_Created_Date DATE NOT NULL,
    Payment_Due_Date DATE NOT NULL,
    Created_by INT NOT NULL,
    Fund_Action_Status BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_funds_created_by  FOREIGN KEY (Created_by) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id));`;
}

function User_Payments(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.User_Payments(
    User_Payments_id SERIAL PRIMARY KEY,
    Fund_Type_Id INT NOT NULL,
    User_Id INT NOT NULL,
    Transaction_Id VARCHAR(255) NOT NULL,
    Payment_Document_Id INT DEFAULT NULL,
    Payment_Method VARCHAR(255) NOT NULL,
    Payment_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Amount DECIMAL(10,2) NOT NULL,
    Payment_Status VARCHAR(255) NOT NULL,
    Payment_Comment VARCHAR(255) NOT NULL,
    Payment_Reviewed_By INT DEFAULT NULL,
    Payment_Action_Status BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user_payments_reviewed_by FOREIGN KEY (Payment_Reviewed_By) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id),
    CONSTRAINT fk_user_payments_fund_type_id FOREIGN KEY (Fund_Type_Id) REFERENCES ${Apartment_Name}.Types_of_Funds(Types_of_Funds_id),
    CONSTRAINT fk_user_payments_user_id FOREIGN KEY (User_Id) REFERENCES ${Apartment_Name}.User(User_Id)
);`;
}

function Payment_Documents(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Payment_Documents(
    Payment_Document_Id SERIAL PRIMARY KEY,
    Payment_Document_Name VARCHAR(255) NOT NULL,
    document_type varchar(255) NOT NULL,
    Uploaded_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP );`;
}
// Owner_id INT NOT NULL,
//CONSTRAINT fk_payment_documents_owner_id FOREIGN KEY (Owner_id) REFERENCES ${Apartment_Name}.User(User_Id)

function Alter_User_Payments(Apartment_Name) {
  return `ALTER TABLE ${Apartment_Name}.User_Payments ADD CONSTRAINT 
    fk_user_payments_payment_document_id FOREIGN KEY (Payment_Document_Id) REFERENCES ${Apartment_Name}.Payment_Documents(Payment_Document_Id);`;
}

// function Alter_Individual_Apartment_Committee_Member_Table(Apartment_Name) {
//   return `ALTER TABLE ${Apartment_Name}.Committee_Member ADD CONSTRAINT
// fk_Committee_Member_payment_id FOREIGN KEY (Payment_Id) REFERENCES ${Apartment_Name}.User_Payments(User_Payments_id);`;
// }

function Committee_Funds_Usage(Apartment_Name) {
  return `CREATE TABLE ${Apartment_Name}.Fund_Usage (
    Fund_Usage_Id SERIAL PRIMARY KEY,
    Fund_Id INT NOT NULL,
    Usage_Description VARCHAR(255) NOT NULL,
    Usage_Amount DECIMAL(10,2) NOT NULL,
    Usage_Date DATE NOT NULL,
    Authorized_By INT NOT NULL,
    Supporting_Document_Id VARCHAR(255) NULL,
    Fund_Usage_Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_fund_usage_fund_id FOREIGN KEY (Fund_Id) REFERENCES ${Apartment_Name}.Types_of_Funds(Types_of_Funds_id),
    CONSTRAINT fk_fund_usage_authorized_by FOREIGN KEY (Authorized_By) REFERENCES ${Apartment_Name}.Committee_Member(Committee_Member_Id),
    CONSTRAINT fk_fund_usage_supporting_document FOREIGN KEY (Supporting_Document_Id) REFERENCES ${Apartment_Name}.Payment_Documents(Payment_Document_Id));`;
}

function Auto_generate_Flats_Data_according_to_Floors(
  Apartment_Name,
  Floor,
  Flat_Number
) {
  return ``;
}

module.exports = {
  create_SuperUser_Table,
  insert_into_SuperUser_Table,
  Individual_Apartment_Schema,
  Individual_Apartment_Table,
  Individual_Users,
  Alter_Individual_Apartment_Table,
  Individual_Apartment_Committee_Member_Table,
  insert_into_Apartment_Committee_Member_Table,
  Individual_Users_Documents_Table,
  Notice_Board_Table,
  Complaints_Board,
  Types_of_Funds,
  User_Payments,
  Payment_Documents,
  Alter_User_Payments,
  // Alter_Individual_Apartment_Committee_Member_Table,
  Committee_Funds_Usage,
  Auto_generate_Flats_Data_according_to_Floors,
};
