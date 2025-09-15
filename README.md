# Hospital Management System 🏥

A comprehensive web-based Hospital Management System designed to streamline healthcare operations, manage patient records, schedule appointments, and facilitate efficient communication between patients, doctors, and hospital administrators.

## 🌟 Features

### 👥 User Management
- **Multi-role Authentication**: Separate login systems for Patients, Doctors, and Administrators
- **Secure Registration**: User registration with email verification
- **Profile Management**: Update personal information and medical details
- **Role-based Access Control**: Different permissions for different user types

### 👨‍⚕️ Doctor Portal
- **Dashboard Overview**: Quick access to daily appointments and patient summaries
- **Patient Management**: View patient history, medical records, and diagnoses
- **Appointment Scheduling**: Manage availability and appointment slots
- **Prescription Management**: Create and manage patient prescriptions
- **Medical Reports**: Generate and view diagnostic reports

### 👤 Patient Portal
- **Online Appointment Booking**: Schedule appointments with preferred doctors
- **Medical History**: Access personal medical records and treatment history
- **Prescription Tracking**: View current and past prescriptions
- **Bill Management**: View and download medical bills and invoices
- **Test Results**: Access lab reports and diagnostic results

### 👔 Admin Panel
- **User Management**: Manage doctors, patients, and staff accounts
- **Department Management**: Organize hospital departments and specializations
- **Appointment Oversight**: Monitor and manage all hospital appointments
- **Financial Reports**: Generate revenue and expense reports
- **System Configuration**: Manage hospital settings and configurations

### 📊 Additional Features
- **Real-time Notifications**: Email/SMS notifications for appointments and updates
- **Search Functionality**: Advanced search for patients, doctors, and records
- **Data Export**: Export reports in PDF and Excel formats
- **Responsive Design**: Mobile-friendly interface for all devices
- **Security**: Data encryption and secure session management

## 🚀 Tech Stack

- **Backend**: NodeJs
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Additional**: jQuery, Chart.js for analytics





### Default Login Credentials

**Administrator:**
- Username: `admin@hospital.com`
- Password: `admin123`

**Doctor (Demo):**
- Username: `doctor@hospital.com`
- Password: `doctor123`

**Patient (Demo):**
- Username: `patient@hospital.com`
- Password: `patient123`

> ⚠️ **Important**: Change default passwords after first login!

## 📁 Project Structure

```
Hospital_Management/
├── index.php                 # Main entry point
├── config/
│   ├── database.php         # Database configuration
│   ├── config.php           # General configuration
│   └── session.php          # Session management
├── includes/
│   ├── header.php           # Common header
│   ├── footer.php           # Common footer
│   ├── sidebar.php          # Navigation sidebar
│   └── functions.php        # Utility functions
├── admin/
│   ├── dashboard.php        # Admin dashboard
│   ├── manage_doctors.php   # Doctor management
│   ├── manage_patients.php  # Patient management
│   └── reports.php          # System reports
├── doctor/
│   ├── dashboard.php        # Doctor dashboard
│   ├── appointments.php     # Appointment management
│   ├── patients.php         # Patient records
│   └── prescriptions.php    # Prescription management
├── patient/
│   ├── dashboard.php        # Patient dashboard
│   ├── book_appointment.php # Appointment booking
│   ├── medical_history.php  # Medical records
│   └── bills.php            # Bill management
├── assets/
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── images/              # Images and icons
│   └── plugins/             # Third-party plugins
├── database/
│   ├── hospital_management.sql # Database structure
│   └── sample_data.sql      # Sample data
├── uploads/                 # File uploads
├── reports/                 # Generated reports
└── README.md
```

## 🔧 Configuration


### File Upload Settings
Configure upload limits in `config/config.php`:
```php
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_EXTENSIONS', ['pdf', 'jpg', 'png', 'docx']);
```

## 📊 Database Schema

### Key Tables
- `users` - User authentication and basic info
- `patients` - Patient-specific information
- `doctors` - Doctor profiles and specializations
- `appointments` - Appointment scheduling
- `medical_records` - Patient medical history
- `prescriptions` - Medication prescriptions
- `departments` - Hospital departments
- `bills` - Billing and payment records

## 🎯 Usage Guide

### For Patients
1. **Registration**: Sign up with personal and medical information
2. **Login**: Access your patient portal
3. **Book Appointment**: Select doctor, date, and time
4. **View Records**: Access medical history and test results
5. **Manage Profile**: Update contact and emergency information

### For Doctors
1. **Login**: Access doctor portal with credentials
2. **View Schedule**: Check daily appointments and patient list
3. **Patient Care**: Review patient history and add diagnoses
4. **Prescriptions**: Create and manage patient prescriptions
5. **Reports**: Generate medical reports and certificates

### For Administrators
1. **Dashboard**: Monitor system overview and statistics
2. **User Management**: Add/edit doctor and staff accounts
3. **System Reports**: Generate financial and operational reports
4. **Configuration**: Manage hospital settings and departments

## 🔒 Security Features

- **Password Hashing**: Secure password storage using PHP password_hash()
- **SQL Injection Prevention**: Prepared statements for database queries
- **Session Management**: Secure session handling and timeout
- **Access Control**: Role-based permissions and authentication
- **Data Validation**: Input sanitization and validation
- **File Upload Security**: Restricted file types and size limits

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen resolutions

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add: New appointment reminder feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/new-feature
   ```
7. **Create a Pull Request**

### Code Standards
- Follow PSR-12 coding standards for PHP
- Use meaningful variable and function names
- Add comments for complex logic
- Test all database operations
- Ensure responsive design for new features

## 🐛 Known Issues & Troubleshooting

### Common Issues
1. **Database Connection Error**
   - Check database credentials in `config/database.php`
   - Ensure MySQL service is running

2. **File Upload Issues**
   - Check folder permissions for `uploads/` directory
   - Verify PHP upload limits in php.ini

3. **Email Not Sending**
   - Verify SMTP configuration
   - Check email credentials and app passwords

### Support
- Check the [Issues](https://github.com/Raj4478/Hospital_Management/issues) page
- Create a new issue with detailed error information
- Include PHP and MySQL version information




## 👨‍💻 Author

**Raj4478**
- GitHub: [@Raj4478](https://github.com/Raj4478)
- LinkedIn: [https://www.linkedin.com/in/rajeshwar-singh-b77075271]


## 📞 Support

For support and queries:
- 📧 Email: support@yourhospital.com
- 💬 Issues: [GitHub Issues](https://github.com/Raj4478/Hospital_Management/issues)
- 📚 Documentation: Check the `/docs` folder for detailed guides

---

⭐ **Star this repository if you found it helpful!**

*Transforming healthcare management through technology* 🚀

---

**Disclaimer**: This system is designed for educational and demonstration purposes. Please ensure compliance with healthcare regulations (HIPAA, GDPR, etc.) before using in production environments.
