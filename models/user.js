const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const userSchema = new Schema({
    firstName: {type: String, required: [true, 'First name is required!']},
    lastName: {type: String, required: [true, 'Last name is required!']},
    email: { type: String, required: [true, 'Email address is required!'], unique: [true, 'This email address has been used!'] },
    password: { type: String, required: [true, 'Password is required!'], minlength:[8,'Password should be atleast of 8 characters'] },
    role:{ type: String, default: 'User', required: [true, 'Role is required!']},
    city:{type: String, required: [true, 'City is required!']},
});

userSchema.pre('save', function(next){
  let user = this;
  if (!user.isModified('password'))
      return next();
  bcrypt.hash(user.password, 10)
  .then(hash => {
    user.password = hash;
    next();
  })
  .catch(err => next(error));
});


userSchema.methods.comparePassword = function(inputPassword) {
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
}

module.exports = mongoose.model('User', userSchema);