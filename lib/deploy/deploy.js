"use strict";

/**
 * DEPLOY
 *
 */

const c = require( "./../utils/constants" ),
    deployUtils = require( "./deployUtils" ),
    fileUtils = require( "./../utils/fileUtils" ),
    utils = require( "./../utils/utils" );

let envData = null;

module.exports.deploy = ( env, target ) => {
    if ( !env || !target) {
        console.error( "missing environment or target" );

        process.exit(1);
    }

    console.log( "Preparing to deploy " + env + " to " + target );

    fileUtils.readYml( c.PATH.CONFIG + env )
    .then( ( config ) => {
        if ( config ) {
            envData = config;

            return deployUtils.buildAndWriteConfig( envData );
        } else {
            console.log( "Deployment config not found" );

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
        // process.exit(0);
        console.log( "after" )
    } )
    .catch( ( err ) => {
        console.log( "Deploy Config Error --> " + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};
