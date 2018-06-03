# Tools

Seagull provides built-in tooling for all usecases developers might need when
building apps.
To keep complexity low and performance as high as possible, no resource-heavy
third party sledge hammers shall be used (ie: no webpack).
The most complicated tool in the stack shall be the typescript compiler itself,
but this dependency is used either way since the framework builts on top of it.

## Use Cases (currently)

* [ ] a live-reloading webserver that does compile, bundle and minify the app
* [ ] prerendering of app pages to a static HTML folder for trivial app hosting
* [ ] deployment of a statically prerendered HTML folder to AWS S3

... more to come, like a complete backend based on AWS lambda

## Architecture

Every type of file processing work thinkable is encapsulated into
straightforward classes that implement the [[IWorker]] interface.
These classes are then invoked in order by either a Chokidar file watcher
process or directly through some code command.
The composition of different Worker classes and their order of execution is
defined in the 'strategies' file.

## Hot to use

While the code and the strategies reside here in the 'tools' folder, ultimately
everything here is invoked through a vanilla javascript file located in 'bin'.
This way, every npm project that has seagull as a dependency can use the defined
scripts in 'bin' (declared through the `bin` field in seagull's package.json)
out of the box.
Keep in mind that the raw JS files in bin must have `chmod +x` set and that the
file contains the shebang line ontop of the file.
