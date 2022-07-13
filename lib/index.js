const core = require("@actions/core")
const { getInputs, login, build, tagAndPush } = require("./utils")

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

		// tag and tagAndPush
		const taggedImages = tagAndPush(args.tags, images)

		// return tags
		core.setOutput("images", taggedImages)
	} catch (error) {
		core.setFailed(error.message)
	}
}

// start the process
run()
