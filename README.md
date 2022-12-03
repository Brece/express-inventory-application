# Inventory Application
![Project Preview](/public/images/express-inventory-application.png)
[**LIVE version**](https://express-inventory-app-odin.onrender.com)

This project is part of [TheOdinProject](https://www.theodinproject.com/lessons/nodejs-inventory-application). The goal is to learn more about the backend and how to display the requested data from a database in the client's browser window.

To achieve this I used **NodeJS** and **Express** for the backend, **MongoDB (NoSQL)** for the database, **EJS** as the view engine and **TailwindCSS** to display the content in the frontend.

This **CRUD** application mimics an inventory store where the user can add/update/delete documents like category, brand, item and item instances. Because of the lack of user authentication in order to protect private documents I've added the boolean property *"protected"* which limits available options to interact with those documents. Even if the user tries to access areas via the URL that are otherwise not available the options to update/delete are disabled.


Use this command to start the Dev-Server:
```
npm run serverstart
```

Start TailwindCSS watcher:
```
npm run tailwind
```

## Project setup
```
npm install
```
