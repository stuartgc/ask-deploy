"use strict";

const c = require( "./../../lib/utils/constants" ),
    deployUtils = require( "./../../lib/deploy/deployUtils" ),
    fileUtils = require( "./../../lib/utils/fileUtils" ),
    utils = require( "./../../lib/utils/utils" );

describe( "DEPLOY UTILS", function() {
    const ENV = {
            LAMBDA: "lambda",
            LOCAL: "local"
        },
        KEYS = {
            INVOCATION: "interactionModel.languageModel.invocationName",
            LAMBDA_ARN: "deploy_settings.default.merge.manifest.apis.custom.endpoint.uri",
            LOCAL_URI: "manifest.apis.custom.endpoint.uri",
            NAME: "manifest.publishingInformation.locales.en-US.name",
            SKILL_ID: "deploy_settings.default.skill_id",
            SOURCE_DIR: "manifest.apis.custom.endpoint.sourceDir"
        },
        SOURCE_DIR = "lambda/custom",
        WORKING_DIR = process.cwd();

    let localConfig,
        lambdaConfig;

    before( function() {

        let p = new Promise( function( resolve, reject ) {
            fileUtils.readYml( c.PATH.CONFIG + ENV.LAMBDA )
            .then( ( config ) => {
                lambdaConfig = config;

                return fileUtils.readYml( c.PATH.CONFIG + ENV.LOCAL );
            } )
            .then( ( config ) => {
                localConfig = config;

                resolve();
            } )
            .catch( ( err ) => {
                reject( err );
            } );
        } );

        return p;
    } );

    beforeEach( function() {
        sinon.stub( process, "exit" );
    } );

    afterEach( function() {
        process.exit.restore();
    } );

    describe( "deployUtils.buildAndWriteConfig", function() {
        it( "Local - write local config file", function() {
            return deployUtils.buildAndWriteConfig( localConfig )
                .then( () => {
                    return fileUtils.read( WORKING_DIR + "/" + c.PATH.ASK_CONFIG + c.FILE.CONFIG );
                } )
                .then( ( data ) => {
                    data = JSON.parse( data );

                    expect( utils.get( KEYS.SKILL_ID, data ) ).to.equal( localConfig.skillId );
                } );
        } );

        it( "Lambda - write lambda config file", function() {
            return deployUtils.buildAndWriteConfig( lambdaConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.PATH.ASK_CONFIG + c.FILE.CONFIG );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.SKILL_ID, data ) ).to.equal( lambdaConfig.skillId );

                expect( utils.get( KEYS.LAMBDA_ARN, data ) ).to.equal( lambdaConfig.lambdaArn );
            } );
        } );
    } );

    describe( "deployUtils.buildAndWriteModel", function() {
        it( "Local - write local model file", function() {
            return deployUtils.buildAndWriteModel( localConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.PATH.MODEL + c.FILE.MODEL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.INVOCATION, data ) ).to.equal( localConfig.skillInvocation );
            } );
        } );

        it( "Lambda - write lambda model file", function() {
            return deployUtils.buildAndWriteModel( lambdaConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.PATH.MODEL + c.FILE.MODEL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.INVOCATION, data ) ).to.equal( lambdaConfig.skillInvocation );
            } );
        } );
    } );

    describe( "deployUtils.buildAndWriteSkill", function() {
        it( "Local - write local model file", function() {
            return deployUtils.buildAndWriteSkill( localConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.FILE.SKILL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.NAME, data ) ).to.equal( localConfig.skillName );

                expect( utils.get( KEYS.LOCAL_URI, data ) ).to.equal( localConfig.localUri );
            } );
        } );

        it( "Lambda - write lambda model file", function() {
            return deployUtils.buildAndWriteSkill( lambdaConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.FILE.SKILL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.NAME, data ) ).to.equal( lambdaConfig.skillName );

                expect( utils.get( KEYS.SOURCE_DIR, data ) ).to.equal( SOURCE_DIR );
            } );
        } );
    } );

    describe( "deployUtils.cleanup", function() {
        it( "Local - write local model file", function() {
            return deployUtils.buildAndWriteSkill( localConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.FILE.SKILL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.NAME, data ) ).to.equal( localConfig.skillName );

                expect( utils.get( KEYS.LOCAL_URI, data ) ).to.equal( localConfig.localUri );
            } );
        } );

        it( "Lambda - write lambda model file", function() {
            return deployUtils.buildAndWriteSkill( lambdaConfig )
            .then( () => {
                return fileUtils.read( WORKING_DIR + "/" + c.FILE.SKILL );
            } )
            .then( ( data ) => {
                data = JSON.parse( data );

                expect( utils.get( KEYS.NAME, data ) ).to.equal( lambdaConfig.skillName );

                expect( utils.get( KEYS.SOURCE_DIR, data ) ).to.equal( SOURCE_DIR );
            } );
        } );
    } );
} );
