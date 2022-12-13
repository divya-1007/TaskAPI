class CustomErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg;
    }

    static wrongCredentials(message) {
        return new CustomErrorHandler(400, message);
    }
    static errorpasswordCompare(message){
        return new CustomErrorHandler(400, message);
    }
    static unAuthorized(message) {
        return new CustomErrorHandler(403, message);
    }
    static responseSend(message){
      return new CustomErrorHandler(200 ,{status:true,data:message })
    }
    static serverError(message) {
        return new CustomErrorHandler(500, message);
    }
}

module.exports = CustomErrorHandler;
