const { body, validationResult } = require('express-validator');

exports.user_Validation = () => {
    return [
        body('firstName').not().isEmpty().withMessage('First Name Cannot Be Empty'),
        body('lastName', 'Last Name  Cannot Be Empty').not().isEmpty(),
        body('email', 'email Cannot Be Empty').not().isEmpty(),
        body('gender', 'Gender Cannot Be Empty').not().isEmpty(),
        body('password', 'Password Cannot Be Empty').not().isEmpty(),
    ]
};

exports.loginVali = () => {
    return [
        body('email', 'email Cannot Be Empty').not().isEmpty(),
        body('password', 'Password Cannot Be Empty').not().isEmpty(),
    ]
};

exports.user_Update = () => {
    return [
        body('firstName').not().isEmpty().withMessage('First Name Cannot Be Empty'),
        body('lastName', 'Last Name  Cannot Be Empty').not().isEmpty(),
        body('gender', 'Gender Cannot Be Empty').not().isEmpty(),

    ]
};

exports.update_User = () => {
    return [
        body('name').not().isEmpty().withMessage('name Cannot Be Empty'),
        body('number', 'Number Number Cannot Be Empty').not().isEmpty(),
    ]
}


exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }

    let errNEW = errors.errors
    let custArr = {}

    for (index in errNEW) {
        let keyname = errNEW[index].param
        let msgNew = errNEW[index].msg
        custArr[keyname] = msgNew
    }

    return res.status(200).json({
        status: 3,
        msgType: 'error',
        message: 'validation error',
        errors: custArr,
    });
};