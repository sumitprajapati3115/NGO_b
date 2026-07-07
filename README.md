# NGO Backend

This is a Node.js + Express backend for the NGO donation app with MongoDB storage.

## Setup

1. Open a terminal in `ngo_b`
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file from `.env.example` and update the values with your own credentials:
```bash
copy .env.example .env
```
4. If using MongoDB Atlas, make sure your network allows SRV DNS lookups and that Atlas allows your IP address:
   - Confirm `cluster0.pbz6xog.mongodb.net` resolves from your machine.
   - Add your local IP or `0.0.0.0/0` to Atlas Network Access if needed.
   - Use a valid Atlas username/password and database name in `MONGO_URI`.
5. Start the server:
```bash
npm run dev
```

## API

- `GET /api/donations` - list donations
- `POST /api/donations` - create donation

### POST body

```json
{
  "fullName": "Name",
  "email": "email@example.com",
  "mobile": "1234567890",
  "donationAmount": "?1100",
  "fileName": "receipt.png",
  "fileData": "data:image/png;base64,..."
}
```
