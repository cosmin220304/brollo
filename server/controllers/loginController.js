const users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const loginController = async (req, res) => {
    await users.findOne({ $or: [{ Email: req.body.Email }, { Username: req.body.Email }] }, (err, data) => {
        if (err)
            res.json({ success: false, message: err })
        else if (!data)
            res.json({ success: false, message: `Can't find username/email` })
        else {
            bcrypt.compare(req.body.Password, data.Password, function (err, result) {
                if (result) {
                    if (data.Verified) {
                        var token = jwt.sign({ Email: data.Email, Username: data.Username, 'First Name': data['First Name'], 'Last Name': data['Last Name'], Verified: data.Verified, Friends: data.Friends, Boards: data.Boards }, process.env.secretToken || require('../secrets/jwt-token'), { expiresIn: "30d" });
                        res.cookie('access_token', token, {
                            maxAge: 2592000000,  // 30 days
                            httpOnly: true
                        })
                        res.json({ success: true, Verified: true, message: 'Success' })
                    }
                    else
                        res.json({ success: true, Verified: false, message: `Your account has not been verified` })
                } else {
                    res.json({ success: false, message: 'Wrong Password!' })
                }

            });
        }
    })

}

module.exports = loginController
