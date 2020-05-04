const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
	name: {
		type: String,
		required: [true, "Name is required"]
	},
	email: {
		type: String,
		required: [true, "Email is required"]
	},
	password: {
		type: String,
		required: [true, "Password is required"]
	}
})

UserSchema.set("toJSON", {
	transform: (doc, ret, opt) => {
		delete ret["password"];
		return ret
	}
})

const User = mongoose.model('User', UserSchema);

module.exports = User;