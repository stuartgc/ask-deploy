"use strict";

/**
 * ENUMS
 *
 */

const enums = {
    endpointType: {
        LAMBDA: "lambda",
        LOCAL: "local"
    },

    error: {
        NO_ASK_CLI: "No ask-cli"
    },

    configKey: {
        LAMBDA_ARN: "lambdaArn",
        LOCAL_URI: "localUri",
        SKILL_ID: "skillId",
        SKILL_INVOCATION: "skillInvocation",
        SKILL_NAME: "skillName"
    }
};

module.exports = enums;
