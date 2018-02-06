"use strict";

/**
 * DEPLOY UTILS
 *
 */

const c = require( "./../utils/constants" ),
    cmd=require('node-cmd'),
    configTpl = require( "./../template/config" ),
    e = require( "./../utils/enums" ),
    endpointTpl = require( "./../template/endpoint" ),
    fileUtils = require( "./../utils/fileUtils" ),
    fork = require('child_process').fork,
    shell = require( "shelljs" ),
    { spawn } = require('child_process'),
    utils = require( "./../utils/utils" );

const deployUtils = {
    buildAndWriteConfig: ( envData ) => {
        let p = new Promise( function( resolve, reject ) {
            let template;

            if ( utils.get( e.configKey.LAMBDA_ARN, envData ) ) { //lambda
                template = JSON.stringify( utils.get( e.endpointType.LAMBDA, configTpl, {} ) );

                template = utils.replaceAll( template, {
                    "{lambdaArn}": utils.get( e.configKey.LAMBDA_ARN, envData, "" ),
                    "{skillId}": utils.get( e.configKey.SKILL_ID, envData, "" )
                } );
            } else { //local
                template = JSON.stringify( utils.get( e.endpointType.LOCAL, configTpl, {} ) );

                template = utils.replaceAll( template, {
                    "{skillId}": utils.get( e.configKey.SKILL_ID, envData, "" )
                } );
            }

            // format body
            const body = JSON.stringify( JSON.parse( template ), null, 4 ) + "\n";

            fileUtils.checkForDirectory( c.PATH.ASK_CONFIG );

            fileUtils.write( c.PATH.ASK_CONFIG + c.FILE.CONFIG, body )
            .then( () => {
                console.log( "Config successfully created" );

                resolve();
            } )
            .catch( ( err ) => {
                console.log( "Config Write Error --> " + utils.get( "message", err, "" ) );

                reject( err );
            } );
        } );

        return p;
    },

    buildAndWriteModel: ( envData ) => {
        let p = new Promise( function( resolve, reject ) {
            fileUtils.readTemplate( c.PATH.MODEL + c.FILE.MODEL )
            .then( ( data ) => {
                data = utils.replaceAll( data, {
                    "{skillInvocation}": utils.get( e.configKey.SKILL_INVOCATION, envData, "" )
                } );

                const body = JSON.stringify( JSON.parse( data ), null, 4 ) + "\n";

                fileUtils.write( c.PATH.MODEL + c.FILE.MODEL, body )
                .then( () => {
                    console.log( "Model successfully created" );

                    resolve();
                } )
                .catch( ( err ) => {
                    console.log( "Model Write Error --> " + utils.get( "message", err, "" ) );

                    reject( err );
                } );
            } )
            .catch( ( err ) => {
                console.log( "Model Error --> " + utils.get( "message", err, "" ) );

                reject( err );
            } );
        } );

        return p;
    },

    buildAndWriteSkill: ( envData ) => {
        let p = new Promise( function( resolve, reject ) {
            fileUtils.readTemplate( c.FILE.SKILL )
            .then( ( data ) => {
                let endpoint;

                if ( utils.get( e.configKey.LAMBDA_ARN, envData ) ) { //lambda
                    endpoint = JSON.stringify( utils.get( e.endpointType.LAMBDA, endpointTpl, {} ) );
                } else {
                    endpoint = utils.get( e.endpointType.LOCAL, endpointTpl, {} );
                    if ( endpoint.uri ) {
                        endpoint.uri = utils.get( e.configKey.LOCAL_URI, envData, "" );
                    }

                    endpoint = JSON.stringify( endpoint );
                }

                data = utils.replaceAll( data, {
                    "{endpointObj}": endpoint,
                    "{skillName}": utils.get( e.configKey.SKILL_NAME, envData, "" )
                } );

                const body = JSON.stringify( JSON.parse( data ), null, 4 ) + "\n";

                fileUtils.write( c.FILE.SKILL, body )
                .then( () => {
                    console.log( "Skill successfully created" );

                    resolve();
                } )
                .catch( ( err ) => {
                    console.log( "Skill Write Error --> " + utils.get( "message", err, "" ) );

                    reject( err );
                } );
            } )
            .catch( ( err ) => {
                console.log( "Skill Error --> " + utils.get( "message", err, "" ) );

                reject( err );
            } );
        } );

        return p;
    },

    runDeploy1: ( target ) => {
        let p = new Promise( function( resolve, reject ) {
            if ( !shell.which( "ask" ) ) {
                shell.echo( "This script requires ask-cli (npm install -g ask-cli)" );

                reject( "No ask-cli" );
            }

            if ( !shell.which( "nvm" ) ) {
                shell.echo( "This script requires nvm" );

                reject( "No ask-cli" );
            }

            console.log( "before: " + shell.exec( 'node --version' ).stdout );
            // shell.exec( "nvm use 6.10" ).stdout;
            // console.log( "after: " + shell.exec( 'node --version' ).stdout );

            console.log( "starting deploy...  be patient" );

            shell.exec( "ask deploy -t " + target, function( code, stdout, stderr ) {
                console.log( "Exit code:", code );
                console.log( "Program output:", stdout );
                console.log( "Program stderr:", stderr );

                if ( stderr ) {
                    reject( stderr );
                    return;
                }

                resolve();
            } );
        } );

        return p;
    },

    runDeploy2: ( target ) => {
        let p = new Promise( function( resolve, reject ) {
            // if ( !shell.which( "ask" ) ) {
            //     shell.echo( "This script requires ask-cli (npm install -g ask-cli)" );
            //
            //     reject( "No ask-cli" );
            // }
            //
            // if ( !shell.which( "nvm" ) ) {
            //     shell.echo( "This script requires nvm" );
            //
            //     reject( "No ask-cli" );
            // }
            cmd.get(
                `
                    nvm use 6.10
                    ask deploy -t all
                `,
                function( err, data, stderr ) {
                    if ( !err ) {
                        console.log( 'the node-cmd cloned dir contains these files :\n\n', data )
                    } else {
                        console.log( 'error', err )
                    }

                }
            );
        } );

        return p;
    },

    runDeploy3: ( target ) => {
        let p = new Promise( function( resolve, reject ) {

            const child = spawn( 'ask deploy -t all', {
                stdio: 'inherit',
                shell: true
            } );
        } );

        return p;
    },

    runDeploy4: ( target ) => {
        let p = new Promise( function( resolve, reject ) {

            let setup = {
                execPath: '~/.nvm/v6.10.2/bin/node',   // path to binary
                cwd: process.cwd(),
                stdio: [ 0, 1, 2, 'ipc' ]       // [process.stdin, process.stdout, process.stderr, ipc]
            };

            let child = fork( 'ask deploy -t all', setup );
        } );

        return p;
    }
};

module.exports = deployUtils;
