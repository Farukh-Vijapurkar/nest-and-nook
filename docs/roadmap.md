
# Nest & Nook PMS Roadmap

## PMS v1 ?

Completed Modules

* Dashboard
* Bookings
* Guest Management
* Guest Profiles
* Booking Profiles
* Expenses
* Reports
* Calendar
* Multi-Guest Support
* Booking Status Management
* Document Uploads

---

## Next Phase

### Airbnb Import

Goal:
Import Airbnb booking data into Nest & Nook PMS.

### Airbnb Sync

Goal:
Automatically sync bookings from Airbnb into Supabase.

### Guest Communication

Goal:
Automate guest notifications and communication workflows.

### WhatsApp Automation

Features:

* Booking Confirmation
* Check-In Reminder
* Check-Out Reminder
* Thank You Message
* Review Request

### Email Automation

Features:

* Booking Confirmation Email
* Stay Instructions
* Check-In Reminder
* Check-Out Reminder
* Invoice / Receipt

### AI Reply Assistant

Goal:
Generate AI-powered guest responses using booking and guest context.

---

# Airbnb Integration Strategy

## Phase 1 — Manual Import

Airbnb CSV
?
Upload
?
Supabase
?
Nest & Nook PMS

Benefits:

* Fastest to build
* Low maintenance
* No scraping required

---

## Phase 2 — Email Automation

Airbnb Reservation Email
?
n8n Workflow
?
Extract Booking Details
?
Supabase
?
Nest & Nook PMS

Benefits:

* More reliable than scraping
* Near real-time updates
* Easy to maintain

---

## Phase 3 — Browser Automation (Only If Needed)

Airbnb
?
Browser Automation
?
Data Extraction
?
Supabase

Notes:

* Airbnb UI changes frequently
* Higher maintenance effort
* Use only if CSV and email methods are insufficient

---

# Target Architecture

Airbnb
?
Reservation Received
?
n8n
?
Booking Parsing
?
Supabase
?
Nest & Nook PMS
?
Automated Guest Messages

---

# Future Ideas

* AI Guest Reply Assistant
* Occupancy Analytics
* Revenue Forecasting
* Dynamic Pricing Insights
* Housekeeping Workflow
* Invoice Generation
* Review Management
* Owner Reporting Dashboard

---

Status: PMS v1 Complete ??

Next Focus: Airbnb Import & Sync
