"use strict";

/**
 * DEPLOY
 *
 */

const c = require( "./../utils/constants" ),
    configTpl = require( "./../template/config" ),
    e = require( "./../utils/enums" ),
    fileUtils = require( "./../utils/fileUtils" ),
    utils = require( "./../utils/utils" );



const writeConfig = ( template ) => {
    //TODO create ask directory
    // format body
    const body = JSON.stringify( JSON.parse( template ), null, 4 ) + "\n";

    fileUtils.write( c.PATH.ASK_CONFIG + c.FILE.CONFIG, body )
    .then( () => {
        console.log( "successs" );
    } )
    .catch( ( err ) => {
        process.exit(1);
    } );
}

module.exports.deploy = ( env, target ) => {
    if ( !env || !target) {
        console.error( "missing environment or target" );

        process.exit(1);
    }

    console.log( "Preparing to deploy " + env + " to " + target );

    fileUtils.readYml( c.PATH.CONFIG + env )
    .then( ( config ) => {
        let template;

        if ( utils.get( e.configKey.LAMBDA_ARN, config ) ) { //lambda
            template = JSON.stringify( utils.get( e.endpointType.LAMBDA, configTpl, {} ) );

            template = utils.replaceAll( template, {
                "{lambdaArn}": utils.get( e.configKey.LAMBDA_ARN, config, "" ),
                "{skillId}": utils.get( e.configKey.SKILL_ID, config, "" )
            } );
        } else { //local
            template = JSON.stringify( utils.get( e.endpointType.LOCAL, configTpl, {} ) );

            template = utils.replaceAll( template, {
                "{skillId}": utils.get( e.configKey.SKILL_ID, config, "" )
            } );
        }

        writeConfig( template );

        //TODO: write tpls
    } )
    .catch( ( err ) => {
        process.exit(1);
    } );
    //load config
    //
    // let AWSProfile = profileHelper.getAWSProfile(profile);
    // if (!AWSProfile) {
    //     console.warn('[Warn]: Lambda deployment skipped, since AWS credentials' +
    //         'for profile: [' + profile + '] is missing. CLI lambda functionalities can be' +
    //         " enabled by running `ask init` again to add 'aws_profile' to ASK cli_config");
    //     if (typeof callback === 'function' && callback) {
    //         callback();
    //     }
    //     return;
    // }
    // let updateLambdaList = [];
    // let createLambdaList = [];
    // for (let domain of Object.keys(skillInfo.endpointsInfo)) {
    //     for (let region of Object.keys(skillInfo.endpointsInfo[domain])) {
    //         separateLambdaCreateUpdate(skillInfo, domain, region, updateLambdaList, createLambdaList, profile);
    //     }
    // }
    // if (updateLambdaList.length === 0 && createLambdaList.length === 0) {
    //     console.log('[Info]: No lambda functions need to be deployed.');
    //     return;
    // }
    //
    // installNodeModule.install(skillInfo, process.cwd(), doDebug, () => {
    //     createLambda.createLambda(skillId, skillInfo.skillName, createLambdaList, AWSProfile, (generatedLambda) => {
    //         updateLambda.updateLambda(updateLambdaList, AWSProfile, () => {
    //             console.log('Lambda deployment finished.');
    //             if (typeof callback === 'function' && callback) {
    //                 callback(generatedLambda);
    //             }
    //         });
    //     });
    // });
};
