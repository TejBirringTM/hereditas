# Family Tree Visualiser

## Environment

Before developing, testing, or building, ensure that you create two environment files:

* `.env` - development and testing
* `.env.production` - building for deployment

All environment files use the following schema:

| environment variable | description | example |
|--|--|--|
| VITE_SERVER_URL | The URL of the Family Tree Visualisation server | http://localhost:9190 |
| VITE_POSTHOG_PUBLIC_API_KEY | The API key for the PostHog project |  |
| VITE_POSTHOG_HOST_URL | The URL of the PostHog server assigned to the project | https://eu.i.posthog.com |

## Deployment

The Single Page Application is deployed on the Netlify platform which utilises a content delivery network (CDN) to deliver static content.

The [Netlify CLI](https://docs.netlify.com/cli/get-started/) is used to upload the built site to the platform.

### Steps to Deploy (Preview)

1. Log in to Netlify account

    `netlify login`

2. Build the project

    `npm run build`

3. Deploy the project (as preview)

    `netlify deploy --site family-tree-visualiser --dir ./dist`

### Steps to Deploy (Production)

Once a preview has been deployed (as explained above), it will either be rejected (deleted), kept for internal use (e.g. debugging), or approved for production.

The production site is served on:

`https://family-tree-visualiser.netlify.app`

#### Option 1: Promote a Deployment Preview to Production

To promote a deployment preview to a production deployment:

1. Visit [Netlify Site Dashboard -> Deploys](https://app.netlify.com/sites/family-tree-visualiser/deploys)
2. Select the approved Deploy Preview from the list
3. Click 'Publish deploy'

#### Option 2: Create a Production Deployment

Alternatively, the following command may be used to create a production deployment directly:

`netlify deploy --site family-tree-visualiser --dir ./dist`
