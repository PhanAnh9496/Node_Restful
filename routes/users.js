var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const usersModel = require('../models/usersModel');

/* Post users - Sign-up. */
router.post('/signup', function (req, res, next) {
	usersModel.find({email: req.body.email})
	.exec()
	.then(user => {
		if(user.length >= 1)
		{
			return res.status(409).json({
				message: 'Mail exists'
			});
		}
		else
		{
			bcrypt.hash(req.body.password, 10, (err, hash) => {
				if(err) {
					return res.status(500).json({
						error: err
					});
				} else {
					const user = new usersModel({
						_id: new mongoose.Types.ObjectId(),
						email: req.body.email,
						password: hash
					});
					user
						.save()
						.then(result => {
							console.log(result);
							res.status(201).json({
								message: 'User Created'
							});
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
				}
			});
		}
	});
});

/* Post users - Log-in. */
router.post('/login', function (req, res, next){
	usersModel.find({email: req.body.email})
	.exec()
	.then(user => {
		if(user.length < 1)
		{
			res.status(401).json({
				message: 'Auth failed'
			});
		}
		bcrypt.compare(req.body.password, user[0].password, (err, result) => {
			if(err)
			{
				res.status(401).json({
					message: 'Auth failed'
				});
			}
			if(result)
			{
				const token = jwt.sign({
					email: user[0].email,
					UserId: user[0]._id
				}, 'shhhhh');
				return res.status(200).json({
					message: 'Auth succesful',
					token: token
				});
			}
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
});


router.delete('/:UserId', function(req, res, next) {
	usersModel.remove({_id:req.params.UserId})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'User Deleted'
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
});

module.exports = router;