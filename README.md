<p align="center">
  <a href="https://otog.in.th">
    <img src="https://github.com/phakphum-dev/otog-frontend/raw/main/public/logo512.png" width="80" />
  </a>
</p>

<h1 align="center">One Tambon One Grader</h1>

### Become a god of competitive programming, code and create algorithms efficiently.

### http://otog.in.th/

An online grader which was originally provided for POSN KKU center students but currently open for everybody.

## Original otog

This project is an upgrade version of

1. [OTOG-next](https://github.com/karnjj/OTOG-next): The newer version of otog but developed in Nextjs
2. OTOG_V2: The new version of otog built on javascript framework
3. [otog](https://github.com/phizaz/otog): The original otog grader which is no longer maintained

## Repositories

There are 3 main modules for otog

1. [otog-frontend](https://github.com/phakphum-dev/otog-frontend)
2. [otog-backend](https://github.com/phakphum-dev/otog-backend)
3. [otog-grader](https://github.com/phakphum-dev/otog-grader)

## Running Locally

First, run pnpm to install dependencies

```bash
pnpm i
```

After that, run pnpm dev

```bash
pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

You can use `.env.local.template` to set your local environment, just copy and rename it to `.env.local`.

You may need to run backend and grader as well

## Todo

- fix auth flow
- migrate to next auth, google auth
- otog redesign
- cookie consent
- next.js 13 server component migration
- automatic rating system
- improve admin monitoring
- improve SEO

## Bug Report

If you have any issue, feel free to open a new one in the issue tab

## Contributing

Pull requests are welcome. : )
