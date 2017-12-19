This directory contains shared libraries used by each of the clients.

TODO:
* Expand the deviceGUID.json file to include config info needed by the client to connect to a server.
* Change `support_files` directory to `output-files`
* Move the config.json file to the new `output-files` directory.
* Client specific files go into the internal lib directory. Generic functions get moved to the `lib`
directory in the parent `client` directory.
* Try to move the shell scripts to the local `lib` folder. Need to see if I can still execute them with
`execa`.
