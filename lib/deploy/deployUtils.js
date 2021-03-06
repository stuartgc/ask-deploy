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
    str = require( "../strings/en-US" ),
    urlExists = require('url-exists'),
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

            fileUtils.confirmDirectoryExists( c.PATH.ASK_CONFIG );

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
    },

    /**
    * Validate the strings file (lambda/custom/strings/en-us.js)
    * - Check that all audio files referenced in the strings file exist on the server
    */
    validateStrings: ( envData, skipAudioValidation ) => {
        let p = new Promise( function( resolve, reject ) {
            fileUtils.read( c.PATH.STRINGS + c.FILE.STRINGS )
            .then( ( data ) => {
                if ( skipAudioValidation ){
                    return resolve();
                }

                let audioPath = utils.get( e.configKey.AUDIO_URL_PREFIX, envData, "" );

                const pattern =  /<audio>(.*?)<\/audio>/g;

                const tags = data.match( pattern );

                if ( tags ) {
                    const fileNames = tags.map( function ( val ) {
                        return val.replace( /<\/?audio>/g, '' );
                    } );

                    let files = [];

                    if ( audioPath.length === 0 && fileNames.length > 0 ){
                        return reject( { message: str.ERROR.MISSING.AUDIO_URL_PREFIX } );
                    }

                    for ( let i = 0; i <= fileNames.length; i++ ) {
                        if ( !fileNames[i] ){
                            continue;
                        }

                        let filePath = audioPath + fileNames[i];

                        files.push( filePath );
                    }

                    if ( files.length > 0 ){
                        console.log("Checking if file references exist...")

                        return deployUtils.checkIfFilesExist( files, ( success, err ) => {
                            if ( success ){
                                resolve();
                            } else {
                                reject( err );
                            }
                        } );
                    }
                }

                resolve();
            } )
            .catch( err => {
                reject( err );
            } );
        } );

        return p;
    },

    checkIfFilesExist( files, callback ){
        if ( files.length > 0 ){
            // remove the first file from the array
            let file = files.shift();

            // check if it exists
            process.stdout.write( file + " ... " );

            // initialize variable that holds verified files
            if ( !deployUtils.verifiedFiles ){
                deployUtils.verifiedFiles = {};
            }

            // check if file was already verified, and skip urlExists call if so.
            if ( deployUtils.verifiedFiles[ file ] ){
                if ( files.length > 0 ){
                    process.stdout.write( "exists\n" );

                    // continue checking remaining files
                    deployUtils.checkIfFilesExist( files, callback );
                } else {
                    callback( true );
                }
                return;
            }

            // check if file is reachable
            urlExists( file, function( err, exists ) {
                if ( exists ){
                    process.stdout.write( "exists\n" );

                    deployUtils.verifiedFiles[ file ] = true;

                    // continue checking remaining files
                    deployUtils.checkIfFilesExist( files, callback );
                } else {
                    process.stdout.write("ERROR NOT FOUND\n" );

                    let error = { message: str.ERROR.AUDIO_FILES + ": " + file } ;

                    callback( false, error );
                }
            });
        } else {
            callback( true );
        }
    }
};

module.exports = deployUtils;
