# Password Strength Microservice

A small Fastify + TypeScript microservice that evaluates password strength and returns a score, a human-readable label and actionable feedback.

## Endpoint

POST /api/v1/password-strength

Example request:

```json
{
  "username": "okenobi",
  "email": "o.kenobi@jedi-council.com",
  "password": "Hello there!"
}
```

Example response:

```json
{
  "score": 65,
  "label": "good",
  "feedback": [
    "Add at least one number."
  ],
  "checks": {
    "length": true,
    "uppercase": true,
    "lowercase": true,
    "number": false,
    "symbol": true,
    "notCommon": true
  },
  "passwordLength": 12
}
```

## How it works

The service uses a heuristic model that rewards:

- length
- uppercase/lowercase letters
- numbers
- symbols

and penalizes:

- passwords that include the username or email
- common passwords such as `password` or `qwerty`
- repeated character patterns

The resulting score is mapped to a label:

- 90+ → very-strong
- 80–89 → strong
- 65–79 → good
- 50–64 → fair
- 30–49 → weak
- 0–29 → very-weak

## Local development

1. Install dependencies
   ```bash
   npm install
   ```
2. Run tests
   ```bash
   npm test
   ```
3. Start the server
   ```bash
   npm run dev
   ```
4. Send a request
   ```bash
   curl -X POST http://127.0.0.1:3000/api/v1/password-strength \
     -H 'Content-Type: application/json' \
     -d '{"username":"okenobi","email":"o.kenobi@jedi-council.com","password":"JediMaster42!"}'
   ```

## Production build

```bash
npm run build
```

## Docker

Build the image:

```bash
docker build -t password-strength-microservice .
```

Run the container:

```bash
docker run --rm -p 3000:3000 password-strength-microservice
```

## Design notes

The implementation keeps the evaluation logic pure and testable in [src/password-strength.ts](src/password-strength.ts), while the HTTP layer in [src/server.ts](src/server.ts) remains focused on validation and transport concerns.
