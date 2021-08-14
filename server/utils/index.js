/**
 * Response object
 * @param {func} response - HTTP response
 * @param {object} resObject - response object
 */
export const Response = (response, resObject) => {
  const { status, message, data } = resObject;
  if (status >= 300) {
    return response.status(status).json({ status, error: message });
  }
  return response.status(status).json({ status, message, data });
};

/**
 * Logger
 * @param {string} params - string you want to log out
 */
export const logger = (params) => {
  const log = console;
  log.table(params);
};

export const validateNewUser = (req, res, next) => {
  if (!req.body.username) {
    return Response(res, {
      status: 403,
      message: "Username is required",
    });
  }

  if (!req.body.email) {
    return Response(res, {
      status: 403,
      message: "email is required",
    });
  }

  next();
};

export const validateDeposit = (req, res, next) => {
  if (!req.params.userId) {
    return Response(res, {
      status: 403,
      message: "UserId is required in the parameter",
    });
  }

  if (!req.body.amount) {
    return Response(res, {
      status: 403,
      message: "Amount is required",
    });
  }

  next();
};

export const validateSendMoney = (req, res, next) => {
  if (!req.params.senderId) {
    return Response(res, {
      status: 403,
      message:
        "SenderId is required in the parameter as /:senderId/:receiverId",
    });
  }

  if (!req.params.receiverId) {
    return Response(res, {
      status: 403,
      message: "ReceiverId is required in the parameter",
    });
  }

  if (!req.body.amount) {
    return Response(res, {
      status: 403,
      message: "Amount is required",
    });
  }

  next();
};
