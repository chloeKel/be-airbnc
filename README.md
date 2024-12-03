## AirBNC

An application designed to connect hosts and guests for renting homes.

### Features

Users can search and book listings through the platform.
Advanced search and filter options for users.
Listing and booking management.
Access to booking history.
Easy rate and review options.

Built with Node v23.3.0

## Dependencies

Node.js, Express, PostgreSQL, Jest, Jest Sorted, Supertest, dotenv
Run `npm i` to install relevant packages

## Scripts

Setup DB - `npm run setup-db`
Seed DB - `npm run seed`

You will need the following env files -
env.test `PGDATABASE=airbnc_test`
env.development `PGDATABASE=airbnc`
