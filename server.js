const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ 
    path: './config/config.env' 
});

const connectDB = require('./config/db');

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.json({
    extended: false
}));

connectDB();


// https://localhost:3000/api/users/auth/register

app.use('/api/users/auth', require('./routes/user'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(colors.red.underline.bold(`Server is running on port: ${PORT}`));
});