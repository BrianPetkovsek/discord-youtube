# discord-youtube
A YouTube wrapper that uses Discord RPC to show what you're watching using Rich Presence. Inspired by [discord-netflix](https://github.com/nirewen/discord-netflix)

# That's too much! I just want to use it!
You can download a prebuilt installer from [releases](https://github.com/BrianPetkovsek/discord-youtube/releases) if you want.

# Building yourself

## Prepairing the environment
You will need [Node.js](http://nodejs.org/en/download) installed and added to the PATH, so just download the installer and make sure to select the box to add to PATH.

## Running
You have to install the dependencies. So, just run `npm install` in the repo's folder.
Once it's done, run `npm start` to start the application.

## Building
The app also have a build method, used for distribution. It will generate a NSIS installer for the app, and a packaged version of it.
To build the app for distribution, run `npm run dist`.

# Contributing
If you have a suggestion, an implementation, a fix, you can fork this repo and make all the changes you want.
Then, when you're finished, you can open a pull request here.

# Contributors
* [Magic#6090](https://github.com/BrianPetkovsek)

# Inspired by [discord-netflix](https://github.com/nirewen/discord-netflix)
* [Nirewen#9011](http://github.com/nirewen)
* [Keyygan#0001](https://github.com/keyygan)
* [Dmfj#0001](https://github.com/dmfj)

# Errors
If Discord is not opened, or, for some reason, the RPC Client couldn't connect to it, an error will show in the app. It disappears in 15 seconds.
Even if Discord is not opened, you can still use the app as a normal YouTube wrapper.

# Previews
![Browsing](https://i.imgur.com/bQoeoeb.png)

![Watching](https://i.imgur.com/tQvzLJs.png)
