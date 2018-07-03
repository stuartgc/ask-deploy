"use strict"

/**
 * CONSTANTS
 *
 */

const constants = {
    FILE: {
        CONFIG: "config",
        MODEL: "en-US.json",
        SKILL: "skill.json",
        STRINGS: "en-us.js"
    },

    OPTIONS: {
        PERSIST_FILES: "persistFiles",
        SKIP_AUDIO_VALIDATION: "skipAudioValidation",
        TARGET: "target"
    },

    PATH: {
        ASK_CONFIG: ".ask/",
        CONFIG: "config/",
        MODEL: "models/",
        STRINGS: "lambda/custom/strings/"
    },

    TEMPLATE_EXTENSION: ".tpl",
    YML_EXTENSION: ".yml"
};

module.exports = constants;
