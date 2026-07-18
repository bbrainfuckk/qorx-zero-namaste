# Security

## Provider keys

Provider credentials belong only in server environment variables. Qorx Zero
does not accept keys in the browser and does not persist them in IndexedDB.

If a key is pasted into chat, an issue, a commit, or any other shared surface,
revoke it immediately and issue a new one. Removing the text later does not
make the original key safe.

## Data boundary

The browser stores complete memory records locally. When the user asks a
question, the UI visibly builds a capped proof frame. Only that frame and the
question are sent to the same-origin server route.

## Reporting

Open a private GitHub security advisory for vulnerabilities. Do not include live
credentials or private user data in a report.
