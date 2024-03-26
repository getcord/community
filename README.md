# Cord Community

The site is built on NextJS and deployed via Vercel.

Vercel: https://vercel.com/cord/community  
Cord Console application: https://console.cord.com/projects/564ddd42-7d11-4ac0-b22c-3bb4e95a3ce2  
Live on: https://community.cord.com, https://dat.cord.com

## Running community locally:

- Create a `.env` file with the variables in 1pass under `Community .env`
- `npm i`
- `./scripts/generate-localhost-certificates.sh` to generate your localhost certificates
- `npm run dev` or `export NODE_TLS_REJECT_UNAUTHORIZED=0 && npm run dev` to avoid SELF_SIGNED_CERT_IN_CHAIN errors

- Open https://local.cord.com:3000

## Deploying to production

Right now, 'production' is what you see on `https://community.cord.com/`. We're
deploying via Vercel, so all you need to do is commit to `master` and run
`git push`. If your commit doesn't ruin everything, prod will be updated
within a couple of minutes.

## Production env variables

Vercel has an automagic way to handle env variables. You can manage them here:
https://vercel.com/cord/community/settings/environment-variables
