---
layout: default
title:  "Inspirations: Best of many Worlds"
---

{% include concept-head.md %}

# {{ page.title }}

From the vast and rich choice of technologies out there, many good things are
cherrypicked into this framework. The learnings from the past decades of web
development are distilled into this framework, which itself stands on the
shoulders of giants. The major inspiration sources are:

- **Javascript**: the most popular programming language in the web development
  space. Everyone knows it more or less and you get access to the biggest
  collection of libraries of any language out there: NPM. Since JS runs on both,
  clients and servers (also called "isomorphic" or "universal"), this is the
  only language you need.

- **Ruby on Rails**: The very core paradigm that made Rails become the striking
  success was *Convention over Configuration*. Ultra-flexible configurations
  were (and a decade later: are again) exhausting productivity killers and
  responsible for very high cognitive load for developers. CoC solves this
  elegantly by dictating a few rules how stuff must be organized and freeing
  up developers to have more time for actual development. CoC happily trades
  in some flexibility for big gains in productivity.

- **Go**: The most important factor that drives Go's success is probably the
  tooling around the language. It may sound irrelevant but developers often
  spend much time every day to just format their code with tiny interactions,
  like comma placements or indentations (tabs vs spaces, ...). Go just stops
  all of this with *gofmt*. Seagull has it's own powerful *fmt* command, too.

- **Serverless**: From servers to docker containers, to compose, to swarm and
  kubernetes, the complexity of "just keep my app running" has increased
  dramatically over the last years. The serverless architecture directly
  eliminates the very idea of servers, erasing the many thought chains of
  orchestration and scalability issues. Developers can again focus more on
  actually developing stuff instead of doing DevOps works all day long.

- **PHP**: Yes, PHP. The one thing that made PHP appear so great for new
  developers back in the day was actually just one major thing: the deployment
  story. Get a "web host" for 2$ per month, FTP your "program" onto a server
  folder, open your web app in your browser. Ultra short feedback loop and
  instant gratification, nearly no costs. Exactly what new developers need to
  feel great right away and stick to something. Seagull leverages the FaaS
  paradigm on serverless, leading to *even simpler and cheaper deployments* than
  during the old PHP days.
