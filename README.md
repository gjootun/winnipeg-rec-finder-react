# Winnipeg Rec Finder - React

A React + TypeScript rebuild of the Winnipeg Rec Finder, converting the original vanilla JavaScript/AJAX version into a component-based front end. Powered by the City of Winnipeg's public Open Data API.

## Features
- Search by amenity type (arena, pool, community centre, library, etc.)
- Search by complex name
- Sort results alphabetically (A→Z or Z→A)
- Adjustable max results limit
- Live data fetched directly from the City of Winnipeg Open Data Portal
- Rebuilt with React state management and TypeScript typing, replacing manual DOM manipulation from the original vanilla JS version

## Tech Stack
React 18 · TypeScript · Vite

## Data Source
[City of Winnipeg Recreation Complex Open Data](https://data.winnipeg.ca/Recreation/Recreation-Complex/xuqw-wemm)

## Setup
```bash
npm install
npm run dev
```

## Related Project
A vanilla JavaScript version of this same tool is available at [winnipeg-rec-finder](https://github.com/gjootun/winnipeg-rec-finder), built before this React conversion.
