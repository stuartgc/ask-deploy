"use strict";

const env = require( "../env" )();

const c = require( "./../../lib/utils/constants" ),
    e = require( "./../../lib/utils/enums" ),
    fileUtils = require( "./../../lib/utils/fileUtils" ),
    fs = require( "fs" ),
    utils = require( "./../../lib/utils/utils" );

describe( "FILE UTILS", function() {
    const ENV = {
            LOCAL: "local"
        },
        ERROR = {
            IS_DIRECTORY: "EISDIR",
            NOT_FOUND: "ENOENT"
        },
        FILE_DATA = {
            foo: "bar"
        },
        FOO = "foo",
        FOO_FILE = "foo.json",
        KEYS = {
            INVOCATION: "interactionModel.languageModel.invocationName"
        },
        LOCAL_URI = "https://localhost",
        WORKING_DIR = process.cwd();

    after( function() {
        if ( fileUtils.checkForFile( FOO_FILE ) ) {
            fileUtils.rm( FOO_FILE );
        }

        if ( fs.existsSync( FOO ) ) {
            const result = fs.rmdirSync( FOO );
        }
    } );

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
            if ( fs.existsSync( FOO ) ) {
                const result = fs.rmdirSync( FOO );
            }

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

    describe( "fileUtils.read", function() {
        it( "File read and expected data returned", function() {
            const func = () => {
                return fileUtils.read( WORKING_DIR + "/" + c.PATH.MODEL + c.FILE.MODEL + c.TEMPLATE_EXTENSION )
                    .then( ( data ) => {
                        data = JSON.parse( data );

                        expect( utils.get( KEYS.INVOCATION, data ) ).to.equal( "{" + e.configKey.SKILL_INVOCATION + "}" );
                    } );
            };

            expect( func ).to.not.throw();
        } );

        it( "File not found", function() {
            return fileUtils.read( FOO_FILE )
                .catch( ( err ) => {
                    expect( err.code ).to.equal( ERROR.NOT_FOUND );
                } );
        } );
    } );

    describe( "fileUtils.readTemplate", function() {
        it( "File read and expected data returned", function() {
            const func = () => {
                return fileUtils.readTemplate( c.PATH.MODEL + c.FILE.MODEL )
                .then( ( data ) => {
                    data = JSON.parse( data );

                    expect( utils.get( KEYS.INVOCATION, data ) ).to.equal( "{" + e.configKey.SKILL_INVOCATION + "}" );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "File not found", function() {
            return fileUtils.readTemplate( FOO )
            .catch( ( err ) => {
                expect( err.code ).to.equal( ERROR.NOT_FOUND );
            } );
        } );
    } );

    describe( "fileUtils.readYml", function() {
        it( "File read and expected data returned", function() {
            const func = () => {
                return fileUtils.readYml( c.PATH.CONFIG + ENV.LOCAL )
                .then( ( data ) => {
                    expect( utils.get( e.configKey.LOCAL_URI, data ) ).to.equal( LOCAL_URI );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "File not found", function() {
            return fileUtils.readYml( FOO )
            .catch( ( err ) => {
                expect( err.code ).to.equal( ERROR.NOT_FOUND );
            } );
        } );
    } );

    describe( "fileUtils.write", function() {
        it( "File written with expected data", function() {
            const func = () => {
                return fileUtils.write( FOO_FILE, JSON.stringify( FILE_DATA ) )
                .then( () => {
                    return fileUtils.read( FOO_FILE );
                } )
                .then( ( data ) => {
                    data = JSON.parse( data );

                    expect( data ).to.equal( FILE_DATA );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "File not found", function() {
            return fileUtils.write( "/", JSON.stringify( FILE_DATA ) )
            .catch( ( err ) => {
                expect( err.code ).to.equal( ERROR.IS_DIRECTORY );
            } );
        } );
    } );

    describe( "fileUtils.rm", function() {
        it( "Delete file", function() {
            const func = () => {
                return fileUtils.rm( FOO_FILE )
                .then( () => {
                    expect( fileUtils.checkForFile( FOO_FILE ) ).to.be.false;
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "File not found", function() {
            return fileUtils.rm( FOO_FILE )
            .catch( ( err ) => {
                expect( err.code ).to.equal( ERROR.NOT_FOUND );
            } );
        } );
    } );
} );
