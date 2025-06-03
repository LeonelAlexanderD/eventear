Evente-Ar - Requirements Document
1. Project Overview
Objective: Build a cross-platform app (mobile + web) for viewing and publishing cultural events (e.g. Concierto, Feria, Festival) using:

    •	Frontend: Expo React Native (with Web support)
    •	Backend: Supabase (Auth, Database, Storage)
    •	Offline Mode: Local cache of next 30 days of events

Key Features:
    •	View events via carrousel and list
    •	Event detail view with full metadata
    •	Authentication and profile handling
    •	Favorites and subscriptions
    •	Notifications for changes and reminders
    •	Event discovery and filtering
    •	Offline viewing support

2. Functional Requirements
2.1 Authentication (Supabase)
    •	User Signup:
    	o	Account type: user or organizer
    	o	Required fields:
	        •	All: email, password, name, phone
	        •	Organizer: profile image (required)

    •	User Login:
    	o	JWT session management
    •	Logout:
    	o	Clear session and navigate to login screen
    •	Error Handling:
    	o	Handle email/password validation and display errors

2.2 Event Viewing
    •	Main Screen:
    	o	Header with app name and profile button
    	o	Carrousel of next events:
    	    •	Fields: image, name, date, location
    	o	List of events (next 30 days)
    	o	Persistent footer with navigation buttons:
    	    •	Search / Home / Discover

    •	Event Detail:
    	o	Fields: name, image, date, time, location, ticket sale location, price, ticket stock, optional announcement
    	o	Show “add to favorites” button (if viewer is not creator)
    	o	Show creator profile summary and subscribe button

2.3 Event Discovery and Search
    •	Search Screen:
    	o	Search bar
    	o	Genre grid (only genres with events)
    	o	Filters: date, genre, ticket availability
    •	Discover Screen:
    	o	Random events refreshed on reload

2.4 Profile Management
    •	Profile Screen:
    	o	User info and profile image
    	o	Subscreens:
    	    •	Preferences (autocomplete input with validation)
    	    •	Favorites (marked gray if event already happened)
    	    •	Subscriptions (to event creators)
    	    •	Notifications (gray = read/past, color = new/upcoming)
    	    •	My Events (only for organizers)
    	    •	Create Event (only for organizers)

2.5 Event CRUD (Organizers Only)
    •	Create Event:
    	o	Required: all metadata fields listed above
    •	Edit/Delete:
    	o	Only by the creator
    •	View My Events:
    	o	List with option to edit or delete

2.6 Favorites and Subscriptions
    •	Favorites:
    	o	Mark/unmark any event
    •	Subscriptions:
    	o	Subscribe/unsubscribe to event creators
    	o	Choose notification type: email and/or in-app

2.7 Notifications
    •	Notify followers when:
    	o	A new event is created
    	o	An event is updated
    •	Notify all relevant users when:
    	o	Ticket sale is in 7, 3, or 1 day
    	o	Event is in 7, 3, or 1 day

2.8 Offline Access
    •	Cache events of next 30 days
    •	Load from local storage if offline
    •	Sync when connection is restored

3. Technical Specifications
3.1 Supabase Setup
    •	Use Supabase Auth for authentication
    •	Event table structure:
    	o	id: unique identifier
    	o	creator_id: references user
    	o	title, description, location
    	o	date, time, ticket_price, ticket_stock
    	o	sale_location, announcement
    	o	created_at, updated_at

3.2 Component Architecture
    •	AuthStack: Login / Signup
    •	MainStack:
    	o	HomeScreen (carrousel + list)
    	o	EventDetailScreen
    	o	SearchScreen
    	o	DiscoverScreen
    	o	ProfileScreen + subscreens
    	o	Create/Edit EventScreen
    	o	NotificationScreen

3.3 Offline Functionality
    •	Use AsyncStorage or SQLite
    •	Sync mechanism to update local data when online
    •	Fallback to cached data on network failure

4. Non-Functional Requirements
    •	Must support both mobile (Android/iOS) and web
    •	Responsive layout
    •	Fast load (<1s for cached content)
    •	Row-level security in Supabase
    •	Basic accessibility compliance
    •	Basic client-side validation
    •	Scalable data structure for future features

