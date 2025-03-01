const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: [ 'Sales', 'Developer', 'IT', 'Designer' , 'Agency' ,'Lead'], 
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',  
  }],
});

module.exports = mongoose.model('Designation', DesignationSchema);
