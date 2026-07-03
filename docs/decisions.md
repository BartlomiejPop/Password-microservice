# Key decisions and assumptions

## 1. Password strength is heuristic, not cryptographic

The service returns a practical security score rather than claiming to predict real-world cracking difficulty exactly. The scoring model balances:

- password length
- character variety
- obvious guessability signals

That makes the service useful for UX and policy checks without pretending to be a formal entropy estimator.

## 2. The endpoint is strict about input validation

The POST body is validated with Zod before evaluation. Invalid payloads return a 400 response with a structured error object.

This protects the service from malformed input and makes the API contract explicit.

## 3. Personal information is treated as a risk signal

Passwords that contain the username or email are penalized. This is a common real-world weak-password pattern and aligns with security guidance.

## 4. Common passwords are explicitly downgraded

The evaluator includes a small list of common passwords such as `password`, `qwerty`, and `123456`. These are not considered strong even when they meet some complexity rules.

## 5. The service exposes a health endpoint

A lightweight `/health` endpoint is included so the service can be probed by orchestrators and load balancers in a containerized deployment.

## 6. The evaluation logic is separated from the transport layer

The core scoring logic lives in the pure TypeScript module [src/password-strength.ts](src/password-strength.ts). Fastify only handles request parsing, validation and HTTP responses in [src/server.ts](src/server.ts).

That separation makes testing straightforward and keeps future changes easier to reason about.
