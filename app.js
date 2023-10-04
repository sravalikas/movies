const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express(); // For JSON object to string.
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET API1 List all movies.
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie ORDER BY movie_id`;
  const moviesArray = await db.all(getMoviesQuery);
  const ans = (moviesArray) => {
    return {
      movieName: moviesArray.movie_name,
    };
  };
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );

  //response.send(moviesArray);
});

// POST API2 Add a movie Details.
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  //console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  //console.log(`${directorId}, ${movieName}, ${leadActor}`);
  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (
        ${directorId},
        '${movieName}',
        '${leadActor}'
      );`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// GET API3 Display a movie.
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieDetail = await db.get(getMovieQuery);
  response.send({
    movieId: movieDetail.movie_id,
    directorId: movieDetail.director_id,
    movieName: movieDetail.movie_name,
    leadActor: movieDetail.lead_actor,
  });
});

// PUT API4 Update a movie Details.
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE API5 Deleting a movie.
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET API6 List all Directors.
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director ORDER BY director_id`;
  const directorsArray = await db.all(getDirectorsQuery);
  const ans = (directorsArray) => {
    return {
      directorId: directorsArray.director_id,
      directorName: directorsArray.director_name,
    };
  };
  response.send(directorsArray.map((eachDirector) => ans(eachDirector)));
});

// GET API7 List Director Movie Names.
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
     *
    FROM
     movie
    WHERE
      director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  //response.send(moviesArray);
  const ans = (moviesArray) => {
    return {
      movieName: moviesArray.movie_name,
    };
  };
  response.send(moviesArray.map((eachPlayer) => ans(eachPlayer)));
});

module.exports = app;
