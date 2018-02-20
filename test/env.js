"use strict";

const TEST_DIR = "test";

module.exports = () => {
    const cwd = process.cwd();

    if ( !cwd.endsWith( "/" + TEST_DIR ) ) {
        process.chdir( TEST_DIR  +"/" );
    }
};
