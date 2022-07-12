const core = require("@actions/core")
const { getInputs, login, build, push } = require("./utils")

/**
 * Main action function.
 * Build and pubslish the docker compose images.
 */
function run() {
	core.debug(`Environment Variables: ${JSON.stringify(process.env, null, 2)}`)

	try {
		// get the user inputs
		const args = getInputs()

		// login to github docker registry
		login(args.repoRef, args.token)

		// build the docker compose images
		const images = build(args.dockerComposeFile, args.buildArgs)

		// tag and push
		push(args.dockerComposeFile)

		// return tags
		core.setOutput("images", images)
	} catch (error) {
		core.setFailed(error.message)
	}
}

// start the process
run()
