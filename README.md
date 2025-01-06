
Frontend for Crypto Dashboard
Overview
This project is the frontend implementation for the Crypto Dashboard. It interacts with the backend to provide real-time updates for cryptocurrency prices, user subscriptions, and historical charts for specific trading pairs.

Features
User Dashboard:
Login and registration functionality.
View and manage subscribed trading pairs.
Navigate to details of specific trading pairs.
Details Page:
Real-time price updates.
One-month historical chart using Binance API data.
Responsive Design:
Optimized for both desktop and mobile views.
How the Code Works
1. React Client Components
The application uses React client components for dynamic UI updates:

User Dashboard (/user):
Displays user subscriptions and real-time price updates.
Allows adding pairs and navigating to their details.
Details Page (/details/[symbol]):
Fetches details for a specific trading pair.
Displays a historical chart and live updates for the selected pair.
2. API Interaction
The frontend communicates with the backend via RESTful API endpoints:

User Endpoints:
/api/users/login: Login functionality.
/api/users/register: Registration endpoint.
/api/users/[id]/subscriptions: Fetch subscribed pairs.
/api/users/[id]/subscribe: Subscribe to a new pair.
Ticker Endpoints:
/api/ticker/[symbol]/details: Fetch live symbol details.
/api/ticker/[symbol]/history: Fetch historical data for charts.
3. WebSocket Integration
WebSocket connections are established for:

Real-time price updates for user subscriptions on the dashboard.
Live updates for details pages to ensure up-to-date information.
4. Chart Integration
The Chart.js library is used to render historical data visually. It is configured for:

Custom dimensions for smaller charts.
Responsive layout for varying screen sizes.
Setup and Running the Project
1. Prerequisites
Node.js (version 14 or later)
npm or yarn
2. Install Dependencies
Clone the repository and install dependencies:

bash
Copy code
git clone <repo-url>
cd frontend
npm install
3. Configure Environment Variables
Create a .env.local file in the project root and add the following:

bash
Copy code
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
4. Start the Development Server
Run the following command:

bash
Copy code
npm run dev
Visit the application at http://localhost:3001.

5. Build for Production
To create a production build:

bash
Copy code
npm run build
npm start
Design Decisions and Key Considerations
1. Dynamic Routing
The application uses Next.js' dynamic routing (/details/[symbol]) for navigating to specific trading pairs.

2. Real-Time Updates
WebSocket connections ensure real-time updates for:

User subscriptions (e.g., price changes).
Symbol details pages.
3. Historical Chart Implementation
Historical data is fetched statically on page load to simplify implementation and reduce WebSocket complexity. The chart dynamically adjusts its size for better user experience.

4. User Experience
Clear navigation for managing subscriptions and viewing details.
Visual feedback for real-time updates (e.g., flashing rows for price changes).
5. Scalability
The separation of frontend and backend ensures modularity:

The frontend focuses on UI rendering and user interactions.
The backend handles API requests, database interactions, and WebSocket connections.
Future Enhancements
Advanced Charting:
Add more interactive features to charts (e.g., tooltips, zooming).
Push Notifications:
Notify users of significant price changes even when not actively viewing the dashboard.
Enhanced Error Handling:
Improve user feedback for network errors or failed API requests.