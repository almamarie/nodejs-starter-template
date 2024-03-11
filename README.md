# Node.js Starter Template with Authentication & Authorization

This repository provides a basic Node.js starter template with essential features for a web application, including:

**Authentication:**

- User signup
- User sign in
- Forgot password functionality
- Reset password functionality
- Update password functionality

**Authorization:**

- Role-based access control (RBAC) with three roles:
  - User
  - Admin
  - Super Admin
- Each role has defined permissions.

**Additional Features:**

- User management
- Email server integration
- File server integration with Cloudinary

This template is designed to accelerate your web development process by providing a solid foundation for building secure and scalable applications.

## Getting Started

**Prerequisites:**

- Node.js and npm (or yarn) installed on your system.

**Steps:**

1. **Clone the repository:**

```bash
git clone git@github.com:almamarie/nodejs-starter-template.git my-project
```

2. **Configuration:**

    - Edit the `.env-temp` file and rename it to `.env`. This file stores sensitive information like database connection details, email server configuration, and Cloudinary credentials. 
    - Update the `.env` file with your own values for these services.

3. **Install dependencies:**

```bash
cd my-project
npm install
```

(or `yarn install`)

4. **Run the application:**

```bash
npm run dev
```

(or `yarn start`)

This will start the development server, typically running on `http://localhost:3000` by default.

**Note:** Make sure you have created the necessary accounts and obtained the required credentials for email server and Cloudinary before updating the `.env` file.

## Usage

The specific usage of the authentication and authorization functionalities, email server, and Cloudinary integration will depend on the chosen framework or library. Consult the project's documentation (if available) for details on how to implement these features.

**Note:** This starter template offers a foundational structure for user management, permissions, email, and file storage. Building a fully functional application will likely require additional development based on your specific needs.

## Contributing

I welcome contributions to this project! Please make a pull request and I will review it.

## License

Anyone is free to use this code What I require is that you give me credit in your project in the below format:

```code
Starter template created by: Louis Marie Atoluko Ayariga
Source code: https://github.com/almamarie/nodejs-starter-template
```

**Project By:** Louis Marie Atoluko Ayariga

## Auth Routes

The `/auth` router handles various authentication functionalities within the application. Here's a breakdown of the available routes:

- **Signin Route (POST /signin)**
  - Allows a user to sign in to the application using their email and password.
  - **Request (req):**
    - **req.body:** An object containing `email` and `password` properties.
  - **Response (res):** Sends success or error response based on login validity.

- **User Signup Route (POST /user/signup)**
  - Allows a user to sign up for an account with a role of 'user'.
  - Requires authentication (any permission level).
  - May involve uploading a profile photo.
  - **Request (req):**
    - **req.body:** An object containing user data (name, email, password, etc.).
    - **req.file (optional):** The uploaded photo file object (if using multer middleware).
  - **Response (res):** Sends success or error response based on signup success.

- **Admin Signup Route (POST /admin/signup)**
  - Allows a user with 'create:admin' permission to sign up a new admin user.
  - May involve uploading a profile photo.
  - **Request (req):**
    - **req.body:** An object containing new admin user data (name, email, password, etc.).
    - **req.file (optional):** The uploaded photo file object (if using multer middleware).
  - **Response (res):** Sends success or error response based on signup success.

- **Forgot Password Route (POST /forgotPassword)**
  - Initiates password reset by sending a reset link to the user's email address provided in the request body.
  - **Request (req):**
    - **req.body:** An object containing the user's email property.
  - **Response (res):** Sends success or error response based on whether the reset link was sent successfully.

- **Reset Password Route (PATCH /resetPassword/:token)**
  - Allows a user to reset their password using a reset token sent via email.
  - **Request (req):**
    - **req.params.token:** The reset password token received
