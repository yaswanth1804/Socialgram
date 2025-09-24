# Socialgram(Social Media Web Application)

A full-stack social media application built using the MERN stack which provides separate modules for User such as enabling features like posting, following, commenting, liking, real-time messaging, real-time notifications, and seeing online users. The backend uses Node.js/Express and MongoDB for data storage, ensuring efficient handling of user content, relationships, and interactions. The use of WebSockets (Socket.IO) provides real-time updates and improves responsiveness for messaging & notifications.
# Features
* **Real-Time Messaging:** Instant communication with friends and followers for seamless
conversations and collaboration.
* **Post-Saving Functionality:** Easily capture and save important posts and articles for future
reference, ensuring valuable content is never lost.
* **User Profiles:** Customizable profiles where users can showcase their interests, experiences,
and connections.
* **In-App Notifications:** Stay updated with real-time alerts for messages, comments, and
interactions to enhance engagement.
* **Privacy and Security:** Robust encryption to protect user data and ensure confidential
communications.
# Technology Stack

* **Programming language:** JavaScript (Node.js)

* **Frontend:** React.js for UI, components, and interacting with backend via APIs.

* **Backend:** Express.js (Node.js) handling routing, REST API endpoints, business logic.

* **Database:** MongoDB (NoSQL) to store users, posts, follow relationships, messages, and notifications.

* **Real-Time Communication:** Socket.IO used for real-time events like messaging, tracking active users, sending notifications.

* **Media management:** Cloudinary for image uploads and management.

* **Authentication & Security:** JWT or sessions for user login, password hashing, role checking for User features.

# PRE-REQUISITES:
* Install Node.js and npm on your development machine, as they are required to run
JavaScript on the server-side.

     **Download:** https://nodejs.org/en/download/

     **Installation instructions:** https://nodejs.org/en/download/package-manager/
* Install Express.js, a web application framework for Node.js, which handles server-side routing, middleware,
and API development.

   **Installation:** Open your command prompt or terminal and run the following command:

      npm install express
* Set up a MongoDB database to store your application's data.
  
     **Download:** https://www.mongodb.com/try/download/community
  
     **Installation instructions:** https://docs.mongodb.com/manual/installation/
* Install React.js, a JavaScript library for building user interfaces.
  
    **Follow the installation guide:** https://reactjs.org/docs/create-a-new-react-app.html
* Install Socket.io, a real-time bidirectional communication library for web applications.

    **Installation:**
     * Open your command prompt or terminal of server and run the following
       command:
       
               npm install socket.io
    * Open your command prompt or terminal of client and run the following
      command:
      
              npm install socket.io-client
* **HTML, CSS, and JavaScript:** Basic knowledge of HTML for creating the structure of your
  app, CSS for styling, and JavaScript for client-side interactivity is essential.
* To Connect the Database with Node JS go through the below provided link**:** https://www.section.io/engineering-education/nodejs- mongoosejs-mongodb/
  
# Install Dependencies:
* Navigate into the cloned repository directory:

      cd Socialgram

* Install the required dependencies by running the following commands:

      cd frontend
      npm install
      cd ../backend
      npm install

**Start the Development Server:**

* To start the development server, execute the following command:

     npm run dev

* The video conference app will be accessible at http://localhost:3000

 **Access the App:**

• Open your web browser and navigate to http://localhost:5173/

• You should see the login page, indicating that the installation and setup were
successful.
