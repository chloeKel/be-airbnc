exports.handlePathNotFound = async (req, res) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.handleMethodNotAllowed = async (req, res) => {
  res.status(405).send({ msg: `${req.method} not allowed` });
};

exports.handleBadRequests = async (error, req, res, next) => {
  res.status(400).send({ msg: "Bad request" });
};

exports.handleInternalServerErrors = async (error, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
