# pandemic-game

## Getting started
### Requirements:

- Nodejs and npm: most OSes have packages for this check [here](https://nodejs.org/en/download/)
- Install the dependencies: `npm install`

### Running in development mode
The development mode is intended to be used when developing locally on your machine. The webpack server is not really a production grade server, its just there so that you can start developing without having to jump through extra hoops.

Run: `npm run start:dev`

After this runs your browser should open on `http://localhost:9000`.

### Depoying to production:

Run: `npm run build`

The newly created assets will be placed in the `/dist` folder. The goal is for the contents of this folder to be copied to a web server like nginx or apache.

### Troubleshooting

__1__ - I've pulled the latest version of the code, and now nothing works!

Keep in mind that when pulling code from the repo it is a good idea to run `npm install` in order to get any new dependencies.


__2__ - I've already installed the dependencies but I still can't run the application.


If things don't work even after going through the previous step, remove the `/node_modules` folder and do `npm install`. This effectively installs the dependencies from a clean slate.
