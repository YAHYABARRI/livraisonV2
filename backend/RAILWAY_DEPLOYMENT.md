# Railway deployment

## Service setup

1. Create a Railway project from the GitHub repository.
2. Create a backend service and set its root directory to `/backend`.
3. In the service settings, set the config file path to `/backend/railway.json`.
4. Add a MySQL database to the same Railway project. Keep its service name as `MySQL` or update the references below.
5. Generate a public domain for the backend service.

## Backend variables

Paste these variables into the backend service. Replace every `CHANGE_ME` value.

```dotenv
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
SPRING_JPA_SHOW_SQL=false

JWT_SECRET=CHANGE_ME_WITH_AT_LEAST_64_RANDOM_CHARACTERS
APP_ADMIN_EMAIL=CHANGE_ME
APP_ADMIN_PASSWORD=CHANGE_ME
APP_ADMIN_PASSWORD_HASH=
APP_ADMIN_FIRST_NAME=GLADEX DELIVERY
APP_ADMIN_LAST_NAME=Admin
APP_ADMIN_PHONE=CHANGE_ME

CORS_ALLOWED_ORIGINS=https://livraision.netlify.app
```

Do not define `PORT`; Railway injects it automatically. Seal `JWT_SECRET`, `APP_ADMIN_PASSWORD`, and `SPRING_DATASOURCE_PASSWORD` in Railway after the first successful deployment.

## Verification

After Railway generates the domain, verify:

```text
https://YOUR-BACKEND-DOMAIN.up.railway.app/api/health
https://YOUR-BACKEND-DOMAIN.up.railway.app/api/rates
```

The health endpoint must return a JSON response with `"status":"UP"`.

## Frontend connection

In Netlify, set the frontend build variable to the public backend URL including `/api`:

```dotenv
VITE_API_URL=https://YOUR-BACKEND-DOMAIN.up.railway.app/api
```

Redeploy the frontend after changing this variable.
