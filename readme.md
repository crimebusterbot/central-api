# Central API

This is the code for the central-api that combines the information off different services and saves it into the database. 

![flow for app](assets/central-api.flow.jpg)

Create a .env file in the root that looks like this:

```
API_KEY=KEY
JWT_SECRET=SECRET
DB_PASSWORD=PASSWORD
DB_USER=USER
DB_NAME=NAME
DB_HOST=HOST

SCREENSHOT_URL=URL
SERVE_URL=URL
```

The database is expected to be MySQL, the schema can be made with db.sql