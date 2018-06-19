# Cadet Frontend 

[![Build Status](https://travis-ci.org/source-academy/cadet-frontend.svg?branch=master)](https://travis-ci.org/source-academy/cadet-frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/cadet-frontend/badge.svg?branch=travis)](https://coveralls.io/github/source-academy/cadet-frontend?branch=travis)

## Development Setup

1. Install a stable version of Yarn and NodeJS.
2. Run `yarn` to install dependencies.
3. Copy the `.env.example` file as `.env` and set the variable `REACT_APP_IVLE_KEY`
   to contain your IVLE Lapi key.
4. Run `yarn start` to start the server at `localhost:80`. Admin permissions may
   be required for your OS to serve at port 80.

## Application Structure

1. `actions` contains action creators, one file per reducer, combined in index.
2. `assets` contains static assets.
3. `components` contains all react components.
4. `containers` contains HOC that inject react components with Redux state.
5. `mocks` contains mock data structures for testing
6. `reducers` contains all Redux reducers and their state, combined in index.
7. `sagas` contains all Redux sagas, combined in index.
8. `slang` contains the source interpreter.
9. `styles` contains all SCSS styles.
10. `utils` contains utility modules.

## TypeScript Coding Conventions

We reference [this guide](https://github.com/piotrwitek/react-redux-typescript-guide).
