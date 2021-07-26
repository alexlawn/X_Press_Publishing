const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');

//// This middleware function will be called whenever there is seriesId parameter in the url
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE Series.id = $seriesId`,
    {
        $seriesId: seriesId
    },
    (err, series) => {
        if(err) {
            next(err);
        } else if(series) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404); // resource not found
        }
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

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

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if(!name || !description) {
        return res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`,
        {
            $name: name,
            $description: description
        },
        function(err){
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
                (err, newSeries) => {
                    res.status(201).json({series: newSeries});
                });
            }
        });
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if(!name || !description) {
        return res.sendStatus(400);
    } else {
        db.run(`UPDATE Series SET name = $name, description = $description`,
        {
            $name: name,
            $description: description
        },
        (err) => {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,
                (err, updatedSeries) => {
                    res.status(200).json({series: updatedSeries});
                });
            }
        });
    }
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE Issue.series_id = $seriesId`,
    {
        $seriesId: req.params.seriesId
    },
    (err, issue) => {
        if(err) {
            next(err);
        } else if(issue) {
            res.sendStatus(400); // bad request
        } else {
            db.run(`DELETE FROM Series WHERE Series.id = $seriesId`,
            {
                $seriesId: req.params.seriesId
            },
            (err) => {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204); // No content. The server successfully processed the request, and is not returning any content
                }
            });
        }
    });
});



module.exports = seriesRouter;