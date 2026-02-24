# ServiceNow Add-on Prototype

A lightweight web-based prototype for incident intake and triage inspired by ServiceNow workflows.

## Features

- Create incidents with category, assignment group, requester, and priority.
- Automatically generate incident numbers (`INCxxxxxx`).
- Filter incident queue by status and priority.
- Search incidents by number, requester, and text.
- Advance status through `New -> In Progress -> Resolved`.
- Delete incidents.
- Persist data in browser `localStorage`.
- Reset queue to sample seed data.

## Run locally

This prototype is static HTML/CSS/JS and can run with any web server.

```bash
python3 -m http.server 4173
```

Then open:

- <http://localhost:4173>

## Notes

- This is intentionally backend-free for rapid prototyping.
- Data is stored locally in the current browser profile.
