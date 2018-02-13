"use strict";

/**
 * DEPLOY
 *
 */

const c = require( "./../utils/constants" ),
    deployUtils = require( "./deployUtils" ),
    fileUtils = require( "./../utils/fileUtils" ),
    str = require( "../strings/en-US" ),
    utils = require( "./../utils/utils" );

let envData = null;

module.exports.deploy = ( env, options ) => {
    if ( !env || !options.target ) {
        console.error( str.ERROR.MISSING.ENV_OR_TARGET );

        process.exit(1);
    }

    console.log( str.STATUS.PREPARING.replace( "{env}", env ).replace( "{target}", options.target ) );

    fileUtils.readYml( c.PATH.CONFIG + env )
    .then( ( config ) => {
        if ( config ) {
            envData = config;

            return deployUtils.buildAndWriteConfig( envData );
        } else {
            console.log( str.ERROR.MISSING.CONFIG );

            process.exit(1);
        }
    } )
    .then( () => {
        return deployUtils.buildAndWriteModel( envData );
    } )
    .then( () => {
        return deployUtils.buildAndWriteSkill( envData );
    } )
    .then( () => {
        return deployUtils.runDeploy( options.target );
    } )
    .then( () => {
        return deployUtils.cleanup( options );
    } )
    .then( () => {
        console.log( str.STATUS.SUCCESS.replace( "{env}", env ).replace( "{target}", options.target ) );

        process.exit(0);
    } )
    .catch( ( err ) => {
        console.log( str.ERROR.DEPLOY + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};
