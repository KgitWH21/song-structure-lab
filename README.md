# Song Structure Lab

Your complete song picker, exported October 7, 2026. Includes the expanded genre catalog, editable endings, and Minimal mode with random solo/duo/trio lineups. It's plain HTML, CSS, and JavaScript, with no API key, backend, ChatGPT login, or package dependencies.

## Open in VS Code

1. Extract this ZIP.
2. In VS Code, choose **File → Open Folder** and select `song-structure-lab` (the folder containing `index.html`).
3. With Node.js 20 or newer installed, open the terminal and run:

   ```sh
   npm start
   ```

4. Open **http://localhost:5173**. Use Ctrl+C to stop it.

You don't need `npm install`. Opening `index.html` directly also runs the picker, but installation, offline caching, and clipboard access work best through a local server or HTTPS.

## Put it on your phone

The ZIP is a web app project, so publish it to an HTTPS website first. The prepared files are ready for GitHub Pages:

1. Create a GitHub repository and push the contents of this folder. Keep `index.html` at the repository root, rather than inside an extra enclosing folder.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then **main** and **/(root)**; save.
4. Open the published website address on your phone. Use the website address, not the GitHub repository page.
5. In Android Chrome, open the menu and choose **Install app** or **Add to Home screen**. Follow the device's prompts.

GitHub Pages publication makes this copy publicly accessible. It doesn't change your original ChatGPT site's audience. See [GitHub's publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [web app installation guidance](https://web.dev/learn/pwa/installation).

## Offline use

The service worker downloads the app's files after the first successful online visit. Give that visit time to finish, then reopen the app and try airplane mode. The picker can generate and copy prompts offline; Suno itself still needs its own connection. Installation and offline support depend on your browser and HTTPS hosting (localhost also works for development).

Current song selections aren't saved between reloads. Copy any brief you want to keep before closing or refreshing.

## Edit and publish updates

- `app.js`: controls, random generation, prompt output, and Minimal mode.
- `catalog.js`: genres and other musical elements.
- `style.css`: layout and colors.
- `index.html`: page content and controls.
- `manifest.webmanifest`, `pwa.js`, and `icons/`: home-screen installation.
- `scripts/prepare.mjs`: generates content-versioned assets and the offline cache.
- `scripts/serve.mjs`: a small local development server.

After editing, run:

```sh
npm run build
```

Then commit and push all updated files, including generated filenames and `sw.js`. Don't edit the files whose names contain a hash; edit `app.js`, `catalog.js`, or `style.css` instead. Hashes prevent the old-script/new-page mismatch that affected the Minimal button.

An offline app may show a cached version. Open it online, let the update download, then close all windows for the app and reopen it. The service worker waits for old windows to close before activating an update.

## Included / excluded

This package contains the complete standalone runtime and mobile support. The original hosted site remains available separately. Git history, hosting IDs, credentials, temporary test files, and installed dependencies aren't included.
