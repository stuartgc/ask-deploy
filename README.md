# ask-deploy
Creates needed config files and deploys using ask-cli `ask deploy`

### Install
* `nvm use 6.10.2`
* `npm install -g ask-cli`
* `npm install -g git+ssh://github.com/Hearst-DD/ask-deploy.git#v0.1.1`

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
* `skill.json`
    * rename to `skill.json.tpl`
    * update name to `"name": "{skillName}"`
    * update endpoint to `"endpoint": {endpointObj}`
* `.gitignore`
    * add:
        ````
        # ask-cli config folder
        .ask
        /models/en-US.json
        /skill.json
        ````
