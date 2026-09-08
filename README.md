This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local development gotchas

**Installing the Supabase CLI can fail for memory reasons that look like
network reasons.** `pnpm add -D supabase` pulls a single 59.38 MB platform
binary (`@supabase/cli-windows-x64`), and pnpm restarts that download from
zero on every retry — so a slow or interrupted connection never makes
forward progress. On a machine low on free RAM (we hit 150 MB free, with
Chrome holding several GB), the install gets OOM-killed partway through and
reports a timeout, which sends you chasing the network instead of the real
cause. If it fails repeatedly: close memory-heavy apps first, then retry.
To confirm the network itself is fine, `curl -C - -o /tmp/cli.tgz <tarball
url>` resumes across attempts and will complete where pnpm cannot.
