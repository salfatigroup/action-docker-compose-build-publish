const core = require("@actions/core")
const { execSync } = require("child_process")

/**
 * Load the user action inputs
 */
module.exports.getInputs = () => {
	const inputs = {
		dockerComposeFile: core.getInput("docker_compose_file"),
		buildArgs: core.getInput("build_args", { required: false }).split(",").map(a => a.trim()).filter(a => a.length > 0),
		token: process.env.REPO_TOKEN,
		repoRef: process.env.GITHUB_REF,
		tags: core.getInput("tags", { required: false }).split(",").map(a => a.trim()).filter(a => a.length > 0)
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
	console.log(userBuildArgs)
	const buildArgs = userBuildArgs.map(arg => `--build-arg ${arg}`).join(" ")
	const cmd = `docker compose -f ${dockerComposeFile} build ${buildArgs}`
	execSync(cmd)

	// get the images from the built images
	const imgCmd = 'docker images --filter "dangling=false" --format "{{.Repository}}" | grep ghcr.io'
	const stdout = execSync(imgCmd).toString()
	const images = stdout.split("\n")
	return images
}

/**
 * Tag and push the docker compose images
 * each image run docker tag and then docker push
 */
module.exports.tagAndPush = (tags, images) => {
	const taggedImages = []

	images.forEach(image => {
		tags.forEach(tag => {
			if (image.length && tag.length) {
				const cmd = `docker tag ${image} ${image}:${tag}`
				console.log(`Executing: ${cmd}`)
				execSync(cmd)

				const pushCmd = `docker push ${image}:${tag}`
				console.log(`Executing: ${pushCmd}`)
				execSync(pushCmd)

				taggedImages.push(`${image}:${tag}`)
			}
		})
	})

	return taggedImages
}
