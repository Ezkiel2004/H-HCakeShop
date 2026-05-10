# How to Run CakeCraft on XAMPP (School Computer)

Follow these steps carefully to run the CakeCraft website on your school computer using XAMPP and a local MySQL database. This setup will give you a fully functional frontend that talks to a real PHP backend.

## 1. Start XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache** (this runs the web server and PHP).
3. Click **Start** next to **MySQL** (this runs the database).
   *Wait until the background of both turns green.*

## 2. Set Up the Database
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Look on the left sidebar for a database named `cake_saas`.
   - If it **does not exist**, click on **New** (at the top left).
   - Enter `cake_saas` as the Database name.
   - Click **Create**.
3. Click on the `cake_saas` database in the left sidebar to select it.
4. Click on the **Import** tab at the top of the screen.
5. Click **Choose File** and select the `database.sql` file located inside your website folder.
6. Scroll down and click the **Import** (or Go) button at the bottom.
   *Wait for the green success message. Your database is now populated with cakes, users, and orders!*

## 3. Move the Project to XAMPP
XAMPP only runs PHP files if they are placed inside a specific "magic" folder.
1. Locate your entire `cake-saas` project folder.
2. Copy the entire folder.
3. Open a file explorer and go to your XAMPP installation folder (usually `C:\xampp`).
4. Open the `htdocs` folder (`C:\xampp\htdocs`).
5. Paste the `cake-saas` folder inside `htdocs`.

## 4. Run Your Website
1. Open your browser.
2. Go to: `http://localhost/cake-saas` (or whatever you named the folder).
3. Your website should load! It is now fetching data dynamically from your PHP/MySQL backend!

> **Note on Logging In:** An admin account has been pre-created for you.
> **Email:** `admin@cakecraft.com`
> **Password:** `admin123`
