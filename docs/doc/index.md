---
layout: default
title:  "Documentation: Overview"
---

[Seagull]({{ site.baseurl }}/) &rarr; {{ page.title }}

# {{ page.title }}

This aims to be the go-to reference for all question about the framework itself.
If you find typo's or other bugs, feel free to send a PR!

## Folder structure

Since Seagull follows a [Zero-Config concept](/seagull/concepts/zero_config),
there are a few rules on where to put stuff for your project. This is how an
empty scaffolded project looks like, with explanations:

- **/api/**

  This folder contains everything you would label "backend". There is no server,
  but all you need are functions that will get triggered through http requests.

  - **[Frontend.ts](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/api/Frontend.ts)**

    This is an example API handler but also *essential* for the frontend to work.
    It will receive incoming requests that are not matched from other API paths
    or static assets, delegate it to the frontend router and render it "on the
    server".

- **/frontend/**

  The whole frontend resides in this folder. Seagull does ship with an embedded
  [Inferno.js](https://infernojs.org) view library and useful addons,
  preconfigured. Files in the folder have the extension *.tsx* and are regular
  typescript files, but can deal with html tags natively (like [JSX](https://facebook.github.io/react/docs/introducing-jsx.html)).

  - **/pages/**

    Place all your website pages / views here. They're just components, but by
    convention they should represent something which has a distinct URL and is
    not reused within the app. Add pages to the `routes.tsx` file to make them
    accessible.

  - **/widgets/**

    This is where reusable components should be placed. "Widgets" are meant to
    be used within pages or other widgets. Inferno is configured with
    *react-compat* mode, so every library targeting react should work with
    Inferno, too.

  - **[client.tsx](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/frontend/client.tsx)**

    This file is the entry point for clients (like, browsers) which execute the
    final app bundle. You should leave it there as-is, since any kind of
    configuration should happen in the `routes.tsx` file anyways.

  - **[layout.tsx](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/frontend/layout.tsx)**

    The classical "index.html" file, implemented as a tsx component, because why
    not. The layout gets compiled during SSR executions from the `Frontend.ts`
    API handler above.

  - **[routes.tsx](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/frontend/routes.tsx)**

    All frontend plumbing happens in this file, it leverages `inferno-router` to
    map (and nest) http paths to components. *(ToDo: add MobX stores here)*

- **~~/assets/~~**

  (ToDo: copy assets folder during build step, load it directly for serve step)

- **[package.json](package-json)**

  The central point for any project-wide configurations. Node.js projects
  already use this file for dependency management and node.js settings, but
  Seagull embraces the file even more. Currently, the `"name"` field is used
  as the app name directly, but more settings are in the works. There is no need
  for just another json/yml file in the project for seagull apps, like many
  other frameworks do.

- **[README.md](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/README.md)**

  This is a place for your project notes. Write down todo's, descriptions, ideas
  or whatever you feel like. All code projects should have this file, even if it
  is just to have a place for instant scribbling.

- **[tsconfig.json](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/tsconfig.json)**

  The configuration for the typescript compiler, it describes the rules how your
  app should be built and so on. You should never change it unless you know
  exactly what you're doing.

- **[tslint.json](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/tslint.json)**

  The living code style guide of JS/TS land. You can define precisely how your
  source code should be written here. In addition to this, there is also
  [prettier](https://prettier.io) applied when building your app, so some basic
  rules like 80 character line limits, trailing commas and single-quotes are
  strictly enforced.