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
4. Run `npm install` in the following locations:
   1. `/common`
   2. `/backend`
   3. `/frontend`

### Pull Requests

When you are ready to submit a pull request, make sure you merge from your branch into `dev`.

## Releases

Peridocially we will create release branches from `dev`. These branches will follow these naming conventions:

`r-devtest` or `r-<Major>-<Minor>-<Build>`

**`devtest`** is used for rapid iteration for testing docker images, or you could test locally.

**`<Major>-<Minor>-<Build>`** is used to create a new image per release, tagged with `r-<Major>-<Minor>-<Build>`

## Images

Images are automatically built when release branches get merged into main.

[TOP Backend](https://hub.docker.com/r/breyr/top-backend)

[TOP Frontend](https://hub.docker.com/r/breyr/top-frontend)

[TOP InterconnectAPI](https://hub.docker.com/r/breyr/top-interconnectapi)
