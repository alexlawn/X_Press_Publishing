const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`,
    (err, series) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({series: series}); // successful HTTP request
        }
    });
});


module.exports = seriesRouter;