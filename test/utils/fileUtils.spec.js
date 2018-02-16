"use strict";

const c = require( "./../../lib/utils/constants" ),
    fileUtils = require( "./../../lib/utils/fileUtils" ),
    fs = require( "fs" );

describe( "FILE UTILS", function() {
    const FOO = "foo",
        WORKING_DIR = process.cwd();

    describe( "fileUtils.checkForFile", function() {
        it( "File exists", function() {
            expect( fileUtils.checkForFile( WORKING_DIR + "/" + c.PATH.MODEL + c.FILE.MODEL + c.TEMPLATE_EXTENSION ) ).to.be.true;
        } );

        it( "File does not exist", function() {
            expect( fileUtils.checkForFile( WORKING_DIR + "/" + c.PATH.MODEL + FOO ) ).to.be.false;
        } );
    } );

    describe( "fileUtils.confirmDirectoryExists", function() {
        it( "Folder does not previously exist", function() {
            const result = fs.rmdirSync( FOO );

            const func = () => {
                fileUtils.confirmDirectoryExists( FOO );

                expect( fs.existsSync( FOO ) ).to.be.true;
            };

            expect( func ).to.not.throw();
        } );

        it( "Folder previously exists", function() {
            const func = () => {
                fileUtils.confirmDirectoryExists( FOO );

                expect( fs.existsSync( FOO ) ).to.be.true;
            };

            expect( func ).to.not.throw();
        } );
    } );
} );
