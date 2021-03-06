const Joi = require('joi');
const { REQUEST_PAYLOAD_TYPE, USER_ROLES } = require('./enums');

const { PASSWORD_MIN_LENGTH } = require('./config');

const validators = {};

function validateRequest(
    req,
    res,
    next,
    schema,
    requestPayloadType = REQUEST_PAYLOAD_TYPE.BODY
) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };

    const { error, value } = schema.validate(req[requestPayloadType], options);
    if (error) {
        res.status(400);
        next(
            new Error(
                `Validation error: ${error.details
                    .map((x) => x.message)
                    .join(', ')}`
            )
        );
    } else {
        req[requestPayloadType] = value;
        next();
    }
}

validators.validateUserRegistration = (req, res, next) => {
    const schema = Joi.object({
        wallet: Joi.string().trim().required(),
        signature: Joi.string().trim().required(),
        username: Joi.string().trim().required(),
        password: Joi.string().trim().min(PASSWORD_MIN_LENGTH).required(),
        confirmPassword: Joi.string()
            .trim()
            .valid(Joi.ref('password'))
            .required(),
        role: Joi.string()
            .valid(...Object.keys(USER_ROLES))
            .default(USER_ROLES.USER),
    });

    validateRequest(req, res, next, schema);
};

validators.validatePasswordReset = (req, res, next) => {
    const schema = Joi.object({
        wallet: Joi.string().trim().required(),
        signature: Joi.string().trim().required(),
        password: Joi.string().trim().min(PASSWORD_MIN_LENGTH).required(),
        confirmPassword: Joi.string()
            .trim()
            .valid(Joi.ref('password'))
            .required(),
    });

    validateRequest(req, res, next, schema);
};

validators.validateUserLogin = (req, res, next) => {
    const schema = Joi.object({
        usernameOrWallet: Joi.string().trim().required(),
        password: Joi.string().trim().required(),
    });

    validateRequest(req, res, next, schema);
};

validators.validateNftVerification = (req, res, next) => {
    const schema = Joi.object({
        mint: Joi.string().trim().required(),
    });

    validateRequest(req, res, next, schema, REQUEST_PAYLOAD_TYPE.PARAMS);
};

module.exports = validators;
