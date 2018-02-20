"use strict";

const env = require( "../env" )();

const deploy = require( "./../../lib/deploy/deploy" );

describe( "DEPLOY", function() {
    const ENV = "local",
        TARGET = "lambda";

    beforeEach( function() {
        sinon.stub( process, "exit" );
    } );

    afterEach( function() {
        process.exit.restore();
    } );

    describe( "deploy", function() {
        it( "Env missing - should return with error", function( done ) {
            deploy.deploy( null, { target: TARGET } );

            expect( process.exit.calledWith( 1 ) ).to.be.true;

            done();
        } );

        it( "Target missing - should return with error", function( done ) {
            deploy.deploy( ENV, {} );

            expect( process.exit.calledWith( 1 ) ).to.be.true;

            done();
        } );
    } );
} );
