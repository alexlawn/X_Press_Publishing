const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// This middleware function will be called whenever there is an artistId parameter in a url
artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', 
    {
        $artistId: artistId
    }, (err, artist) => {
        if(err){
            next(err);
        } else if(artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    return res.status(200).json({artist: req.artist});
});

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1',
    (err, artists) => {
        if(err){
            next(err); // Passes the error to the next middleware function in server.js which is "app.use(errorHandler());"
        }else{
            res.status(200).json({artists: artists});
        }
    });
});

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if(!name || !dateOfBirth || !biography) {
        return res.sendStatus(400); // Bad request
    } else {
        db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)',
        {
            $name: name,
            $dateOfBirth: dateOfBirth,
            $biography: biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
        }, (err) => {
            if(err) {
                next(err);
            } else {
                db.get('SELECT * FROM Artist WHERE Artist.id = ${this.lastID}',
                (err, newArtist) => {
                    res.status(201).json({artist: newArtist});
                });
            }
            }
        );
    }
});


module.exports = artistsRouter;