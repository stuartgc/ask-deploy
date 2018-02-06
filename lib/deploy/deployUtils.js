"use strict";

/**
 * DEPLOY UTILS
 *
 */

const c = require( "./../utils/constants" ),
    configTpl = require( "./../template/config" ),
    e = require( "./../utils/enums" ),
    endpointTpl = require( "./../template/endpoint" ),
    fileUtils = require( "./../utils/fileUtils" ),
    shell = require( "shelljs" ),
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
                console.log( "Config successfully created\n" );

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
                    console.log( "Model successfully created\n" );

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
                    console.log( "Skill successfully created\n" );

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

    runDeploy: ( target ) => {
        let p = new Promise( function( resolve, reject ) {
            if ( !shell.which( "ask" ) ) {
                shell.echo( "This script requires ask-cli (npm install -g ask-cli)" );

                reject( "No ask-cli" );
            }

            console.log( "starting deploy...  be patient\n" );

            shell.exec( "ask deploy -t " + target, function( code, stdout, stderr ) {
                if ( stderr ) {
                    reject( stderr );
                    return;
                }

                resolve();
            } );
        } );

        return p;
    }
};

module.exports = deployUtils;
