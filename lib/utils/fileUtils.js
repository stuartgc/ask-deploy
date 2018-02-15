"use strict";

/**
 * FILE UTILS
 *
 */

const c = require( "./constants" ),
    fs = require( "fs" ),
    yaml = require( "js-yaml" );

const workingDir = process.cwd();

const fileUtils = {
    checkForDirectory: function( dir ) {
        if ( !fs.existsSync( dir ) ) {
            fs.mkdirSync( dir );
        }
    },

    checkForFile: function( path ) {
        try {
            const stat = fs.statSync( path );

            return true;
        } catch( err ) {
            return false;
        }
    },

    read: function( path ) {
        let p = new Promise( function( resolve, reject ){
            try {
                const data = fs.readFileSync( path, "utf8" );

                resolve( data )
            } catch ( err ) {
                console.error( err );

                reject( err );
            }
        });

        return p;
    },

    readTemplate: function( path ) {
        let p = new Promise( function( resolve, reject ){
            fileUtils.read( workingDir + "/" + path + c.TEMPLATE_EXTENSION, "utf8" )
            .then( ( data ) => {
                resolve( data );
            } )
            .catch( ( err ) => {
                console.error( err );

                reject( err );
            } )
        });

        return p;
    },

    readYml: function( path ) {
        let p = new Promise( function( resolve, reject ){
            try {
                const config = yaml.safeLoad( fs.readFileSync( workingDir + "/" + path + c.YML_EXTENSION, "utf8" ) );

                resolve( config )
            } catch ( err ) {
                console.error( err );

                reject( err );
            }
        });

        return p;
    },

    rm: function( path ) {
        let p = new Promise( function( resolve, reject ){
            try {
                fs.unlinkSync( path );

                resolve();
            } catch( err ) {
                reject( err );
            }
        });

        return p;
    },

    write: function( path, body ) {
        let p = new Promise( function( resolve, reject ){
            fs.writeFile( workingDir + "/" + path, body, ( err, data ) => {
                if ( err ) {
                    console.error( err );
                    reject( err );
                }

                // console.log( "[fileUtils::write] --> " + path );
                resolve();
            });
        });

        return p;
    }
};

module.exports = fileUtils;
