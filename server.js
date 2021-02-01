require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./movies-data-small.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

const validGenres = [`action`, `adventure`, `animation`, `biography`, `comedy`, `crime`, `documentary`,
                     `drama`, `fantasy`, `grotesque`, `history`, `horror`, `musical`, `romantic`,
                     `spy`, `thriller`, `war`, `western` ];

app.use(function validateBearerToken(req,res,next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if( !authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'});
    }

    next();
});

app.use(function validateGenre(req,res,next) {
    if(req.query.genre) {
        if(!validGenres.includes(req.query.genre.toLowerCase()) ) {
            return res.status(500).json({error: 'Invalid genre'});
        }
    }
});

app.get('/movie', function hangleGetMovie(req,res) {
    let response = MOVIEDEX;

    if(req.query.genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        );
    }

    if(req.query.country) {
        response = response.filter(movie =>
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        );
    }

    if(req.query.avg_vote) {
        response = response.filter(movie =>
            Number(movie.avg_vote) >= Number(req.query.avg_vote)
        );
    }

    res.json(response);
});

app.use( (error, req,res,next) => {
    let response;
    if(process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error'} };
    }
    else {
        response = {error};
    }
    res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {});

