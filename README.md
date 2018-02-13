# ask-deploy
Creates needed config files and deploys using ask-cli's `ask deploy`

### Install
* `nvm use 6.10.2` - latest version supported by Lambda 
* `npm install -g ask-cli`
* `npm install -g ask-deploy`

### Usage
`ask-deploy <env> [options]`

Options:
````
 -t, --target <target>  deploy "lambda", "model", "skill" or "all" (default: all)
 -P, --persistFiles     do not delete generated files
 -v, --version          output the version number of ask-deploy
 -h, --help             output usage information
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
        ````
    * Local:
        ````
            ---
            skillName: 
            skillInvocation: 
            skillId: 
            localUri:
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
