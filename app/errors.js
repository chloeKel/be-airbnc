exports.handlePathNotFound = async (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.handleMethodNotAllowed = async (req, res, next) => {
  res.status(405).send({ msg: `${req.method} not allowed` });
};

exports.handleBadRequests = async (error, req, res, next) => {
  const sts = error.status || 400;
  const msg = error.msg || "Bad request";
  res.status(sts).send({ msg });
};

exports.handleInternalServerErrors = async (error, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
