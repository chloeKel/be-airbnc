exports.handlePathNotFound = async (req, res, next) => {
  res.status(404).send({ msg: "Oops! Invalid path. Head back to explore more 🏡✨" });
};

exports.handleMethodNotAllowed = async (req, res, next) => {
  res.status(405).send({ msg: `${req.method} not allowed` });
};

exports.handleBadRequests = async (error, req, res, next) => {
  if (error.code === "22P02" || error.code === "23502") {
    return res.status(400).send({ msg: "Bad request" });
  }

  if (error.code === "23503") {
    return res.status(404).send({ msg: "Does not exist" });
  }

  if (error.code === "23514" || error.code === "23P01") {
    return res.status(409).send({ msg: "Dates unavailable for booking" });
  }

  if (error.status) {
    return res.status(error.status).send({ msg: error.msg });
  }

  next(error);
};

exports.handleInternalServerErrors = async (error, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
