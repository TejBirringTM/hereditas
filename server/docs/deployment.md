# Deployment

The project is hosted using [Deno Deploy](https://docs.deno.com/deploy/manual/)
under the project name `hereditas`.

[Deno Deploy](https://docs.deno.com/deploy/manual/) is a serverless platform for
JavaScript, TypeScript, and WebAssembly projects that hosts code on
globally-distributed managed servers (think edge computing), but in
[V8 isolates](https://deno.com/blog/anatomy-isolate-cloud) rather than virtual
machines. The platform exclusively hosts applications using the
[Deno runtime environment](https://docs.deno.com/runtime/manual) — which is the
target runtime environment for this particular server implementation.

## Commands

The [`deployctl`](https://docs.deno.com/deploy/manual/deployctl/) utility is
used to deploy the server.

### Check status

To check the status of the project:

`deployctl projects show hereditas`

### Deployments

#### List all deployments

`deployctl deployments list --project hereditas`

#### Get details of a deployment

`deployctl deployments show <deployment-id>`

### Create a new deployment

deployctl deploy --project hereditas --entrypoint main.ts

### Delete a deployment

`deployctl deployments delete <deployment-id>`

## Production Deployment

Only one deployment points to the production URL (`https://hereditas.deno.dev`).
In order to promote a deployment to production, visit the
[dashboard](https://dash.deno.com/projects/hereditas/deployments) and select
'Promote to Production' on the chosen deployment.

## Deployment Environment

Visit the [dashboard](https://dash.deno.com/projects/hereditas/settings) in
order to change environment variables exposed to deployments.
