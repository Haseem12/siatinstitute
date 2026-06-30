# SIAT Backend Setup

This folder contains the PHP scripts for the Scholars Institute of Arts & Technology (SIAT) student portal.

## Deployment Instructions

1.  **Database Setup:**
    *   Log in to your MySQL database (via phpMyAdmin or CLI).
    *   Execute the SQL commands in `schema.sql` to create the required tables.

2.  **Server Upload:**
    *   Upload all `.php` files in this folder to your server at `sajfoods.net/api/siat/`.

3.  **Connection Test:**
    *   The `db_connect.php` file is already pre-configured with your provided credentials. 
    *   Try accessing `https://sajfoods.net/api/siat/role-login.php` in your browser. You should see a JSON error message (which is expected as it requires a POST request), proving the script is reachable and connected.

## Security Note

In production, ensure you replace the `header("Access-Control-Allow-Origin: *");` with your actual frontend domain (e.g., `https://your-app-url.web.app`) to prevent unauthorized access.