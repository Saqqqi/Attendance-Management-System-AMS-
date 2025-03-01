const mongoose = require('mongoose');

mongoose.set('debug', true);

mongoose.connect('your_connection_string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('Detailed error:', err);
});
