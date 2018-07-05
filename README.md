# ask-deploy
Creates needed config files and deploys using Amazon's ask-cli `ask deploy`

### Install
* `nvm use 8.10.0` - latest version supported by Lambda
* `npm install -g ask-cli`
* `npm install -g ask-deploy`

### Usage
`ask-deploy <env> [options]`

Options:
````
 -t, --target <target>      deploy "lambda", "model", "skill" or "all" (default: all)
 -P, --persistFiles         do not delete generated files
 -S, --skipAudioValidation  skip audio file validation
 -v, --version              output the version number of ask-deploy
 -h, --help                 output usage information
````

### Setup
* create  `config/env_name.yml`
    * Lambda:
        ````
            ---
            skillName: 
            skillInvocation: 
            skillId: 
            lambdaArn:
            audioUrlPrefix:
        ````
    * Local:
        ````
            ---
            skillName: 
            skillInvocation: 
            skillId: 
            localUri:
            audioUrlPrefix: 
        ````
* `models/en-US.json`
    * rename to `models/en-US.json.tpl`
    * update invocation to `"invocationName": "{skillInvocation}"`
    * delete `models/en-US.env_name.json` files
* `skill.json`
    * rename to `skill.json.tpl`
    * update name to `"name": "{skillName}"`
    * update endpoint to `"endpoint": {endpointObj}`
     * delete `skill.env_name.json` files
* `.gitignore`
    * add:
        ````
        # ask-cli config folder
        .ask
        /models/en-US.json
        /skill.json
        /config/*.yml
        !/config/dev.yml
        !/config/prod.yml
        ````
* delete `.ask` directory

### Audio URL Validation

Incorporating audio is an essential part of skill development. Audio URLs can be directly written into the strings file, however this can become a nuisance as URLs are often long. To simply this, we use the `alexa-toolkit` library and include our audio references in the strings file as follows:
`<audio>welcome.mp3</audio>` . When a response is sent to the alexa-sdk, `alexa-toolkit` preprocess the string. It updates any `audio` tags by prepending a URL (defined in our environment variables) resulting in a string with fully formed SSML audio tags. 

When incorporating many audio tags into your strings file, it can be time consuming to verify if all the URLs are pointing to live files. To help with this, `ask-deploy` has a built in mechanism that verifies the existence of all `audio` tags within your strings file. Simply include the `audioUrlPrefix` variable in your configuration file, and when you run `ask-deploy` it will make sure all audio tags are pointing to a live remote file ensuring your skill doesn't unexpectedly crash.  
