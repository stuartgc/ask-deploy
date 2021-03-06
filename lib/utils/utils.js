"use strict";

/**
 * UTILS
 *
 */

/**
 *  Public Methods
 */
const utils = {
    /**
     * errorCheckCallback checks that a callback function is valid,
     * otherwise defines an empty function and returns it
     */
    errorCheckCallback: function( callback ) {
        // Check for valid callback, add default if needed
        return callback === undefined || typeof callback !== "function" ? function() {
        } : callback;
    },

    /**
     * Attempts to retrieve a value from a source object. If
     * the value couldn't be found, returns false or a specified
     * fallback value.
     *
     * @param  {string} key      Key of value to be retrieved. Can also be
     *                           specified using dot notation to retrieve
     *                           nested values. Ex: "content.title"
     * @param  {object} source   Source object.
     * @param  {mixed}  fallback Value to be returned if key could not be
     *                           retrieved.
     * @return {mixed}           Value of the key, false, or specified fallback
     */
    get: function( key, source, fallback ) {
        // use provided default or false
        fallback = ( typeof fallback === "undefined" ) ? false : fallback;

        if ( !key || !source ) {
            return fallback;
        }

        // get the key parts
        let parts = key.split( "." );

        // shift the first key off the front
        key = parts.shift();

        // if the source doesn't contain the key, return the fallback
        if (
            !source ||
            !Object.prototype.hasOwnProperty.call( source, key ) ||
            typeof source[ key ] === "undefined"
        ) {
            return fallback;
        }

        // if there are left over key parts, recurse. otherwise return the value
        return parts.length ? this.get( parts.join( "." ), source[ key ], fallback ) : source[ key ];
    },

    /**
     * Sets the value on the object at the specified path.
     *
     * @param  {string} key      Key of value to be set. Can also be
     *                           specified using dot notation to set
     *                           nested values. Ex: "content.title"
     * @param  {object} source   Source object.
     * @param  {mixed}  value    Value to be set on object at key.
     */
    set: function( key, source, value ) {
        if ( !key || !source ) {
            return;
        }

        const pList = key.split( "." ),
            len = pList.length;

        let schema = source;  // a moving reference to internal objects within obj

        for ( let i = 0; i < len-1; i++ ) {
            const elem = pList[ i ];

            if( !schema[ elem ] ) {
                schema[ elem ] = {};
            }

            if ( typeof schema[ elem ] !== "object" ) {
                return;
            }

            schema = schema[ elem ];
        }

        schema[ pList[ len-1 ] ] = value;
    },

    /****************************
     ****** STRING UTILS ********
     ****************************
     */
    replaceAll: function( str, mapObj ) {
        if ( !str || typeof str !== "string" || !mapObj || typeof mapObj !== "object" ) {
            return str;
        }

        const re = new RegExp( Object.keys( mapObj ).join( "|" ), "gi" );

        return str.replace( re, function( matched ) {
            return mapObj[ matched ];
        } );
    },
};

module.exports = utils;
