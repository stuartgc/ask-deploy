#!/usr/bin/env node
"use strict";

if ( !require( "semver" ).gte( process.version, "6.10.0")) {
    console.log( "Version of node.js doesn't meet minimum requirement.") ;
    console.log( "Please ensure system has node.js version 6.10.0 or higher." );

    return;
}

const commander = require( "commander" );

commander
.description( "Deploy wrapper for Command Line Interface for Alexa Skill Management API" )
.usage( '[options] <config_name ...>' )
.option( '-t, --target <target>', 'deploy "lambda", "model", "skill" or "all"' )
.option( '-h, --help', 'output usage information', () => {
    console.log( CONSTANTS.COMMAND.DEPLOY.HELP_DESCRIPTION );

    process.exit( 0 );
})
.option( "-v, --version", "output the version number of ask-deploy" , () => {
    console.log( require( "../package.json" ).version );

    process.exit( 0 );
} )
.parse( process.argv );

if ( !process.argv.slice( 2 ).length ) {
    commander.outputHelp();
} else {
    if ( [ 'deploy', 'help' ]
        .indexOf( process.argv[ 2 ]) === -1 ) {
        console.log( 'Command not recognized. Please run "ask-deploy" for help.' );
    }
}
