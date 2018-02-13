#!/usr/bin/env node
"use strict";

const str = require( "./../lib/strings/en-US" );

if ( !require( "semver" ).eq( process.version, "6.10.2" ) ) {
    console.log( str.ERROR.NODE_VERSION );

    return;
}

const c = require( "./../lib/utils/constants" ),
      deploy = require( "./../lib/deploy/deploy" ),
      program = require( "commander" ),
      utils = require( "./../lib/utils/utils" );

let configEnv = null,
    options = null;

//TODO: add support for debug flag
program
.usage( '<env> [options]' )
.description( str.INFO.DESCRIPTION )
.option( '-t, --' + c.OPTIONS.TARGET + ' <target>', str.INFO.OPTIONS.TARGET, /^(lambda|model|skill|all)$/i, 'all' )
.option( '-P, --' + c.OPTIONS.PERSIST_FILES, str.INFO.OPTIONS.PERSIST )
.option( "-v, --version", str.INFO.OPTIONS.VERSION , () => {
    console.log( require( "../package.json" ).version );

    process.exit( 0 );
} )
.action( function( env, opts ) {
    configEnv = env;

    options = {
        persist: utils.get( c.OPTIONS.PERSIST_FILES, opts ),
        target: utils.get( c.OPTIONS.TARGET, opts )
    };
} )
.parse( process.argv );

if ( configEnv && options.target ) {
    deploy.deploy( configEnv, options );
} else {
    program.outputHelp();

    process.exit( 1 );
}
