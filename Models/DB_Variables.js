

// Table creation
const create_SuperUser_Table = `CREATE TABLE IF NOT EXISTS public.SuperUser (
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
    Apartment_Floors JSONB NOT NULL

);`;

const insert_into_SuperUser_Table = `INSERT INTO public.SuperUser (
      Admin_name, Admin_email, Admin_password, Name_of_the_Builder, Builder_contact_number,
      Apartment_Name, Apartment_Address, Apartment_City, Apartment_State, Apartment_Pincode, Apartment_Floors
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;

    module.exports={
        create_SuperUser_Table,
        insert_into_SuperUser_Table
    }