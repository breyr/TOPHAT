# T.O.P. (Topology Orchestration Platform)

Tasks can be found [here](https://redinfra.atlassian.net/jira/software/projects/RED/boards/1)

## Developing

Use JIRA to create a new branch from `dev`

### Setting Up

1. Clone the repo
2. Add a .env file within `/backend` with the following:
   
   ```
   DATABASE_URL="postgres://demo:demo@localhost:5432/demo"
   SECRET_KEY="my_secret_key"
   ```
3. Run `npm install` in the root directory of this project.
  
### Starting Development Environment

1. Run `docker compose -f compose.dev.yaml up --build`

   This runs the postgres db and interconnect api container.
   
2. Run `npm run dev:backend` and `npm run dev:frontend` within the project root.

### Pull Requests

When you are ready to submit a pull request, make sure you merge from your branch into `dev`.

## Releases

Peridocially we will create release branches from `dev`. These branches will follow these naming convention:

`release-<Major>-<Minor>-<Build>`

**`<Major>-<Minor>-<Build>`** is used to create a new image per release, tagged with `release-<Major>-<Minor>-<Build>`

### Steps for release:

1. Create release branch from dev
2. Make any changes in that release branch to make sure everything builds
3. Merge release branch into main
4. Merge main into dev

## Images

Images are automatically built when release branches get merged into main.

[TOP Backend](https://hub.docker.com/r/breyr/top-backend)

[TOP Frontend](https://hub.docker.com/r/breyr/top-frontend)

[TOP InterconnectAPI](https://hub.docker.com/r/breyr/top-interconnectapi)
