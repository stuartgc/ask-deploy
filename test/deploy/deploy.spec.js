"use strict";

const deploy = require( "./../../lib/deploy/deploy" ),
    c = require( "./../../lib/utils/constants" );

describe( "DEPLOY", function() {
    beforeEach( function() {
        sinon.stub( process, "exit" ).callsFake( ( arg ) => {
            return arg;
        } );
    } );

    afterEach( function() {
        process.exit.restore();
    } );

    describe( "deploy", function() {
        it( "Env missing - should return with error", function( done ) {
            deploy.deploy( null, {} );

            expect( process.exit.calledWith( 1 ) ).to.be.true;

            done();
        } );
    } );
} );
