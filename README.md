# One Tambon One Grader - OTOG

### Become a god of competitive programming, code and create algorithms efficiently.

### [http://otog.cf/](http://otog.cf/)

An online grader which was originally provided for POSN KKU center students but currently open for everybody.

## Original otog

This project is an upgrade version of

1. [OTOG-next](https://github.com/karnjj/OTOG-next): The newer version of otog but developed in Nextjs
2. OTOG_V2: The new version of otog built on javascript framework
3. [otog](https://github.com/phizaz/otog): The original otog grader which is no longer maintained

## Repositories

There are 3 main modules for otog which are

1. [otog-frontend](https://github.com/Anon-136/otog-frontend)
2. [otog-backend](https://github.com/karnjj/otog-api)
3. [otog-grader](https://github.com/karnjj/otog-grader)

## Running Locally

First, run yarn to install dependencies

```bash
yarn
```

(Note that you can also use `yarn --frozen-lockfile` instead if installed dependencies is too new)

After that, run yarn dev

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can use `.env.local.template` to set your local environment, just copy and rename it to `.env.local`.

You may need to run backend and grader as well

## Todo

- make it work with docker
- bring back old features of otog such as
  - contest scoreboard prizes (First Blood, Faster Than Light, Passed In One, One Man Solve)
  - otog announcement with WYSIWYG
- code sharing
- image caching
- improve admin monitor
- improve overall UX
- improve SEO

## Contributing

Pull requests are welcome. : )
