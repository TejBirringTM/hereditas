# Family Tree Visualiser

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

To publish to the production environment:

1. Visit [Netlify Site Dashboard -> Deploys](https://app.netlify.com/sites/family-tree-visualiser/deploys)
2. Select the approved Deploy Preview from the list
3. Click 'Publish deploy'
