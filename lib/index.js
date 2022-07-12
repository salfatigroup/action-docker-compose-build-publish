const core = require("@actions/core")
const { getInputs, login, build, push } = require("./utils")

/**
 * Main action function.
 * Build and pubslish the docker compose images.
 */
async function run() {
	core.debug(`Environment Variables: ${JSON.stringify(process.env, null, 2)}`)

	try {
		// get the user inputs
		const args = getInputs()

		// login to github docker registry
		await login(args.repoRef, args.token)

		// build the docker compose images
		const images = await build(args.dockerComposeFile)

		// tag and push
		await push(args.dockerComposeFile)

		// return tags
		core.setOutput("images", images)
	} catch (error) {
		core.setFailed(error.message)
	}
}

// start the process
run()
