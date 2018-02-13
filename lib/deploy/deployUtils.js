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
    str = require( "./../strings/deploy-en" ),
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
                console.log( str.STATUS.CREATED.CONFIG );

                resolve();
            } )
            .catch( ( err ) => {
                console.log( str.ERROR.WRITE.CONFIG + utils.get( "message", err, "" ) );

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
                    console.log( str.STATUS.CREATED.MODEL );

                    resolve();
                } )
                .catch( ( err ) => {
                    console.log( str.ERROR.WRITE.MODEL + utils.get( "message", err, "" ) );

                    reject( err );
                } );
            } )
            .catch( ( err ) => {
                console.log( str.ERROR.MISSING.MODEL_TEMPLATE + utils.get( "message", err, "" ) );

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
                    console.log( str.STATUS.CREATED.SKILL );

                    resolve();
                } )
                .catch( ( err ) => {
                    console.log( str.ERROR.WRITE.SKILL + utils.get( "message", err, "" ) );

                    reject( err );
                } );
            } )
            .catch( ( err ) => {
                console.log( str.ERROR.MISSING.SKILL_TEMPLATE + utils.get( "message", err, "" ) );

                reject( err );
            } );
        } );

        return p;
    },

    cleanup: ( options ) => {
        let p = new Promise( function( resolve, reject ) {
            if ( !options.persist ) {
                console.log( str.STATUS.CLEANUP );

                fileUtils.rm( c.PATH.ASK_CONFIG + c.FILE.CONFIG )
                .then( () => {
                    return fileUtils.rm( c.PATH.MODEL + c.FILE.MODEL )
                } )
                .then( () => {
                    return fileUtils.rm( c.FILE.SKILL )
                } )
                .then( resolve )
                .catch( ( err ) => {
                    console.log( str.ERROR.CLEANUP + utils.get( "message", err, "" ) );

                    reject( err );
                } );
            } else {
                resolve();
            }
        } );

        return p;
    },

    runDeploy: ( target ) => {
        let p = new Promise( function( resolve, reject ) {
            if ( !shell.which( "ask" ) ) {
                shell.echo( str.ERROR.MISSING.ASK_CLI );

                reject( e.error.NO_ASK_CLI );
            }

            console.log( str.STATUS.DEPLOYING );

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
