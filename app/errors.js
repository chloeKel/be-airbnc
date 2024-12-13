exports.handlePathNotFound = async (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.handleMethodNotAllowed = async (req, res, next) => {
  res.status(405).send({ msg: `${req.method} not allowed` });
};

exports.handleBadRequests = async (error, req, res, next) => {
  if (error.code === "23514" || error.code === "23P01") {
    error.status = 409;
    error.msg = "Dates unavailable for booking";
  }

  const sts = error.status || 400;
  const msg = error.msg || "Bad request";
  res.status(sts).send({ msg });
};

exports.handleInternalServerErrors = async (error, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
