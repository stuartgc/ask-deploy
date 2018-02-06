"use strict";

/**
 * DEPLOY
 *
 */

const c = require( "./../utils/constants" ),
    configTpl = require( "./../template/config" ),
    e = require( "./../utils/enums" ),
    endpointTpl = require( "./../template/endpoint" ),
    fileUtils = require( "./../utils/fileUtils" ),
    utils = require( "./../utils/utils" );

let envData = null;

const buildAndWriteConfig = () => {
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

        return;
    } )
    .catch( ( err ) => {
        console.log( "Config Error --> " + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};

const buildAndWriteModel = () => {
    fileUtils.readTemplate( c.PATH.MODEL + c.FILE.MODEL )
    .then( ( data ) => {
        data = utils.replaceAll( data, {
            "{skillInvocation}": utils.get( e.configKey.SKILL_INVOCATION, envData, "" )
        } );

        const body = JSON.stringify( JSON.parse( data ), null, 4 ) + "\n";

        fileUtils.write( c.PATH.MODEL + c.FILE.MODEL, body );
    } )
    .then( () => {
        console.log( "Model successfully created" );

        return;
    } )
    .catch( ( err ) => {
        console.log( "Model Error --> " + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};

const buildAndWriteSkill = () => {
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

        fileUtils.write( c.FILE.SKILL, body );
    } )
    .then( () => {
        console.log( "Skill successfully created" );

        return;
    } )
    .catch( ( err ) => {
        console.log( "Skill Error --> " + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};

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

            buildAndWriteConfig();

            buildAndWriteModel();

            buildAndWriteSkill();
        } else {
            console.log( "Deployment config not found" );

            process.exit(1);
        }
    } )
    .then( () => {
        // process.exit(0);
    } )
    .catch( ( err ) => {
        console.log( "Deploy Config Error --> " + utils.get( "message", err, "" ) );

        process.exit(1);
    } );
};
