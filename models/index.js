const mongoose = require('mongoose');
const dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/webcall";

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
	useUnifiedTopology: true
})
	.then(() => console.log("MongoDB successfully connected"))
	.catch(error => console.log(`MongoDB connection error: ${error}`));

module.exports = {

}