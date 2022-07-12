const core = require("@actions/core")
const { execSync } = require("child_process")

/**
 * Load the user action inputs
 */
module.exports.getInputs = () => {
	const inputs = {
		dockerComposeFile: core.getInput("docker_compose_file"),
		buildArgs: core.getInput("build_args", { required: false }).split(","),
		token: process.env.REPO_TOKEN,
		repoRef: process.env.GITHUB_REF
	}

	console.log(`docker-compose location: ${inputs.dockerComposeFile}`)

	return inputs
}

/**
 * Login to github docker registry
 */
module.exports.login = (repoRef, token) => {
	const cmd = `docker login ghcr.io -u ${repoRef} -p ${token}`
	console.log(`Executing: ${cmd}`)
	execSync(cmd)
}

/**
 * Build the docker compose images
 */
module.exports.build = (dockerComposeFile, userBuildArgs = []) => {
	// userBuildArgs is an array of strings with the following format:
	// ["key1=value1", "key2=value2"]
	const buildArgs = userBuildArgs.map(arg => `--build-arg ${arg}`).join(" ")
	const cmd = `docker compose -f ${dockerComposeFile} build ${buildArgs}`
	execSync(cmd)

	// get the images from the built images
	const imgCmd = 'docker images --filter "dangling=false" --format "{{.Repository}}:{{.Tag}}" | grep ghcr.io'
	const stdout = execSync(imgCmd)
	const images = stdout.split("\n")
	return images
}

/**
 * Tag and push the docker compose images
 */
module.exports.push = (dockerComposeFile) => {
	const cmd = `docker compose -f ${dockerComposeFile} push`
	execSync(cmd)
}
